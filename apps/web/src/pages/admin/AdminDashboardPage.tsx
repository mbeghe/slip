import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminDeleteProduct,
  adminExportCatalog,
  adminLogout,
  adminMe,
  adminRestoreCatalog,
  fetchProducts,
} from "../../lib/api";
import { ProductImage } from "../../components/ProductImage";
import { formatGuarani } from "../../lib/format";
import type { Product } from "../../types";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"export" | "restore" | null>(null);

  useEffect(() => {
    adminMe()
      .then(() => fetchProducts())
      .then(setProducts)
      .catch(() => navigate("/admin/login", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("No se pudo eliminar");
    }
  }

  async function handleLogout() {
    await adminLogout();
    navigate("/admin/login");
  }

  async function handleExport() {
    setBusy("export");
    try {
      const { blob, filename } = await adminExportCatalog();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo exportar");
    } finally {
      setBusy(null);
    }
  }

  async function handleRestoreFile(file: File | undefined) {
    if (!file) return;
    if (
      !confirm(
        "Esto reemplaza TODO el catálogo actual (productos e imágenes) por el backup. ¿Continuar?"
      )
    ) {
      return;
    }
    setBusy("restore");
    try {
      const result = await adminRestoreCatalog(file);
      const next = await fetchProducts();
      setProducts(next);
      alert(`Catálogo restaurado: ${result.restored} producto(s).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo restaurar");
    } finally {
      setBusy(null);
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-slip-accent-blue">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slip-ink">Administración</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={busy !== null}
            className="rounded-full border border-slip-accent-blue text-slip-ink font-semibold px-5 py-2 text-sm disabled:opacity-50"
          >
            {busy === "export" ? "Exportando…" : "Exportar catálogo"}
          </button>
          <button
            type="button"
            onClick={() => restoreInputRef.current?.click()}
            disabled={busy !== null}
            className="rounded-full border border-slip-accent-blue text-slip-ink font-semibold px-5 py-2 text-sm disabled:opacity-50"
          >
            {busy === "restore" ? "Restaurando…" : "Restaurar"}
          </button>
          <input
            ref={restoreInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => handleRestoreFile(e.target.files?.[0])}
          />
          <Link
            to="/admin/productos/nuevo"
            className="rounded-full bg-slip-primary text-white font-bold px-5 py-2 text-sm hover:bg-slip-primary-muted"
          >
            Agregar producto
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-slip-accent-blue text-slip-ink font-semibold px-5 py-2 text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-slip-accent-blue">No hay productos aún.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-slip-accent-blue/20 p-4 bg-white"
            >
              <ProductImage
                src={p.imageUrls[0]}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg"
              />
              <div className="flex-1 min-w-[140px]">
                <p className="font-bold text-slip-ink">{p.name}</p>
                <p className="text-sm text-slip-ink font-medium tabular-nums">
                  {formatGuarani(p.price)}
                </p>
                {p.featured && (
                  <p className="text-xs mt-1 text-slip-accent-teal font-semibold">
                    Destacado
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/admin/productos/${p.id}`}
                  className="text-sm font-semibold text-slip-primary hover:underline"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="text-sm font-semibold text-slip-ink hover:text-slip-primary"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
