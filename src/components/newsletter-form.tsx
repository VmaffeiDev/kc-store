"use client";

import { useState } from "react";
import { PiArrowRight } from "react-icons/pi";

export function NewsletterForm() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="flex"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.get("email") }),
        });
        setMessage(response.ok ? "Cadastro realizado." : "Configure o banco para ativar.");
      }}
    >
      <div className="w-full">
        <div className="flex">
          <input name="email" type="email" required aria-label="Seu e-mail" placeholder="seu@email.com" className="h-11 min-w-0 flex-1 bg-white px-3 text-sm text-[#18211e]" />
          <button aria-label="Cadastrar e-mail" className="grid size-11 place-items-center bg-[#b75432]">
            <PiArrowRight />
          </button>
        </div>
        <p aria-live="polite" className="mt-2 text-xs text-white/60">{message}</p>
      </div>
    </form>
  );
}
