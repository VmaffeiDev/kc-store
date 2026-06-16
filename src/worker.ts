import { getPrisma } from "@/lib/prisma";
import { processEmailOutbox } from "@/services/email";

async function releaseExpiredReservations() {
  if (!process.env.DATABASE_URL) return 0;
  const result = await getPrisma().inventoryReservation.updateMany({
    where: { status: "ACTIVE", expiresAt: { lte: new Date() } },
    data: { status: "EXPIRED" },
  });
  return result.count;
}

async function tick() {
  try {
    const released = await releaseExpiredReservations();
    const emails = await processEmailOutbox();
    console.log(JSON.stringify({ level: "info", event: "worker_tick", released, emails }));
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "worker_error",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

void tick();
setInterval(() => void tick(), 30_000);
