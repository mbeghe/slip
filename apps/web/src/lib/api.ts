import type { Product, ProductInput } from "../types";

const base = "";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || "Error de servidor");
  }
  return res.json() as Promise<T>;
}

export function fetchProducts() {
  return request<Product[]>("/api/products");
}

export function fetchProduct(slug: string) {
  return request<Product>(`/api/products/${slug}`);
}

export function fetchConfig() {
  return request<{ whatsappNumber: string }>("/api/config");
}

export function adminLogin(password: string) {
  return request<{ ok: boolean }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function adminLogout() {
  return request<{ ok: boolean }>("/api/admin/logout", { method: "POST" });
}

export function adminMe() {
  return request<{ ok: boolean }>("/api/admin/me");
}

export function adminCreateProduct(data: ProductInput) {
  return request<Product>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminUpdateProduct(id: number, data: ProductInput) {
  return request<Product>(`/api/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function adminDeleteProduct(id: number) {
  return request<{ ok: boolean }>(`/api/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function adminUploadImage(file: File) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || "Error al subir imagen");
  }
  return res.json() as Promise<{ url: string }>;
}

export async function adminExportCatalog() {
  const res = await fetch("/api/admin/catalog/export", {
    credentials: "include",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || "No se pudo exportar el catálogo");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename =
    match?.[1] || `slip-catalog-${new Date().toISOString().slice(0, 10)}.zip`;
  return { blob, filename };
}

export async function adminRestoreCatalog(file: File) {
  const form = new FormData();
  form.append("backup", file);
  const res = await fetch("/api/admin/catalog/restore", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || "No se pudo restaurar el catálogo");
  }
  return res.json() as Promise<{ ok: boolean; restored: number }>;
}
