"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ImageUploader({
  value,
  onChange,
  label = "Imagem",
  folder = "produtos",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      setError("Falha ao enviar imagem. Tente novamente.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="text-xs text-ink/60 block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-bg border border-line flex-shrink-0">
          {value ? (
            <Image src={value} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-ink/30">sem imagem</div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="text-xs" />
          {value && (
            <button type="button" onClick={() => onChange(null)} className="text-xs text-red-500 text-left">
              Remover imagem
            </button>
          )}
          {uploading && <p className="text-xs text-ink/50">Enviando...</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
