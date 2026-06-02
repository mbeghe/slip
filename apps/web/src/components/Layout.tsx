import { Link, Outlet, useLocation } from "react-router-dom";
import { PromoProvider, usePromoInfo } from "./PromoProvider";
import { PromoStrip } from "./PromoStrip";
import { SizeGuideProvider, useSizeGuide } from "./SizeGuideProvider";
import { SizeGuideTrigger } from "./SizeGuideTrigger";
import { SlipBackground } from "./SlipBackground";

function Header() {
  const { openSizeGuide } = useSizeGuide();

  return (
    <header className="relative z-10 border-b border-slip-accent-blue/20 bg-white/30 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="Slip" className="h-9 w-auto" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link
            to="/catalogo"
            className="text-slip-ink hover:text-slip-primary transition-colors"
          >
            Catálogo
          </Link>
          <SizeGuideTrigger onClick={() => openSizeGuide()} />
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  const { openPromoInfo } = usePromoInfo();

  return (
    <footer className="relative z-10 border-t border-slip-accent-blue/15 bg-white/25 backdrop-blur-md py-6 px-4">
      <div className="mx-auto max-w-6xl text-center space-y-3 text-sm">
        <p>
          <button
            type="button"
            onClick={openPromoInfo}
            className="font-semibold text-slip-primary hover:text-slip-primary-muted transition-colors underline-offset-2 hover:underline"
          >
            Ver promos por cantidad
          </button>
        </p>
        <p className="text-slip-accent-blue">© {new Date().getFullYear()} Slip</p>
      </div>
    </footer>
  );
}

function LayoutShell() {
  const { pathname } = useLocation();
  const showPromo = !pathname.startsWith("/admin");

  return (
    <div className="relative min-h-screen flex flex-col">
      <SlipBackground className="fixed inset-0 -z-10" />
      <Header />
      {showPromo && <PromoStrip />}
      <main className="relative z-[1] flex-1">
        <Outlet />
      </main>
      {showPromo ? <SiteFooter /> : (
        <footer className="relative z-10 border-t border-slip-accent-blue/15 bg-white/25 backdrop-blur-md py-6 text-center text-sm text-slip-accent-blue">
          <p>© {new Date().getFullYear()} Slip</p>
        </footer>
      )}
    </div>
  );
}

export function Layout() {
  return (
    <SizeGuideProvider>
      <PromoProvider>
        <LayoutShell />
      </PromoProvider>
    </SizeGuideProvider>
  );
}
