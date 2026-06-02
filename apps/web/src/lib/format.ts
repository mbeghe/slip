import { SIZE_CATEGORY_LABELS, type SizeCategory } from "./sizes";

export function formatGuarani(amount: number): string {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseGuaraniInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function buildWhatsAppUrl(
  phone: string,
  product: { name: string; price: number },
  options?: { category?: SizeCategory; size?: string; color?: string }
): string {
  const category = options?.category;
  const size = options?.size?.trim();
  const color = options?.color?.trim();
  const talle =
    category && size
      ? `${SIZE_CATEGORY_LABELS[category]} — talle ${size}`
      : "a elegir";
  const colorLine = color ? `Color: ${color}.` : "";
  const message = `Hola, me interesa el modelo "${product.name}".
Precio: ${formatGuarani(product.price)}.
${colorLine ? `${colorLine}\n` : ""}${talle}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
