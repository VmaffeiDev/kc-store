import { requireRole } from "@/lib/authorization";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import { refundPayment } from "@/services/mercado-pago";
import { queueEmail } from "@/services/email";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireRole(["OWNER"]);
    const { id } = await context.params;
    const prisma = getPrisma();
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order?.mercadoPagoPaymentId || order.paymentStatus !== "APPROVED") {
      throw new Error("Pedido pago nao encontrado.");
    }
    const refund = await refundPayment(
      order.mercadoPagoPaymentId,
      `refund-${order.id}`,
    );
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "REFUNDED",
          orderStatus: "CANCELLED",
          mercadoPagoRefundId: String(refund.id),
        },
      });
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "ORDER_REFUNDED",
          entity: "Order",
          entityId: order.id,
          metadata: { refundId: refund.id },
        },
      });
    });
    await queueEmail({
      to: order.customerEmail,
      subject: `Reembolso confirmado - ${order.number}`,
      template: "order-refunded",
      payload: { message: "Seu reembolso integral foi solicitado com sucesso." },
    });
    return Response.json({ ok: true, refundId: refund.id });
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
