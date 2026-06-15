import { nanoid } from "nanoid";
import { checkoutSchema } from "@/lib/validation";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import { createPreference } from "@/services/mercado-pago";
import { queueEmail } from "@/services/email";
import { availableStock, calculateDiscount } from "@/lib/commerce";

export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await request.json());
    const prisma = getPrisma();
    const orderNumber = `KC${new Date().toISOString().slice(2, 10).replaceAll("-", "")}${nanoid(5).toUpperCase()}`;
    const idempotencyKey = crypto.randomUUID();

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: input.items.map((item) => item.variantId) },
        active: true,
        product: { isActive: true },
      },
      include: {
        product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
        reservations: {
          where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
        },
      },
    });
    if (variants.length !== input.items.length) {
      return Response.json({ error: "Um item nao esta disponivel." }, { status: 409 });
    }

    const normalizedItems = input.items.map((item) => {
      const variant = variants.find((candidate) => candidate.id === item.variantId);
      if (!variant || variant.productId !== item.productId) {
        throw new Error("Variante invalida.");
      }
      if (availableStock(variant.stock, variant.reservations) < item.quantity) {
        throw new Error(`${variant.product.name} sem estoque suficiente.`);
      }
      const unitPrice = Number(
        variant.product.promotionalPrice ?? variant.product.price,
      );
      return { item, variant, unitPrice };
    });

    const subtotal = normalizedItems.reduce(
      (sum, entry) => sum + entry.unitPrice * entry.item.quantity,
      0,
    );
    let coupon:
      | {
          id: string;
          discountType: "PERCENTAGE" | "FIXED";
          discountValue: unknown;
          minimumValue: unknown;
        }
      | null = null;
    let discount = 0;
    if (input.couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: input.couponCode.toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (!coupon) throw new Error("Cupom invalido ou expirado.");
      const value = Number(coupon.discountValue);
      discount = calculateDiscount(
        subtotal,
        coupon.discountType,
        value,
        Number(coupon.minimumValue ?? 0),
      );
    }
    const total = Math.max(0, subtotal - discount + input.shipping.price);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const order = await prisma.$transaction(async (tx) => {
      for (const variantId of [...new Set(input.items.map((item) => item.variantId))].sort()) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${variantId}))`;
      }
      const lockedVariants = await tx.productVariant.findMany({
        where: { id: { in: input.items.map((item) => item.variantId) } },
        include: {
          reservations: {
            where: { status: "ACTIVE", expiresAt: { gt: new Date() } },
          },
        },
      });
      for (const item of input.items) {
        const variant = lockedVariants.find((candidate) => candidate.id === item.variantId);
        if (!variant || availableStock(variant.stock, variant.reservations) < item.quantity) {
          throw new Error("O estoque mudou durante o checkout. Revise o carrinho.");
        }
      }
      const customer = await tx.customerProfile.findFirst({
        where: { email: input.customer.email },
      });
      const created = await tx.order.create({
        data: {
          number: orderNumber,
          customerId: customer?.id,
          customerName: input.customer.name,
          customerEmail: input.customer.email,
          customerPhone: input.customer.phone,
          customerDocument: input.customer.document,
          addressLine1: input.address.line1,
          addressLine2: input.address.line2,
          district: input.address.district,
          city: input.address.city,
          state: input.address.state.toUpperCase(),
          postalCode: input.address.postalCode,
          subtotal,
          discount,
          shipping: input.shipping.price,
          total,
          couponId: coupon?.id,
          idempotencyKey,
          items: {
            create: normalizedItems.map(({ item, variant, unitPrice }) => ({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              productSlug: variant.product.slug,
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              imageUrl: variant.product.images[0]?.url,
              quantity: item.quantity,
              unitPrice,
              totalPrice: unitPrice * item.quantity,
            })),
          },
          reservations: {
            create: normalizedItems.map(({ item, variant }) => ({
              variantId: variant.id,
              quantity: item.quantity,
              expiresAt,
            })),
          },
          shipment: {
            create: {
              serviceId: input.shipping.serviceId,
              serviceName: input.shipping.serviceName,
              price: input.shipping.price,
              deliveryDays: input.shipping.deliveryDays,
            },
          },
        },
        include: { items: true },
      });
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }
      return created;
    }, { isolationLevel: "Serializable" });

    try {
      const preference = await createPreference({
        orderId: order.id,
        orderNumber: order.number,
        customerEmail: order.customerEmail,
        total,
        items: order.items.map((item) => ({
          id: item.sku,
          title: `${item.productName} - ${item.size}/${item.color}`,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })),
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { mercadoPagoPreferenceId: preference.id },
      });
      await queueEmail({
        to: order.customerEmail,
        subject: `Pedido ${order.number} recebido`,
        template: "order-created",
        payload: {
          message: `Recebemos seu pedido ${order.number}. O estoque esta reservado por 30 minutos enquanto aguardamos o pagamento.`,
        },
      });
      return Response.json({
        orderId: order.id,
        orderNumber: order.number,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        expiresAt,
      });
    } catch (error) {
      await prisma.inventoryReservation.updateMany({
        where: { orderId: order.id, status: "ACTIVE" },
        data: { status: "RELEASED" },
      });
      throw error;
    }
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
