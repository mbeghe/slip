import { useEffect, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { fetchProducts } from "../lib/api";
import type { Product } from "../types";

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slip-ink">Catálogo</h1>
        <p className="mt-1 text-slip-accent-blue">
          Elegí tu modelo y consultá la guía de talles en cada producto
        </p>
      </div>

      {loading ? (
        <p className="text-slip-accent-blue">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="text-slip-accent-blue">No hay productos para mostrar.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
