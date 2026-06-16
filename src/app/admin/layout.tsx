import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = !process.env.DATABASE_URL;
  const session = await auth();
  if (!session?.user || !["OWNER", "STAFF"].includes(session.user.role)) {
    redirect("/entrar?callbackUrl=/admin/dashboard");
  }
  return <AdminShell demo={demo}>{children}</AdminShell>;
}
