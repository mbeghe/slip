import { useEffect, useState } from "react";
import { PROMO_TIERS, UNIT_PRICE, tierPercentOff } from "../lib/promo";
import {
  dismissPromoStrip,
  isPromoStripDismissed,
  subscribePromoStripShow,
} from "../lib/promoDismiss";
import { formatGuarani } from "../lib/format";
import { usePromoInfo } from "./PromoProvider";

const EMPHASIS_MS = 5000;

function PromoSeparator() {
  return (
    <span
      className="inline-flex items-center justify-center mx-2 sm:mx-2.5 shrink-0"
      aria-hidden
    >
      <span className="size-1.5 rounded-full bg-slip-accent-blue/75" />
    </span>
  );
}

export function PromoStrip() {
  const { openPromoInfo } = usePromoInfo();
  const [open, setOpen] = useState(false);
  const [emphasized, setEmphasized] = useState(true);

  useEffect(() => {
    if (!isPromoStripDismissed()) setOpen(true);
  }, []);

  useEffect(() => {
    return subscribePromoStripShow(() => {
      setOpen(true);
      setEmphasized(false);
    });
  }, []);

  useEffect(() => {
    if (!open || !emphasized) return;
    const soften = window.setTimeout(() => setEmphasized(false), EMPHASIS_MS);
    return () => window.clearTimeout(soften);
  }, [open, emphasized]);

  function handleDismiss() {
    dismissPromoStrip();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Promoción por cantidad"
      className={`relative z-10 border-b backdrop-blur-md slip-promo-strip--enter ${
        emphasized
          ? "border-slip-primary/30 bg-slip-surface-warm/75 slip-promo-strip--emphasis"
          : "border-slip-accent-blue/15 bg-white/25"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-center gap-2 sm:gap-3 pr-1">
          <p className="text-center text-xs sm:text-sm text-slip-accent-blue leading-snug min-w-0">
            {emphasized && (
              <span className="block sm:inline font-bold text-slip-primary mb-0.5 sm:mb-0 sm:mr-2">
                Promo por cantidad
              </span>
            )}
            <span className="font-semibold text-slip-ink">
              1 par {formatGuarani(UNIT_PRICE)}
            </span>
            <PromoSeparator />
            {PROMO_TIERS.filter((t) => tierPercentOff(t) > 0).map((tier, i) => (
              <span key={tier.id}>
                {i > 0 && <PromoSeparator />}
                <span className="text-slip-ink font-medium">{tier.label}</span>{" "}
                <span className="font-bold text-slip-primary">
                  −{tierPercentOff(tier)}%
                </span>
              </span>
            ))}
            <PromoSeparator />
            <button
              type="button"
              onClick={openPromoInfo}
              className="font-semibold text-slip-primary hover:underline underline-offset-2"
            >
              Ver detalle
            </button>
          </p>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-slip-accent-blue hover:text-slip-ink hover:bg-white/50 border border-slip-accent-blue/25 transition-colors"
            aria-label="Ocultar promoción"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
