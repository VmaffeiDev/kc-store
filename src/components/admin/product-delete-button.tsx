"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PiTrash } from "react-icons/pi";

async function getResponseError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error ?? "Nao foi possivel excluir o produto.";
}

export function ProductDeleteButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Excluir ${productName}`}
      disabled={loading}
      className="grid size-9 place-items-center border text-[#a54c30] disabled:opacity-50"
      onClick={async () => {
        const confirmed = window.confirm(
          `Excluir "${productName}" da loja? Esta acao tira o produto da vitrine.`,
        );
        if (!confirmed) return;
        setLoading(true);
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          window.alert(await getResponseError(response));
          setLoading(false);
          return;
        }
        router.refresh();
      }}
    >
      <PiTrash />
    </button>
  );
}
