"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { cartWhatsAppLink, formatPrice } from "@/lib/whatsapp";
import type { Settings } from "@/lib/types";

export default function CartDrawer({ settings }: { settings: Settings }) {
  const {
    items,
    isOpen,
    close,
    removeItem,
    updateQuantity,
    subtotal,
    clear,
    couponCode,
    couponDiscountPercent,
    couponLoading,
    couponError,
    applyCoupon,
    removeCoupon,
    discount,
    total,
  } = useCart();
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  // O header é "sticky" com desfoque de fundo (backdrop-blur), e isso cria um novo
  // "containing block" para elementos com position: fixed dentro dele — por isso a
  // sacola ficava presa/cortada dentro da altura do cabeçalho e não abria por
  // completo. Renderizando a sacola num portal direto no <body>, ela passa a se
  // posicionar em relação à janela inteira, como esperado.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    await applyCoupon(couponInput);
  }

  return createPortal(
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
            {couponCode ? (
              <div className="flex items-center justify-between bg-primary-light/30 border border-primary/30 rounded-lg px-3 py-2 mb-3">
                <span className="text-xs text-primary-dark font-medium">
                  Cupom <strong>{couponCode}</strong> aplicado (−{couponDiscountPercent}%)
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-ink/50 hover:text-ink underline underline-offset-2"
                  aria-label="Remover cupom"
                >
                  remover
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-3">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Cupom de desconto"
                  className="flex-1 border border-line rounded-full px-3 py-2 text-xs uppercase focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="text-xs border border-ink rounded-full px-4 py-2 hover:bg-ink hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {couponLoading ? "..." : "Aplicar"}
                </button>
              </form>
            )}
            {couponError && !couponCode && <p className="text-xs text-red-500 mb-3">{couponError}</p>}

            <div className="flex justify-between text-sm mb-1">
              <span className="text-ink/70">Subtotal</span>
              <span className={couponCode ? "text-ink/50 line-through" : "font-medium"}>{formatPrice(subtotal)}</span>
            </div>
            {couponCode && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink/70">Desconto</span>
                <span className="font-medium text-primary-dark">−{formatPrice(discount)}</span>
              </div>
            )}
            {couponCode && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ink/70 font-medium">Total</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
            )}
            <p className="text-xs text-ink/50 mb-3 mt-1">Frete calculado na finalização com a loja.</p>
            <a
              href={cartWhatsAppLink(
                settings.whatsapp_number,
                items,
                couponCode && couponDiscountPercent ? { code: couponCode, discountPercent: couponDiscountPercent } : null
              )}
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
    </div>,
    document.body
  );
}
