"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // usuário cancelou o compartilhamento nativo
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível
    }
  }

  return (
    <button onClick={handleShare} className="text-xs text-ink/50 hover:text-primary underline underline-offset-4">
      {copied ? "Link copiado!" : "Compartilhar produto"}
    </button>
  );
}
