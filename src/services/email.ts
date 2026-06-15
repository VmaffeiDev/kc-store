import "server-only";

import { Resend } from "resend";
import { getPrisma } from "@/lib/prisma";

export async function queueEmail(input: {
  to: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
}) {
  if (!process.env.DATABASE_URL) return;
  await getPrisma().emailOutbox.create({
    data: {
      ...input,
      payload: JSON.parse(JSON.stringify(input.payload)),
    },
  });
}

export async function processEmailOutbox(limit = 10) {
  if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY) return 0;
  const prisma = getPrisma();
  const jobs = await prisma.emailOutbox.findMany({
    where: { status: "PENDING", availableAt: { lte: new Date() } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const job of jobs) {
    await prisma.emailOutbox.update({
      where: { id: job.id },
      data: { status: "PROCESSING", attempts: { increment: 1 } },
    });
    try {
      const payload = job.payload as Record<string, unknown>;
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "K&C STORE <pedidos@example.com>",
        to: job.to,
        subject: job.subject,
        html: `<div style="font-family:Arial,sans-serif;color:#18211e"><h1 style="color:#145a46">K&amp;C STORE</h1><p>${String(payload.message ?? job.subject)}</p><p>Estilo para todos os momentos.</p></div>`,
      });
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: { status: "SENT", sentAt: new Date(), error: null },
      });
    } catch (error) {
      await prisma.emailOutbox.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Falha ao enviar",
          availableAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }
  }
  return jobs.length;
}
