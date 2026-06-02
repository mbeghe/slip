import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

const COOKIE_NAME = "slip_admin";

export type AdminPayload = { role: "admin" };

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" } satisfies AdminPayload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function setAdminCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies[COOKIE_NAME] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminPayload;
    if (payload.role !== "admin") {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida" });
  }
}
