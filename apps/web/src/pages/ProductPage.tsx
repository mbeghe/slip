import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ColorPicker } from "../components/ColorPicker";
import { ProductGallery } from "../components/ProductGallery";
import { ProductPromoSummary } from "../components/ProductPromoSummary";
import { usePromoInfo } from "../components/PromoProvider";
import { SizePicker } from "../components/SizePicker";
import { ShippingNote } from "../components/ShippingNote";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { fetchConfig, fetchProduct } from "../lib/api";
import { formatGuarani } from "../lib/format";
import { galleryForColor, productHasColors } from "../lib/productImages";
import { defaultSizeForCategory, type SizeCategory } from "../lib/sizes";
import type { Product } from "../types";

export function ProductPage() {
  const { openPromoInfo } = usePromoInfo();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<SizeCategory>("kids");
  const [size, setSize] = useState<string>(() =>
    defaultSizeForCategory("kids")
  );
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    Promise.all([fetchProduct(slug), fetchConfig()])
      .then(([p, cfg]) => {
        setProduct(p);
        setPhone(cfg.whatsappNumber);
        if (p.colors.length > 0) {
          setSelectedColor(p.colors[0]);
        }
      })
      .catch(() => setError("Producto no encontrado"))
      .finally(() => setLoading(false));
  }, [slug]);

  const galleryUrls = useMemo(() => {
    if (!product) return [];
    return galleryForColor(product, selectedColor || undefined);
  }, [product, selectedColor]);

  const galleryAlt = useMemo(() => {
    if (!product) return "";
    if (productHasColors(product) && selectedColor) {
      return `${product.name} — ${selectedColor}`;
    }
    return product.name;
  }, [product, selectedColor]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-slip-accent-blue">
        Cargando…
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-slip-ink font-semibold">{error}</p>
        <Link to="/catalogo" className="mt-4 inline-block text-slip-primary">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const showColors = productHasColors(product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to="/catalogo"
        className="text-sm text-slip-accent-blue hover:text-slip-primary mb-6 inline-block"
      >
        ← Catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery imageUrls={galleryUrls} alt={galleryAlt} />

        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slip-ink break-words">
            {product.name}
          </h1>
          <p className="mt-2 text-xl font-semibold text-slip-ink tabular-nums">
            {formatGuarani(product.price)}
          </p>

          <ProductPromoSummary
            className="mt-4"
            onViewAll={openPromoInfo}
          />

          {product.description.trim() && (
            <p className="mt-6 text-slip-ink/80 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full">
              {product.description}
            </p>
          )}

          {showColors && (
            <ColorPicker
              colors={product.colors}
              selected={selectedColor}
              onChange={setSelectedColor}
            />
          )}

          <SizePicker
            category={category}
            size={size}
            onCategoryChange={setCategory}
            onSizeChange={setSize}
          />

          <div className="mt-6 space-y-3">
            <WhatsAppButton
              phone={phone}
              productName={product.name}
              price={product.price}
              category={category}
              size={size}
              color={showColors ? selectedColor : undefined}
            />
            <ShippingNote />
          </div>
        </div>
      </div>
    </div>
  );
}
