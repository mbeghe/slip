import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import {
  DATA_DIR,
  IS_PROD,
  PORT,
  UPLOADS_DIR,
  WEB_DIST,
  WHATSAPP_NUMBER,
} from "./config.js";
import { getDb } from "./db.js";
import { adminRouter } from "./routes/admin.js";
import { productsRouter } from "./routes/products.js";

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
getDb();

const app = express();

app.use(
  cors({
    origin: IS_PROD ? false : true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/api/config", (_req, res) => {
  res.json({ whatsappNumber: WHATSAPP_NUMBER });
});

app.use("/api/products", productsRouter);
app.use("/api/admin", adminRouter);

if (IS_PROD && fs.existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      next();
      return;
    }
    res.sendFile(path.join(WEB_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Slip API en http://localhost:${PORT}`);
  console.log(`Datos: ${DATA_DIR}`);
});
