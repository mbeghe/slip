import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { DATA_DIR, UPLOADS_DIR } from "./config.js";
import { createProduct, getDb, listProducts, slugExists } from "./db.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
getDb();

if (listProducts().length > 0) {
  console.log("La base ya tiene productos. Seed omitido.");
  process.exit(0);
}

const samples = [
  {
    name: "Nube Suave",
    description:
      "Pantufla acolchada con suela antideslizante. Ideal para estar en casa con máximo confort.",
    price: 250_000,
    colors: ["Rosa", "Gris"],
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Clásica Coral",
    description:
      "Pantufla minimalista en tonos coral. Liviana y fresca para el día a día.",
    price: 250_000,
    colors: ["Coral"],
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Relax Teal",
    description:
      "Modelo unisex con tiras anchas y plantilla ergonómica. Color teal suave.",
    price: 250_000,
    colors: ["Teal", "Azul"],
    featured: false,
    sortOrder: 3,
  },
];

for (const sample of samples) {
  const slug = sample.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slugExists(slug)) {
    createProduct({ ...sample, slug, imageUrls: [] });
  }
}

console.log(`Seed listo: ${listProducts().length} productos.`);
