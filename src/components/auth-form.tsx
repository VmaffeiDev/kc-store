"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="surface grid gap-4 p-7"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        const data = new FormData(event.currentTarget);
        const email = String(data.get("email"));
        const password = String(data.get("password"));
        if (mode === "register") {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.get("name"),
              email,
              password,
              marketingConsent: data.get("marketingConsent") === "on",
            }),
          });
          const body = await response.json();
          if (!response.ok) {
            setMessage(body.error ?? "Nao foi possivel cadastrar.");
            setLoading(false);
            return;
          }
        }
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setMessage("Confira e-mail e senha. O banco deve estar configurado.");
          setLoading(false);
          return;
        }
        router.push("/minha-conta");
        router.refresh();
      }}
    >
      {mode === "register" && <label className="text-xs font-bold">Nome<input name="name" required className="input-store mt-2" /></label>}
      <label className="text-xs font-bold">E-mail<input name="email" type="email" required className="input-store mt-2" /></label>
      <label className="text-xs font-bold">Senha<input name="password" type="password" minLength={8} required className="input-store mt-2" /></label>
      {mode === "register" && (
        <label className="flex items-start gap-3 text-xs leading-5 text-[#5c625e]">
          <input name="marketingConsent" type="checkbox" className="mt-1" />
          Quero receber lancamentos e promocoes. Posso cancelar quando quiser.
        </label>
      )}
      <button disabled={loading} className="button-primary mt-2">{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar cadastro"}</button>
      <p aria-live="polite" className="text-center text-xs text-[#8d3f27]">{message}</p>
    </form>
  );
}
