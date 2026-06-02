import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { SizeGuideModal } from "./SizeGuideModal";
import type { SizeCategory } from "../lib/sizes";

type SizeGuideContextValue = {
  openSizeGuide: (tab?: SizeCategory) => void;
};

const SizeGuideContext = createContext<SizeGuideContextValue | null>(null);

export function SizeGuideProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SizeCategory>("kids");

  const openSizeGuide = useCallback((initialTab: SizeCategory = "kids") => {
    setTab(initialTab);
    setOpen(true);
  }, []);

  return (
    <SizeGuideContext.Provider value={{ openSizeGuide }}>
      {children}
      <SizeGuideModal
        open={open}
        onClose={() => setOpen(false)}
        initialTab={tab}
      />
    </SizeGuideContext.Provider>
  );
}

export function useSizeGuide() {
  const ctx = useContext(SizeGuideContext);
  if (!ctx) {
    throw new Error("useSizeGuide debe usarse dentro de SizeGuideProvider");
  }
  return ctx;
}
