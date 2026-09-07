import type { Metadata } from "next";
import "../globals.css";
import { getSettings } from "@/lib/data";
import { getFontPreset } from "@/lib/fonts";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.store_name}${settings.slogan ? " — " + settings.slogan : ""}`;
  return {
    title,
    description: settings.description || settings.slogan || "Loja de perfumaria e moda feminina.",
    icons: settings.favicon_url ? [{ rel: "icon", url: settings.favicon_url }] : undefined,
    openGraph: {
      title,
      description: settings.description || settings.slogan || "",
      images: settings.logo_url ? [settings.logo_url] : [],
      type: "website",
    },
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const font = getFontPreset(settings.font_choice);

  const themeStyle = {
    "--color-primary": settings.primary_color,
    "--color-secondary": settings.secondary_color,
    "--color-primary-dark": shade(settings.primary_color, -18),
    "--color-primary-light": shade(settings.primary_color, 32),
    "--font-display": font.display,
    "--font-body": font.body,
  } as React.CSSProperties;

  return (
    <html lang="pt-BR" style={themeStyle}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={font.googleHref} />
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          <Header settings={settings} />
          <main>{children}</main>
          <Footer settings={settings} />
          <WhatsAppFloat whatsappNumber={settings.whatsapp_number} />
        </CartProvider>
      </body>
    </html>
  );
}

/** Escurece (%<0) ou clareia (%>0) uma cor hex, usada para hover/derivados. */
function shade(hex: string, percent: number): string {
  try {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    let r = (num >> 16) + Math.round((percent / 100) * 255);
    let g = ((num >> 8) & 0x00ff) + Math.round((percent / 100) * 255);
    let b = (num & 0x0000ff) + Math.round((percent / 100) * 255);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}
