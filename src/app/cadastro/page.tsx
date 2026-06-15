import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="container-store grid min-h-[680px] place-items-center py-14">
      <div className="w-full max-w-md">
        <p className="section-kicker text-center">Sua K&amp;C STORE</p>
        <h1 className="font-display mt-2 text-center text-6xl">Criar cadastro</h1>
        <p className="mt-3 text-center text-sm text-[#6f746f]">Acompanhe pedidos e receba novidades com seu consentimento.</p>
        <div className="mt-8"><AuthForm mode="register" /></div>
        <p className="mt-5 text-center text-sm">Ja possui conta? <Link href="/entrar" className="font-bold text-[#0d4638] underline">Entrar</Link></p>
      </div>
    </div>
  );
}
