import { requireRole } from "@/lib/authorization";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import { purchaseLabel } from "@/services/melhor-envio";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireRole(["OWNER", "STAFF"]);
    const { id } = await context.params;
    const shipment = await getPrisma().shipment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!shipment || shipment.order.paymentStatus !== "APPROVED") {
      throw new Error("Envio pago nao encontrado.");
    }
    const label = await purchaseLabel(shipment.orderId);
    const updated = await getPrisma().shipment.update({
      where: { id },
      data: {
        externalOrderId: String(label.id),
        status: "PURCHASED",
      },
    });
    await getPrisma().auditLog.create({
      data: {
        actorId: actor.id,
        action: "SHIPMENT_LABEL_PURCHASED",
        entity: "Shipment",
        entityId: id,
      },
    });
    return Response.json(updated);
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
