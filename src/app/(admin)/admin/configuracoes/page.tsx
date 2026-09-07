"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/types";
import { FONT_PRESETS } from "@/lib/fonts";
import ImageUploader from "@/components/admin/ImageUploader";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-ink/60 block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-line rounded-lg px-3 py-2 text-sm";

export default function AdminConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings({ ...DEFAULT_SETTINGS, ...data });
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { id, ...payload } = settings;
    await supabase.from("settings").update(payload).eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <p className="text-sm text-ink/50">Carregando...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Configurações da loja</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="font-medium text-sm text-ink/80 border-b border-line pb-2">Identidade da loja</h2>
          <Field label="Nome da loja">
            <input className={inputClass} value={settings.store_name} onChange={(e) => update("store_name", e.target.value)} />
          </Field>
          <Field label="Slogan">
            <input className={inputClass} value={settings.slogan} onChange={(e) => update("slogan", e.target.value)} />
          </Field>
          <Field label="Descrição da loja">
            <textarea className={inputClass} rows={3} value={settings.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <ImageUploader value={settings.logo_url} onChange={(url) => update("logo_url", url)} label="Logo" folder="loja" />
            <ImageUploader value={settings.favicon_url} onChange={(url) => update("favicon_url", url)} label="Favicon" folder="loja" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-medium text-sm text-ink/80 border-b border-line pb-2">Contato e redes sociais</h2>
          <Field label="Número de WhatsApp (com DDI e DDD, ex: 55 11 91234-5678)">
            <input className={inputClass} value={settings.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} placeholder="5511912345678" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instagram">
              <input className={inputClass} value={settings.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@lsglamour" />
            </Field>
            <Field label="TikTok">
              <input className={inputClass} value={settings.tiktok} onChange={(e) => update("tiktok", e.target.value)} placeholder="@lsglamour" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail">
              <input className={inputClass} value={settings.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Horário de atendimento">
              <input className={inputClass} value={settings.hours} onChange={(e) => update("hours", e.target.value)} placeholder="Seg a sex, 9h às 18h" />
            </Field>
          </div>
          <Field label="Endereço">
            <input className={inputClass} value={settings.address} onChange={(e) => update("address", e.target.value)} />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-medium text-sm text-ink/80 border-b border-line pb-2">Textos institucionais</h2>
          <Field label="Informações de pagamento">
            <textarea className={inputClass} rows={3} value={settings.payment_info} onChange={(e) => update("payment_info", e.target.value)} />
          </Field>
          <Field label="Informações de frete">
            <textarea className={inputClass} rows={3} value={settings.shipping_info} onChange={(e) => update("shipping_info", e.target.value)} />
          </Field>
          <Field label="Política de troca">
            <textarea className={inputClass} rows={3} value={settings.exchange_policy} onChange={(e) => update("exchange_policy", e.target.value)} />
          </Field>
          <Field label="Política de privacidade">
            <textarea className={inputClass} rows={3} value={settings.privacy_policy} onChange={(e) => update("privacy_policy", e.target.value)} />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-medium text-sm text-ink/80 border-b border-line pb-2">Aparência</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Cor principal">
              <input type="color" value={settings.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="w-full h-10 border border-line rounded-lg" />
            </Field>
            <Field label="Cor secundária">
              <input type="color" value={settings.secondary_color} onChange={(e) => update("secondary_color", e.target.value)} className="w-full h-10 border border-line rounded-lg" />
            </Field>
            <Field label="Cor dos botões">
              <input type="color" value={settings.button_color} onChange={(e) => update("button_color", e.target.value)} className="w-full h-10 border border-line rounded-lg" />
            </Field>
          </div>
          <Field label="Fonte do site">
            <select className={inputClass} value={settings.font_choice} onChange={(e) => update("font_choice", e.target.value)}>
              {Object.entries(FONT_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <div className="flex items-center gap-4 sticky bottom-4">
          <button type="submit" disabled={saving} className="btn-primary rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
          {saved && <span className="text-sm text-green-700">Configurações salvas ✓</span>}
        </div>
      </form>
    </div>
  );
}
