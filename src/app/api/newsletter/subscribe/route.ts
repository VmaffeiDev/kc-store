import { z } from "zod";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";

const schema = z.object({ email: z.email() });

export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const prisma = getPrisma();
    const existing = await prisma.customerProfile.findFirst({ where: { email } });
    if (existing) {
      await prisma.customerProfile.update({
        where: { id: existing.id },
        data: {
          marketingConsent: true,
          marketingConsentAt: new Date(),
          marketingUnsubscribed: null,
        },
      });
    } else {
      await prisma.customerProfile.create({
        data: {
          name: "Cliente K&C STORE",
          email,
          marketingConsent: true,
          marketingConsentAt: new Date(),
        },
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
