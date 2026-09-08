"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  // Cupom de desconto
  couponCode: string | null;
  couponDiscountPercent: number | null;
  couponLoading: boolean;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  discount: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "lsglamour_cart_v1";
const COUPON_STORAGE_KEY = "lsglamour_coupon_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage indisponível (ex: navegação privada); segue com carrinho vazio
    }
    try {
      const rawCoupon = window.localStorage.getItem(COUPON_STORAGE_KEY);
      if (rawCoupon) {
        const parsed = JSON.parse(rawCoupon);
        if (parsed?.code && typeof parsed.discount_percent === "number") {
          setCouponCode(parsed.code);
          setCouponDiscountPercent(parsed.discount_percent);
        }
      }
    } catch {
      // ignora cupom salvo inválido
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora falha de escrita
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (couponCode && couponDiscountPercent != null) {
        window.localStorage.setItem(
          COUPON_STORAGE_KEY,
          JSON.stringify({ code: couponCode, discount_percent: couponDiscountPercent })
        );
      } else {
        window.localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ignora falha de escrita
    }
  }, [couponCode, couponDiscountPercent, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p));
      }
      return [...prev, { ...item, quantity }];
    });
    setIsOpen(true);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));
  }

  function clear() {
    setItems([]);
    removeCoupon();
  }

  async function applyCoupon(rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coupons")
        .select("code, discount_percent, active")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();

      if (error || !data) {
        setCouponError("Cupom inválido ou expirado.");
        setCouponCode(null);
        setCouponDiscountPercent(null);
        return;
      }

      setCouponCode(data.code);
      setCouponDiscountPercent(data.discount_percent);
    } catch {
      setCouponError("Não foi possível validar o cupom agora. Tente novamente.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponCode(null);
    setCouponDiscountPercent(null);
    setCouponError(null);
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const discount = useMemo(
    () => (couponDiscountPercent ? (subtotal * couponDiscountPercent) / 100 : 0),
    [subtotal, couponDiscountPercent]
  );
  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        subtotal,
        count,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        couponCode,
        couponDiscountPercent,
        couponLoading,
        couponError,
        applyCoupon,
        removeCoupon,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
