import { useEffect } from "react";
import { PROMO_TIERS, UNIT_PRICE, tierPercentOff } from "../lib/promo";
import { formatGuarani } from "../lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PromoModal({ open, onClose }: Props) {
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
      aria-labelledby="promo-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slip-ink/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl border border-slip-accent-blue/20 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2
            id="promo-modal-title"
            className="text-lg font-bold text-slip-primary"
          >
            Promo por cantidad
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full w-8 h-8 shrink-0 flex items-center justify-center text-slip-ink hover:bg-slip-surface-warm font-bold"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-slip-accent-blue mb-4">
          Todos los modelos: {formatGuarani(UNIT_PRICE)} por par.
        </p>

        <ul className="space-y-3 text-sm">
          {PROMO_TIERS.map((tier) => {
            const pct = tierPercentOff(tier);
            return (
              <li
                key={tier.id}
                className={`rounded-xl px-3 py-2.5 border ${
                  tier.highlight
                    ? "border-slip-primary/30 bg-slip-surface-warm/50"
                    : "border-slip-accent-blue/20 bg-slip-surface-cool/30"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="font-semibold text-slip-ink">
                    {tier.label}
                  </span>
                  <span className="font-bold text-slip-primary tabular-nums">
                    {formatGuarani(tier.total)}
                  </span>
                </div>
                {pct > 0 && (
                  <p className="text-xs text-slip-accent-teal mt-0.5">
                    {pct}% menos que comprar {tier.label} al precio unitario
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
