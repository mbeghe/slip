import {
  SIZE_CATEGORY_LABELS,
  defaultSizeForCategory,
  formatSizeLabel,
  sizesForCategory,
  type SizeCategory,
} from "../lib/sizes";
import { SizeGuideTrigger } from "./SizeGuideTrigger";
import { useSizeGuide } from "./SizeGuideProvider";

type Props = {
  category: SizeCategory;
  size: string;
  onCategoryChange: (category: SizeCategory) => void;
  onSizeChange: (size: string) => void;
};

export function SizePicker({
  category,
  size,
  onCategoryChange,
  onSizeChange,
}: Props) {
  const { openSizeGuide } = useSizeGuide();
  const sizes = sizesForCategory(category);

  return (
    <section className="mt-6 rounded-xl border border-slip-accent-blue/25 bg-white/75 backdrop-blur-sm p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-base font-bold text-slip-ink">Elegí tu talle</h3>
        <SizeGuideTrigger onClick={() => openSizeGuide(category)} />
      </div>

      <div>
        <p className="text-sm font-semibold text-slip-ink mb-2">Categoría</p>
        <div className="flex flex-wrap gap-2">
          {(["kids", "adults"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onCategoryChange(key);
                onSizeChange(defaultSizeForCategory(key));
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === key
                  ? "bg-slip-primary text-white"
                  : "bg-white text-slip-ink hover:bg-slip-surface-warm border border-slip-accent-blue/20"
              }`}
            >
              {SIZE_CATEGORY_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slip-ink mb-2">
          Talle ({category === "kids" ? "niños" : "adultos"})
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Talle">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSizeChange(s)}
              className={`min-w-[4.5rem] rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                size === s
                  ? "bg-slip-primary text-white"
                  : "bg-white text-slip-ink hover:bg-slip-surface-warm border border-slip-accent-blue/20"
              }`}
            >
              {formatSizeLabel(s, category)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
