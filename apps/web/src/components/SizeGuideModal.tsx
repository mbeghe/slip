import { useEffect, useState } from "react";
import {
  SIZE_CATEGORY_LABELS,
  SIZE_GUIDE_IMAGES,
  type SizeCategory,
} from "../lib/sizes";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab?: SizeCategory;
};

export function SizeGuideModal({ open, onClose, initialTab = "kids" }: Props) {
  const [tab, setTab] = useState<SizeCategory>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slip-ink/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slip-surface-cool shadow-xl">
        <div className="sticky top-0 bg-slip-surface-cool border-b border-slip-accent-blue/30 px-4 py-3 flex items-center justify-between gap-3">
          <h2 id="size-guide-title" className="text-lg font-bold text-slip-primary">
            Guía de talles
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center text-slip-ink hover:bg-white/60 font-bold"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-3 sm:p-5">
          <div className="flex gap-2 mb-4">
            {(["kids", "adults"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                  tab === key
                    ? "bg-slip-primary text-white"
                    : "bg-white/70 text-slip-ink hover:bg-white"
                }`}
              >
                {SIZE_CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>
          <img
            src={SIZE_GUIDE_IMAGES[tab]}
            alt={`Tabla de talles ${SIZE_CATEGORY_LABELS[tab].toLowerCase()}`}
            className="w-full h-auto rounded-lg object-contain"
          />
          <p className="mt-3 text-xs text-slip-accent-blue text-center">
            Medí el largo de la base del pie para elegir tu talle.
          </p>
        </div>
      </div>
    </div>
  );
}
