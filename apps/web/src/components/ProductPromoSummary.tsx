import { PROMO_TIERS, formatSavings } from "../lib/promo";
import { formatGuarani } from "../lib/format";

type Props = {
  onViewAll?: () => void;
  className?: string;
};

/** Promo compacta para ficha de producto */
export function ProductPromoSummary({ onViewAll, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-slip-accent-blue/20 bg-white/70 p-3 space-y-2 ${className}`.trim()}
    >
      <p className="text-xs font-bold text-slip-primary">Promo por cantidad</p>
      <ul className="space-y-1.5">
        {PROMO_TIERS.map((tier) => (
          <li
            key={tier.id}
            className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-sm"
          >
            <span className="font-medium text-slip-ink">{tier.label}</span>
            <span className="tabular-nums">
              <span className="font-bold text-slip-primary">
                {formatGuarani(tier.total)}
              </span>
              {tier.savings > 0 && (
                <span className="text-xs text-slip-accent-teal ml-1.5">
                  ({formatSavings(tier.savings).toLowerCase()})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-slip-primary hover:underline underline-offset-2"
        >
          Ver detalle de promos
        </button>
      )}
    </div>
  );
}
