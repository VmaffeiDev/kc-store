import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    database: process.env.DATABASE_URL ? "checking" : "not_configured",
  };
  if (process.env.DATABASE_URL) {
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }
  }
  const healthy = checks.app === "ok" && checks.database !== "error";
  return Response.json(
    { status: healthy ? "ok" : "degraded", checks, timestamp: new Date() },
    { status: healthy ? 200 : 503 },
  );
}
