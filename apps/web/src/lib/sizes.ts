export type SizeCategory = "kids" | "adults";

export const SIZE_CATEGORY_LABELS: Record<SizeCategory, string> = {
  kids: "Niños",
  adults: "Adultos",
};

/** Niños: formato nn/n (ej. 26/7) — según tabla de talles */
export const SIZES_KIDS = ["26/7", "28/9", "30/1", "32/3"] as const;

/** Adultos: formato nn/nn (ej. 34/35) — según tabla de talles */
export const SIZES_ADULTS = [
  "34/35",
  "36/37",
  "38/39",
  "40/41",
  "42/43",
  "44/45/46",
] as const;

export const SIZE_GUIDE_IMAGES: Record<SizeCategory, string> = {
  kids: "/guia-talles-kids.png",
  adults: "/guia-talles-adultos.png",
};

const KIDS_PATTERN = /^\d{2}\/\d$/;
/** nn/nn o el último rango del chart: 44/45/46 */
const ADULTS_PATTERN = /^\d{2}\/\d{2}(\/\d{2})?$/;

export function sizesForCategory(category: SizeCategory): readonly string[] {
  return category === "kids" ? SIZES_KIDS : SIZES_ADULTS;
}

/** Etiqueta uniforme en el selector y WhatsApp */
export function formatSizeLabel(size: string, category: SizeCategory): string {
  if (category === "kids") {
    return size;
  }
  return size;
}

export function isValidSize(size: string, category: SizeCategory): boolean {
  return category === "kids"
    ? KIDS_PATTERN.test(size)
    : ADULTS_PATTERN.test(size);
}

export function defaultSizeForCategory(category: SizeCategory): string {
  return sizesForCategory(category)[0];
}
