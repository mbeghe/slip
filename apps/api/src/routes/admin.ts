import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import slugify from "slugify";
import { ADMIN_PASSWORD, UPLOADS_DIR } from "../config.js";
import { clearAdminCookie, requireAdmin, setAdminCookie, signAdminToken } from "../auth.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  slugExists,
  updateProduct,
  type ProductInput,
} from "../db.js";

export const adminRouter = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype);
    cb(null, ok);
  },
});

function uniqueSlug(base: string, excludeId?: number): string {
  let slug = slugify(base, { lower: true, strict: true });
  if (!slug) slug = "producto";
  let candidate = slug;
  let n = 1;
  while (slugExists(candidate, excludeId)) {
    candidate = `${slug}-${n++}`;
  }
  return candidate;
}

adminRouter.post("/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password?.trim() || password.trim() !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }
  const token = signAdminToken();
  setAdminCookie(res, token);
  res.json({ ok: true });
});

adminRouter.post("/logout", (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok: true });
});

adminRouter.get("/me", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

adminRouter.get("/products", requireAdmin, (_req, res) => {
  res.json(listProducts());
});

adminRouter.post("/products", requireAdmin, (req, res) => {
  const body = req.body as ProductInput & { slug?: string };
  if (!body.name?.trim()) {
    res.status(400).json({ error: "El nombre es obligatorio" });
    return;
  }
  const slug = body.slug?.trim()
    ? uniqueSlug(body.slug)
    : uniqueSlug(body.name);
  const product = createProduct({ ...body, name: body.name.trim(), slug });
  res.status(201).json(product);
});

adminRouter.put("/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const body = req.body as ProductInput;
  if (body.slug) {
    const slug = slugify(body.slug, { lower: true, strict: true });
    if (slugExists(slug, id)) {
      res.status(400).json({ error: "Ese slug ya existe" });
      return;
    }
    body.slug = slug;
  }
  const product = updateProduct(id, body);
  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  res.json(product);
});

adminRouter.delete("/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const product = getProductById(id);
  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  deleteProduct(id);
  res.json({ ok: true });
});

adminRouter.post(
  "/upload",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Imagen requerida" });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  }
);
