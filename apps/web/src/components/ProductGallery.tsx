import { useEffect, useState } from "react";
import { ProductImage } from "./ProductImage";

const MAX_IMAGES = 12;

type Props = {
  imageUrls: string[];
  alt: string;
};

export function ProductGallery({ imageUrls, alt }: Props) {
  const [index, setIndex] = useState(0);
  const images = imageUrls.slice(0, MAX_IMAGES);

  useEffect(() => {
    setIndex(0);
  }, [imageUrls.join("|")]);

  useEffect(() => {
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  const main = images[index];

  return (
    <div className="space-y-3">
      <ProductImage
        src={main}
        alt={alt}
        className="aspect-square rounded-2xl border border-slip-accent-blue/20"
      />
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory"
          role="tablist"
          aria-label="Más fotos del producto"
        >
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Foto ${i + 1} de ${images.length}`}
              onClick={() => setIndex(i)}
              className={`shrink-0 snap-start rounded-lg overflow-hidden border-2 transition-colors ${
                i === index
                  ? "border-slip-primary ring-2 ring-slip-primary/25"
                  : "border-slip-accent-blue/25 opacity-80 hover:opacity-100"
              }`}
            >
              <img
                src={url}
                alt=""
                className="h-20 w-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { MAX_IMAGES as MAX_PRODUCT_IMAGES };
