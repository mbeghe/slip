import { PROMO_TIERS, formatSavings } from "../lib/promo";
import { formatGuarani } from "../lib/format";

type Props = {
  className?: string;
};

/** Promo en prosa — mismo tono que el resto del sitio, sin banner ni chips */
export function PromoNote({ className = "" }: Props) {
  return (
    <p className={`text-slip-accent-blue leading-relaxed ${className}`.trim()}>
      Llevá más y pagás menos:{" "}
      {PROMO_TIERS.map((tier, i) => (
        <span key={tier.id}>
          {i > 0 && <span className="text-slip-accent-blue/50"> · </span>}
          <span className="text-slip-ink font-medium">
            {tier.label} {formatGuarani(tier.total)}
          </span>
          {tier.savings > 0 && (
            <span className="text-slip-accent-teal">
              {" "}
              ({formatSavings(tier.savings).toLowerCase()})
            </span>
          )}
        </span>
      ))}
    </p>
  );
}
