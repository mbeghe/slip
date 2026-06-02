import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DATA_DIR, DB_PATH } from "./config.js";

export type ProductRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sizes: string;
  colors: string;
  image_urls: string;
  color_images: string;
  in_stock: number;
  featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  colors: string[];
  imageUrls: string[];
  colorImages: Record<string, string[]>;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function parseColorImages(value: string | undefined): Record<string, string[]> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: Record<string, string[]> = {};
    for (const [key, urls] of Object.entries(parsed)) {
      if (Array.isArray(urls)) {
        out[String(key)] = urls.map(String).filter(Boolean);
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    colors: parseJsonArray(row.colors),
    imageUrls: parseJsonArray(row.image_urls),
    colorImages: parseColorImages(row.color_images ?? "{}"),
    featured: row.featured === 1,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

let db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new DatabaseSync(DB_PATH);
    migrate(db);
  }
  return db;
}

function migrate(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      sizes TEXT NOT NULL DEFAULT '[]',
      colors TEXT NOT NULL DEFAULT '[]',
      image_urls TEXT NOT NULL DEFAULT '[]',
      in_stock INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
  `);

  const columns = database
    .prepare(`PRAGMA table_info(products)`)
    .all() as { name: string }[];
  if (!columns.some((c) => c.name === "color_images")) {
    database.exec(
      `ALTER TABLE products ADD COLUMN color_images TEXT NOT NULL DEFAULT '{}'`
    );
  }
}

export function listProducts(): Product[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM products ORDER BY sort_order ASC, name ASC`
    )
    .all() as ProductRow[];
  return rows.map(rowToProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const row = getDb()
    .prepare(`SELECT * FROM products WHERE slug = ?`)
    .get(slug) as ProductRow | undefined;
  return row ? rowToProduct(row) : null;
}

export function getProductById(id: number): Product | null {
  const row = getDb()
    .prepare(`SELECT * FROM products WHERE id = ?`)
    .get(id) as ProductRow | undefined;
  return row ? rowToProduct(row) : null;
}

export type ProductInput = {
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  colors?: string[];
  imageUrls?: string[];
  colorImages?: Record<string, string[]>;
  featured?: boolean;
  sortOrder?: number;
};

export function createProduct(input: ProductInput): Product {
  const database = getDb();
  const stmt = database.prepare(`
    INSERT INTO products (name, slug, description, price, sizes, colors, image_urls, color_images, in_stock, featured, sort_order)
    VALUES (@name, @slug, @description, @price, '[]', @colors, @image_urls, @color_images, 1, @featured, @sort_order)
  `);
  const result = stmt.run({
    name: input.name,
    slug: input.slug!,
    description: input.description ?? "",
    price: input.price ?? 0,
    colors: JSON.stringify(input.colors ?? []),
    image_urls: JSON.stringify(input.imageUrls ?? []),
    color_images: JSON.stringify(input.colorImages ?? {}),
    featured: input.featured ? 1 : 0,
    sort_order: input.sortOrder ?? 0,
  });
  return getProductById(Number(result.lastInsertRowid))!;
}

export function updateProduct(id: number, input: ProductInput): Product | null {
  const existing = getProductById(id);
  if (!existing) return null;

  getDb()
    .prepare(
      `
    UPDATE products SET
      name = @name,
      slug = @slug,
      description = @description,
      price = @price,
      colors = @colors,
      image_urls = @image_urls,
      color_images = @color_images,
      featured = @featured,
      sort_order = @sort_order,
      updated_at = datetime('now')
    WHERE id = @id
  `
    )
    .run({
      id,
      name: input.name ?? existing.name,
      slug: input.slug ?? existing.slug,
      description: input.description ?? existing.description,
      price: input.price ?? existing.price,
      colors: JSON.stringify(input.colors ?? existing.colors),
      image_urls: JSON.stringify(input.imageUrls ?? existing.imageUrls),
      color_images: JSON.stringify(
        input.colorImages ?? existing.colorImages
      ),
      featured:
        input.featured === undefined
          ? existing.featured
            ? 1
            : 0
          : input.featured
            ? 1
            : 0,
      sort_order: input.sortOrder ?? existing.sortOrder,
    });

  return getProductById(id);
}

export function deleteProduct(id: number): boolean {
  const result = getDb().prepare(`DELETE FROM products WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function slugExists(slug: string, excludeId?: number): boolean {
  const row = excludeId
    ? (getDb()
        .prepare(`SELECT 1 AS ok FROM products WHERE slug = ? AND id != ?`)
        .get(slug, excludeId) as { ok: number } | undefined)
    : (getDb()
        .prepare(`SELECT 1 AS ok FROM products WHERE slug = ?`)
        .get(slug) as { ok: number } | undefined);
  return Boolean(row);
}
