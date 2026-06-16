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
    });
    if (!order?.mercadoPagoPaymentId || order.paymentStatus !== "APPROVED") {
      throw new Error("Pedido pago nao encontrado.");
    }
    if (order.mercadoPagoRefundId) {
      throw new Error("O reembolso deste pedido ja foi solicitado.");
    }
    const refund = await refundPayment(
      order.mercadoPagoPaymentId,
      `refund-${order.id}`,
    );
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          mercadoPagoRefundId: String(refund.id),
          notes: [order.notes, "Reembolso integral solicitado ao Mercado Pago."]
            .filter(Boolean)
            .join("\n"),
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "ORDER_REFUND_REQUESTED",
          entity: "Order",
          entityId: order.id,
          metadata: { refundId: refund.id, refundStatus: refund.status },
        },
      });
    });
    await queueEmail({
      to: order.customerEmail,
      subject: `Reembolso solicitado - ${order.number}`,
      template: "order-refund-requested",
      payload: {
        message:
          "Seu reembolso integral foi solicitado. Enviaremos uma nova confirmacao quando o Mercado Pago concluir o estorno.",
      },
    });
    return Response.json({
      ok: true,
      refundId: refund.id,
      status: refund.status,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json(
      { error: message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
