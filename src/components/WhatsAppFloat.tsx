"use client";

import { interestWhatsAppLink } from "@/lib/whatsapp";

export default function WhatsAppFloat({ whatsappNumber }: { whatsappNumber: string }) {
  return (
    <a
      href={interestWhatsAppLink(whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-soft hover:scale-105 transition-transform"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="white" aria-hidden="true">
        <path d="M16.02 3C9.4 3 4 8.36 4 15c0 2.35.68 4.53 1.86 6.38L4 29l7.8-1.83A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.64 28 15S22.64 3 16.02 3Zm6.98 16.9c-.3.85-1.7 1.63-2.35 1.7-.6.07-1.37.1-2.2-.14-.5-.15-1.15-.37-1.98-.72-3.48-1.5-5.75-5-5.92-5.24-.17-.24-1.4-1.87-1.4-3.57 0-1.7.9-2.53 1.21-2.88.32-.34.7-.43.93-.43.23 0 .46 0 .66.01.21.01.5-.08.78.6.3.7 1 2.4 1.09 2.57.09.17.15.37.03.6-.12.24-.18.38-.36.58-.18.2-.38.45-.54.6-.18.17-.37.36-.16.7.21.34.93 1.53 2 2.48 1.37 1.22 2.53 1.6 2.87 1.78.34.17.54.15.74-.09.2-.24.85-.99 1.08-1.33.23-.34.46-.28.77-.17.31.12 1.98.93 2.32 1.1.34.17.56.25.65.4.09.14.09.79-.21 1.65Z" />
      </svg>
    </a>
  );
}
