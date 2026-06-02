import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { DATA_DIR } from "./config.js";
import { getDb, listProducts } from "./db.js";

/** Precio único de catálogo Slip (guaraní) */
const CATALOG_PRICE = 250_000;

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
fs.mkdirSync(DATA_DIR, { recursive: true });
getDb();

const products = listProducts();
if (products.length === 0) {
  console.log("No hay productos en la base.");
  process.exit(0);
}

const stmt = getDb().prepare(
  `UPDATE products SET price = ?, updated_at = datetime('now') WHERE id = ?`
);

for (const p of products) {
  stmt.run(CATALOG_PRICE, p.id);
}

console.log(
  `Precios actualizados a ${CATALOG_PRICE.toLocaleString("es-PY")} Gs. (${products.length} productos).`
);
