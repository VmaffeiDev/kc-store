import { StatusPage } from "@/components/status-page";
export default async function Page({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) { return <StatusPage kind="failure" order={(await searchParams).pedido} />; }
