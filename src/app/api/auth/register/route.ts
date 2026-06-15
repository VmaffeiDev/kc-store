import { hash } from "argon2";
import { registerSchema } from "@/lib/validation";
import { getPrisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";
import { queueEmail } from "@/services/email";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const prisma = getPrisma();
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) {
      return Response.json({ error: "E-mail ja cadastrado." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, { type: 2 }),
        role: "CUSTOMER",
        customer: {
          create: {
            name: input.name,
            email: input.email,
            marketingConsent: input.marketingConsent,
            marketingConsentAt: input.marketingConsent ? new Date() : null,
          },
        },
      },
    });
    await queueEmail({
      to: user.email,
      subject: "Bem-vindo a K&C STORE",
      template: "welcome",
      payload: { message: `Ola, ${user.name}. Seu cadastro foi criado.` },
    });
    return Response.json({ id: user.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
