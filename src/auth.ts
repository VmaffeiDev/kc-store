import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "argon2";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/entrar" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        if (!process.env.DATABASE_URL) {
          const previewEmail = process.env.PREVIEW_ADMIN_EMAIL?.toLowerCase();
          const previewPassword = process.env.PREVIEW_ADMIN_PASSWORD;
          if (!previewEmail || !previewPassword) return null;
          const suppliedEmail = parsed.data.email.toLowerCase();
          const suppliedPassword = parsed.data.password;
          const emailMatches =
            suppliedEmail.length === previewEmail.length &&
            timingSafeEqual(
              Buffer.from(suppliedEmail),
              Buffer.from(previewEmail),
            );
          const passwordMatches =
            suppliedPassword.length === previewPassword.length &&
            timingSafeEqual(
              Buffer.from(suppliedPassword),
              Buffer.from(previewPassword),
            );
          if (!emailMatches || !passwordMatches) return null;
          return {
            id: "preview-owner",
            name: process.env.PREVIEW_ADMIN_NAME ?? "Administracao K&C STORE",
            email: previewEmail,
            role: "OWNER",
          };
        }

        const user = await getPrisma().user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user?.passwordHash || !user.active) return null;
        if (!(await verify(user.passwordHash, parsed.data.password))) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as "OWNER" | "STAFF" | "CUSTOMER";
      }
      return session;
    },
  },
});
