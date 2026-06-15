import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="container-store grid min-h-[620px] place-items-center py-14">
      <div className="w-full max-w-md">
        <p className="section-kicker text-center">Bem-vindo de volta</p>
        <h1 className="font-display mt-2 text-center text-6xl">Entrar</h1>
        <div className="mt-8"><AuthForm mode="login" /></div>
        <p className="mt-5 text-center text-sm">Ainda nao tem cadastro? <Link href="/cadastro" className="font-bold text-[#0d4638] underline">Criar conta</Link></p>
      </div>
    </div>
  );
}
