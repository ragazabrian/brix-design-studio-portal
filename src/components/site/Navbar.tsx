import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";

import { studio } from "@/data/site";
import wordmarkLight from "@/assets/brix-wordmark-light.svg.asset.json";
import wordmarkDark from "@/assets/brix-wordmark-dark.svg.asset.json";
import { FullScreenMenu } from "@/components/site/FullScreenMenu";
import { cn } from "@/lib/utils";

export function Navbar({ overHero = false }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = overHero && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to main content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          transparent ? "bg-transparent" : "border-b border-border bg-paper/95 backdrop-blur",
        )}
      >
        <div className="page-shell flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" aria-label={`${studio.shortName} home`} className="flex items-center">
            <img
              src={transparent ? wordmarkDark.url : wordmarkLight.url}
              alt={`${studio.shortName} wordmark`}
              width={1939}
              height={573}
              className="h-6 w-auto md:h-7"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/portal"
              className={cn(
                "hidden rounded-full px-4 py-2 text-[15px] font-medium transition-colors sm:inline-flex",
                transparent
                  ? "border border-paper/70 text-paper hover:bg-paper hover:text-ink"
                  : "bg-ink text-paper hover:bg-ink/85",
              )}
            >
              Log in
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                transparent
                  ? "border-paper/50 text-paper hover:bg-paper hover:text-ink"
                  : "border-border text-ink hover:bg-frost",
              )}
            >
              <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
