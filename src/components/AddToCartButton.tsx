"use client";

import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/types";

export default function AddToCartButton({
  product,
  disabled,
}: {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  return (
    <button
      disabled={disabled}
      onClick={() => addItem(product)}
      className="flex-1 text-center rounded-full py-3.5 text-sm font-medium border border-ink text-ink hover:bg-ink hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Adicionar à sacola
    </button>
  );
}
