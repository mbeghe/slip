import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { PromoModal } from "./PromoModal";

type PromoContextValue = {
  openPromoInfo: () => void;
};

const PromoContext = createContext<PromoContextValue | null>(null);

export function PromoProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPromoInfo = useCallback(() => setOpen(true), []);

  return (
    <PromoContext.Provider value={{ openPromoInfo }}>
      {children}
      <PromoModal open={open} onClose={() => setOpen(false)} />
    </PromoContext.Provider>
  );
}

export function usePromoInfo() {
  const ctx = useContext(PromoContext);
  if (!ctx) {
    throw new Error("usePromoInfo debe usarse dentro de PromoProvider");
  }
  return ctx;
}
