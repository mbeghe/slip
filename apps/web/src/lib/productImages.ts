import type { Product } from "../types";

export function productHasColors(product: Pick<Product, "colors">): boolean {
  return product.colors.length > 0;
}

/** Galería visible en ficha: por color si aplica, si no las imágenes generales */
export function galleryForColor(
  product: Product,
  color: string | undefined
): string[] {
  if (!productHasColors(product)) {
    return product.imageUrls;
  }
  const key = color ?? product.colors[0];
  const urls = product.colorImages[key];
  if (urls?.length) return urls;
  return product.imageUrls;
}

/** Primera imagen para portada de catálogo */
export function catalogCoverUrl(product: Product): string | undefined {
  if (product.imageUrls[0]) return product.imageUrls[0];
  for (const color of product.colors) {
    const first = product.colorImages[color]?.[0];
    if (first) return first;
  }
  return undefined;
}
