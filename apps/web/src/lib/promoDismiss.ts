const STORAGE_KEY = "slip-promo-strip-dismissed";

export const PROMO_STRIP_SHOW_EVENT = "slip-promo-strip-show";

export function isPromoStripDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissPromoStrip(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function showPromoStripAgain(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent(PROMO_STRIP_SHOW_EVENT));
}

export function subscribePromoStripShow(listener: () => void): () => void {
  window.addEventListener(PROMO_STRIP_SHOW_EVENT, listener);
  return () => window.removeEventListener(PROMO_STRIP_SHOW_EVENT, listener);
}
