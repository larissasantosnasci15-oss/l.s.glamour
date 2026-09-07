import type { CartItem, Product } from "./types";

/**
 * Toda a lógica de WhatsApp do site passa por este arquivo.
 * O número da loja NUNCA fica espalhado pelo código — ele vem sempre da
 * tabela `settings` (editável em /admin/configuracoes) e chega até aqui
 * pelas funções abaixo.
 */

function sanitizeNumber(rawNumber: string): string {
  // Remove tudo que não for dígito. Ex: "+55 (11) 91234-5678" -> "5511912345678"
  return rawNumber.replace(/\D/g, "");
}

function buildLink(rawNumber: string, message: string): string {
  const number = sanitizeNumber(rawNumber);
  const text = encodeURIComponent(message);
  if (!number) {
    // Sem número configurado ainda: leva para a busca do WhatsApp Web
    // em vez de quebrar a página.
    return `https://wa.me/?text=${text}`;
  }
  return `https://wa.me/${number}?text=${text}`;
}

function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function genericWhatsAppLink(whatsappNumber: string, storeName: string): string {
  return buildLink(whatsappNumber, `Olá, ${storeName}! Tenho interesse em conhecer os produtos da loja.`);
}

export function interestWhatsAppLink(whatsappNumber: string): string {
  return buildLink(whatsappNumber, "Olá! Tenho interesse em um produto da loja. Podem me ajudar?");
}

export function productWhatsAppLink(whatsappNumber: string, product: Pick<Product, "name" | "price" | "promo_price">): string {
  const finalPrice = product.promo_price ?? product.price;
  const message = `Olá! Tenho interesse no produto ${product.name}, no valor de ${formatPrice(
    finalPrice
  )}. Gostaria de saber mais informações.`;
  return buildLink(whatsappNumber, message);
}

export function cartWhatsAppLink(whatsappNumber: string, items: CartItem[]): string {
  const lines = items.map(
    (item) =>
      `• ${item.quantity}x ${item.name} — ${formatPrice(item.price)} (subtotal ${formatPrice(
        item.price * item.quantity
      )})`
  );
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = [
    "Olá! Gostaria de fechar o seguinte pedido:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
  ].join("\n");
  return buildLink(whatsappNumber, message);
}

export { formatPrice };
