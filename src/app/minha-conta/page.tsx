import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="container-store py-20 text-center">
        <h1 className="font-display text-6xl">Minha conta</h1>
        <p className="mt-4 text-sm text-[#6f746f]">Entre para acompanhar seus pedidos e preferencias.</p>
        <Link href="/entrar" className="button-primary mt-7">Entrar</Link>
      </div>
    );
  }
  return (
    <div className="container-store py-14">
      <p className="section-kicker">Area do cliente</p>
      <h1 className="font-display mt-2 text-6xl">Ola, {session.user.name}</h1>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="surface p-6"><h2 className="font-display text-3xl">Pedidos</h2><p className="mt-2 text-sm text-[#6f746f]">Seu historico aparecera aqui apos a primeira compra.</p></div>
        <div className="surface p-6"><h2 className="font-display text-3xl">Dados</h2><p className="mt-2 text-sm text-[#6f746f]">{session.user.email}</p></div>
        <div className="surface p-6"><h2 className="font-display text-3xl">Promocoes</h2><p className="mt-2 text-sm text-[#6f746f]">Gerencie seu consentimento de comunicacao.</p></div>
      </div>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="button-secondary mt-8">Sair</button></form>
    </div>
  );
}
