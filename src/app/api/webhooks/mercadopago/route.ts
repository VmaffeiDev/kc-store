import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import {
  getPayment,
  validateMercadoPagoSignature,
} from "@/services/mercado-pago";
import { queueEmail } from "@/services/email";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string | number;
      type?: string;
      data?: { id?: string };
    };
    const dataId = String(body.data?.id ?? body.id ?? "");
    if (!dataId || !validateMercadoPagoSignature(request, dataId)) {
      return Response.json({ error: "Assinatura invalida." }, { status: 401 });
    }

    const eventId = `${body.type ?? "payment"}:${dataId}`;
    const prisma = getPrisma();
    const existing = await prisma.webhookEvent.findUnique({
      where: {
        provider_externalId_eventType: {
          provider: "MERCADO_PAGO",
          externalId: dataId,
          eventType: eventId,
        },
      },
    });
    if (existing?.processedAt) return Response.json({ ok: true, duplicate: true });

    const event =
      existing ??
      (await prisma.webhookEvent.create({
        data: {
          provider: "MERCADO_PAGO",
          externalId: dataId,
          eventType: eventId,
          payload: body,
        },
      }));
    const payment = await getPayment(dataId);
    const order = await prisma.order.findUnique({
      where: { id: payment.external_reference },
    });
    if (!order) throw new Error("Pedido nao localizado.");

    const statusMap = {
      approved: { paymentStatus: "APPROVED", orderStatus: "PAID" },
      pending: { paymentStatus: "PENDING", orderStatus: "AWAITING_PAYMENT" },
      in_process: { paymentStatus: "PENDING", orderStatus: "AWAITING_PAYMENT" },
      rejected: { paymentStatus: "REJECTED", orderStatus: "CANCELLED" },
      cancelled: { paymentStatus: "CANCELLED", orderStatus: "CANCELLED" },
      refunded: { paymentStatus: "REFUNDED", orderStatus: "CANCELLED" },
    } as const;
    const nextStatus = statusMap[payment.status as keyof typeof statusMap];
    if (nextStatus) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            ...nextStatus,
            mercadoPagoPaymentId: String(payment.id),
            paymentUpdatedAt: new Date(payment.date_last_updated),
          },
        });
        if (payment.status === "approved") {
          const reservations = await tx.inventoryReservation.findMany({
            where: { orderId: order.id, status: "ACTIVE" },
          });
          for (const reservation of reservations) {
            await tx.productVariant.update({
              where: { id: reservation.variantId },
              data: { stock: { decrement: reservation.quantity } },
            });
          }
          await tx.inventoryReservation.updateMany({
            where: { orderId: order.id, status: "ACTIVE" },
            data: { status: "CONSUMED" },
          });
        } else if (["rejected", "cancelled"].includes(payment.status)) {
          await tx.inventoryReservation.updateMany({
            where: { orderId: order.id, status: "ACTIVE" },
            data: { status: "RELEASED" },
          });
        }
        await tx.webhookEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date() },
        });
      });
      await queueEmail({
        to: order.customerEmail,
        subject:
          payment.status === "approved"
            ? `Pagamento aprovado - ${order.number}`
            : `Atualizacao do pedido ${order.number}`,
        template: `payment-${payment.status}`,
        payload: {
          message:
            payment.status === "approved"
              ? "Pagamento confirmado. Vamos preparar seu pedido para postagem em ate cinco dias uteis."
              : `Status do pagamento: ${payment.status}.`,
        },
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
