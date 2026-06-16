import { auth } from "@/auth";

export async function requireRole(roles: Array<"OWNER" | "STAFF" | "CUSTOMER">) {
  const session = await auth();
  if (!session?.user || !roles.includes(session.user.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
