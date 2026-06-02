import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");

dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const PORT = Number(process.env.PORT) || 3001;

/** Paths in .env are relative to the repo root, not the API process cwd */
function resolveDataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (!fromEnv) return path.join(repoRoot, "data");
  return path.isAbsolute(fromEnv)
    ? fromEnv
    : path.resolve(repoRoot, fromEnv);
}

export const DATA_DIR = resolveDataDir();
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
export const DB_PATH = path.join(DATA_DIR, "catalog.db");
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
export const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "admin").trim();
export const WHATSAPP_NUMBER =
  process.env.WHATSAPP_NUMBER || "595993290388";
export const IS_PROD = process.env.NODE_ENV === "production";

export const WEB_DIST = path.join(
  __dirname,
  "..",
  "..",
  "web",
  "dist"
);
