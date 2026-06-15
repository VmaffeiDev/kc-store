import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import {
  getPayment,
  validateMercadoPagoSignature,
} from "@/services/mercado-pago";
import { queueEmail } from "@/services/email";
import { isNewerPaymentUpdate } from "@/lib/mercado-pago";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      id?: string | number;
      type?: string;
      data?: { id?: string };
    };
    const url = new URL(request.url);
    const signatureDataId = url.searchParams.get("data.id");
    const dataId = String(signatureDataId ?? body.data?.id ?? body.id ?? "");
    if (!dataId || !validateMercadoPagoSignature(request, signatureDataId)) {
      return Response.json({ error: "Assinatura invalida." }, { status: 401 });
    }

    const eventType = body.action ?? body.type ?? "payment.updated";
    if (!eventType.startsWith("payment")) {
      return Response.json({ ok: true, ignored: true });
    }
    const notificationId = String(
      body.id ?? request.headers.get("x-request-id") ?? `${eventType}:${dataId}`,
    );

    const prisma = getPrisma();
    const event = await prisma.webhookEvent.upsert({
      where: {
        provider_externalId_eventType: {
          provider: "MERCADO_PAGO",
          externalId: notificationId,
          eventType,
        },
      },
      update: {},
      create: {
        provider: "MERCADO_PAGO",
        externalId: notificationId,
        eventType,
        payload: {
          body,
          query: Object.fromEntries(url.searchParams),
        },
      },
    });
    if (event.processedAt) {
      return Response.json({ ok: true, duplicate: true });
    }

    const payment = await getPayment(dataId);
    const incomingUpdatedAt = new Date(payment.date_last_updated);
    if (Number.isNaN(incomingUpdatedAt.getTime())) {
      throw new Error("Pagamento sem data de atualizacao valida.");
    }

    const outcome = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"mercadopago:" + dataId}))`;
      const lockedEvent = await tx.webhookEvent.findUnique({
        where: { id: event.id },
      });
      if (lockedEvent?.processedAt) {
        return { duplicate: true, statusChanged: false, order: null };
      }

      const order = await tx.order.findUnique({
        where: { id: payment.external_reference },
      });
      if (!order) throw new Error("Pedido nao localizado.");
      if (payment.currency_id !== "BRL") {
        throw new Error("Moeda do pagamento nao confere com o pedido.");
      }
      if (
        Math.abs(Number(order.total) - Number(payment.transaction_amount)) >
        0.001
      ) {
        throw new Error("Valor do pagamento nao confere com o pedido.");
      }
      if (!isNewerPaymentUpdate(order.paymentUpdatedAt, incomingUpdatedAt)) {
        await tx.webhookEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date(), error: "Evento fora de ordem." },
        });
        return { duplicate: false, statusChanged: false, order };
      }

      const statusMap = {
        approved: { paymentStatus: "APPROVED", orderStatus: "PAID" },
        pending: { paymentStatus: "PENDING", orderStatus: "AWAITING_PAYMENT" },
        in_process: {
          paymentStatus: "PENDING",
          orderStatus: "AWAITING_PAYMENT",
        },
        rejected: { paymentStatus: "REJECTED", orderStatus: "CANCELLED" },
        cancelled: { paymentStatus: "CANCELLED", orderStatus: "CANCELLED" },
        refunded: { paymentStatus: "REFUNDED", orderStatus: "CANCELLED" },
      } as const;
      const nextStatus = statusMap[payment.status as keyof typeof statusMap];
      if (!nextStatus) {
        await tx.webhookEvent.update({
          where: { id: event.id },
          data: {
            processedAt: new Date(),
            error: `Status ignorado: ${payment.status}`,
          },
        });
        return { duplicate: false, statusChanged: false, order };
      }

      const statusChanged = order.paymentStatus !== nextStatus.paymentStatus;
      const isInvalidDowngrade =
        order.paymentStatus === "REFUNDED" ||
        (order.paymentStatus === "APPROVED" &&
          nextStatus.paymentStatus !== "REFUNDED");

      if (!isInvalidDowngrade) {
        if (statusChanged && payment.status === "approved") {
          const reservations = await tx.inventoryReservation.findMany({
            where: { orderId: order.id, status: "ACTIVE" },
          });
          if (!reservations.length) {
            throw new Error("Reserva de estoque expirada antes do pagamento.");
          }
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
        } else if (statusChanged && payment.status === "refunded") {
          const consumedReservations =
            await tx.inventoryReservation.findMany({
              where: { orderId: order.id, status: "CONSUMED" },
            });
          for (const reservation of consumedReservations) {
            await tx.productVariant.update({
              where: { id: reservation.variantId },
              data: { stock: { increment: reservation.quantity } },
            });
          }
          await tx.inventoryReservation.updateMany({
            where: { orderId: order.id, status: "CONSUMED" },
            data: { status: "RELEASED" },
          });
        } else if (
          statusChanged &&
          ["rejected", "cancelled"].includes(payment.status)
        ) {
          await tx.inventoryReservation.updateMany({
            where: { orderId: order.id, status: "ACTIVE" },
            data: { status: "RELEASED" },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            ...nextStatus,
            mercadoPagoPaymentId: String(payment.id),
            paymentUpdatedAt: incomingUpdatedAt,
          },
        });
      }

      await tx.webhookEvent.update({
        where: { id: event.id },
        data: {
          processedAt: new Date(),
          error: isInvalidDowngrade ? "Transicao de status ignorada." : null,
        },
      });
      return {
        duplicate: false,
        statusChanged: statusChanged && !isInvalidDowngrade,
        order,
      };
    });

    if (outcome.duplicate) {
      return Response.json({ ok: true, duplicate: true });
    }
    if (outcome.statusChanged && outcome.order) {
      await queueEmail({
        to: outcome.order.customerEmail,
        subject:
          payment.status === "approved"
            ? `Pagamento aprovado - ${outcome.order.number}`
            : payment.status === "refunded"
              ? `Reembolso confirmado - ${outcome.order.number}`
              : `Atualizacao do pedido ${outcome.order.number}`,
        template: `payment-${payment.status}`,
        payload: {
          message:
            payment.status === "approved"
              ? "Pagamento confirmado. Vamos preparar seu pedido para postagem em ate cinco dias uteis."
              : payment.status === "refunded"
                ? "Seu reembolso integral foi confirmado e o pedido foi cancelado."
                : `Status do pagamento: ${payment.status}.`,
        },
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return Response.json({ error: message }, { status: 400 });
  }
}
