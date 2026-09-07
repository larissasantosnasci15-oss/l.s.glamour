"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { cartWhatsAppLink, formatPrice } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";

export default function CartDrawer({ settings }: { settings: Settings }) {
  const { items, isOpen, close, removeItem, updateQuantity, subtotal, clear } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Fechar carrinho"
        onClick={close}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-soft flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-display text-xl">Sua sacola</h2>
          <button onClick={close} aria-label="Fechar" className="p-1 text-ink/70 hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-ink/60">
              <p className="mb-4">Sua sacola está vazia.</p>
              <Link href="/produtos" onClick={close} className="text-primary underline underline-offset-4">
                Continuar comprando
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-bg flex-shrink-0">
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ink/40 hover:text-primary text-xs"
                        aria-label="Remover item"
                      >
                        remover
                      </button>
                    </div>
                    <p className="text-sm text-primary-dark font-medium mt-1">{formatPrice(item.price)}</p>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <button
                        className="w-7 h-7 border border-line rounded-full text-sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        className="w-7 h-7 border border-line rounded-full text-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line px-5 py-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-ink/70">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-ink/50 mb-3">Frete calculado na finalização com a loja.</p>
            <a
              href={cartWhatsAppLink(settings.whatsapp_number, items)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary block text-center rounded-full py-3 text-sm font-medium"
            >
              Finalizar pedido pelo WhatsApp
            </a>
            <button onClick={clear} className="w-full text-center text-xs text-ink/40 hover:text-ink mt-3">
              Esvaziar sacola
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
