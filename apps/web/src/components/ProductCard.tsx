import { Link } from "react-router-dom";
import type { Product } from "../types";
import { formatGuarani } from "../lib/format";
import { catalogCoverUrl } from "../lib/productImages";
import { ProductImage } from "./ProductImage";

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  const cover = catalogCoverUrl(product);

  return (
    <Link
      to={`/catalogo/${product.slug}`}
      className="group block rounded-2xl overflow-hidden border border-slip-accent-blue/20 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <ProductImage
        src={cover}
        alt={product.name}
        className="aspect-square"
        imgClassName="group-hover:scale-[1.02] transition-transform duration-300"
      />
      <div className="p-4">
        <h2 className="font-bold text-lg text-slip-ink group-hover:text-slip-primary transition-colors">
          {product.name}
        </h2>
        <p className="mt-1 text-slip-ink font-semibold">
          {formatGuarani(product.price)}
        </p>
      </div>
    </Link>
  );
}
