import { formatGuarani } from "./format";

export const UNIT_PRICE = 250_000;

export type PromoTier = {
  id: string;
  label: string;
  detail: string;
  total: number;
  compareAt: number;
  savings: number;
  highlight?: boolean;
};

/** Precios de promo Slip — ahorro vs comprar al precio unitario */
export const PROMO_TIERS: PromoTier[] = [
  {
    id: "1",
    label: "1 par",
    detail: "Precio por par",
    total: 250_000,
    compareAt: 250_000,
    savings: 0,
  },
  {
    id: "2",
    label: "2 pares",
    detail: `${formatGuarani(225_000)} c/u`,
    total: 450_000,
    compareAt: 500_000,
    savings: 50_000,
  },
  {
    id: "3",
    label: "3 pares",
    detail: `${formatGuarani(212_500)} c/u`,
    total: 637_500,
    compareAt: 750_000,
    savings: 112_500,
    highlight: true,
  },
];

export function formatSavings(amount: number): string {
  if (amount <= 0) return "";
  return `Ahorrás ${formatGuarani(amount)}`;
}

/** Descuento vs comprar la misma cantidad al precio unitario */
export function tierPercentOff(tier: PromoTier): number {
  if (tier.compareAt <= 0 || tier.savings <= 0) return 0;
  return Math.round((tier.savings / tier.compareAt) * 100);
}
