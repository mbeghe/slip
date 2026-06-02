import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { fetchProducts } from "../lib/api";
import type { Product } from "../types";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const display = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <div>
      <section className="min-h-[50dvh] flex flex-col items-center justify-center px-4 py-12 text-center">
        <img
          src="/logo.svg"
          alt="Slip"
          className="mx-auto h-16 w-auto md:h-24"
        />
        <div className="mt-6 max-w-md mx-auto space-y-2">
          <p className="text-xl sm:text-2xl font-bold text-slip-ink">
            Comodidad y estilo
          </p>
          <p className="text-base sm:text-lg text-slip-accent-blue">
            Catálogo online · envío a todo el país
          </p>
        </div>
        <Link
          to="/catalogo"
          className="mt-8 inline-block rounded-full bg-slip-primary text-white font-bold px-8 py-3 hover:bg-slip-primary-muted transition-colors"
        >
          Ver catálogo
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-slip-ink mb-8">Destacados</h2>
        {loading ? (
          <p className="text-slip-accent-blue">Cargando…</p>
        ) : display.length === 0 ? (
          <p className="text-slip-accent-blue">Pronto habrá productos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {display.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
