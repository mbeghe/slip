import { Router } from "express";
import { getProductBySlug, listProducts } from "../db.js";

export const productsRouter = Router();

productsRouter.get("/", (_req, res) => {
  res.json(listProducts());
});

productsRouter.get("/:slug", (req, res) => {
  const product = getProductBySlug(req.params.slug);
  if (!product) {
    res.status(404).json({ error: "Producto no encontrado" });
    return;
  }
  res.json(product);
});
