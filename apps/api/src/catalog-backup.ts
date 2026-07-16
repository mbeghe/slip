import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";
import { UPLOADS_DIR } from "./config.js";
import {
  createProduct,
  deleteProduct,
  listProducts,
  type Product,
  type ProductInput,
} from "./db.js";

export const CATALOG_BACKUP_VERSION = 1;

export type CatalogManifest = {
  version: number;
  exportedAt: string;
  productCount: number;
};

function collectUploadFilenames(products: Product[]): string[] {
  const names = new Set<string>();
  for (const p of products) {
    for (const url of p.imageUrls) {
      const name = filenameFromUploadUrl(url);
      if (name) names.add(name);
    }
    for (const urls of Object.values(p.colorImages)) {
      for (const url of urls) {
        const name = filenameFromUploadUrl(url);
        if (name) names.add(name);
      }
    }
  }
  return [...names];
}

function filenameFromUploadUrl(url: string): string | null {
  if (!url.startsWith("/uploads/")) return null;
  const name = path.basename(url);
  if (!name || name === "." || name === "..") return null;
  return name;
}

export function buildCatalogZip(): Buffer {
  const products = listProducts();
  const zip = new AdmZip();
  const manifest: CatalogManifest = {
    version: CATALOG_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    productCount: products.length,
  };
  zip.addFile(
    "manifest.json",
    Buffer.from(JSON.stringify(manifest, null, 2), "utf8")
  );
  zip.addFile(
    "products.json",
    Buffer.from(JSON.stringify(products, null, 2), "utf8")
  );

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  for (const name of collectUploadFilenames(products)) {
    const filePath = path.join(UPLOADS_DIR, name);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      zip.addLocalFile(filePath, "uploads");
    }
  }

  return zip.toBuffer();
}

export function exportFilename(): string {
  const day = new Date().toISOString().slice(0, 10);
  return `slip-catalog-${day}.zip`;
}

type RestoreProduct = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  price?: unknown;
  colors?: unknown;
  imageUrls?: unknown;
  colorImages?: unknown;
  featured?: unknown;
  sortOrder?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function parseRestoreProducts(raw: unknown): ProductInput[] {
  if (!Array.isArray(raw)) {
    throw new Error("products.json inválido");
  }
  const out: ProductInput[] = [];
  for (const item of raw as RestoreProduct[]) {
    if (typeof item?.name !== "string" || !item.name.trim()) {
      throw new Error("Producto sin nombre en el backup");
    }
    if (typeof item?.slug !== "string" || !item.slug.trim()) {
      throw new Error(`Producto "${item.name}" sin slug`);
    }
    const colors = item.colors === undefined ? [] : item.colors;
    const imageUrls = item.imageUrls === undefined ? [] : item.imageUrls;
    if (!isStringArray(colors) || !isStringArray(imageUrls)) {
      throw new Error(`Producto "${item.name}" con colores o imágenes inválidos`);
    }
    let colorImages: Record<string, string[]> = {};
    if (item.colorImages !== undefined) {
      if (
        !item.colorImages ||
        typeof item.colorImages !== "object" ||
        Array.isArray(item.colorImages)
      ) {
        throw new Error(`Producto "${item.name}" con colorImages inválido`);
      }
      colorImages = {};
      for (const [key, urls] of Object.entries(item.colorImages)) {
        if (!isStringArray(urls)) {
          throw new Error(`Producto "${item.name}" con colorImages inválido`);
        }
        colorImages[key] = urls;
      }
    }
    out.push({
      name: item.name.trim(),
      slug: item.slug.trim(),
      description:
        typeof item.description === "string" ? item.description : "",
      price: typeof item.price === "number" ? item.price : 0,
      colors,
      imageUrls,
      colorImages,
      featured: Boolean(item.featured),
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 0,
    });
  }
  return out;
}

export function restoreCatalogFromZip(zipBuffer: Buffer): {
  restored: number;
} {
  const zip = new AdmZip(zipBuffer);
  const manifestEntry = zip.getEntry("manifest.json");
  const productsEntry = zip.getEntry("products.json");
  if (!manifestEntry || !productsEntry) {
    throw new Error("El ZIP no es un backup de Slip válido");
  }

  let manifest: CatalogManifest;
  try {
    manifest = JSON.parse(manifestEntry.getData().toString("utf8")) as CatalogManifest;
  } catch {
    throw new Error("manifest.json inválido");
  }
  if (manifest.version !== CATALOG_BACKUP_VERSION) {
    throw new Error(`Versión de backup no soportada: ${manifest.version}`);
  }

  let productsRaw: unknown;
  try {
    productsRaw = JSON.parse(productsEntry.getData().toString("utf8"));
  } catch {
    throw new Error("products.json inválido");
  }
  const products = parseRestoreProducts(productsRaw);

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const normalized = entry.entryName.replace(/\\/g, "/");
    if (!normalized.startsWith("uploads/") || normalized.includes("..")) {
      continue;
    }
    const name = path.basename(normalized);
    if (!name) continue;
    fs.writeFileSync(path.join(UPLOADS_DIR, name), entry.getData());
  }

  for (const existing of listProducts()) {
    deleteProduct(existing.id);
  }
  for (const product of products) {
    createProduct(product);
  }

  return { restored: products.length };
}
