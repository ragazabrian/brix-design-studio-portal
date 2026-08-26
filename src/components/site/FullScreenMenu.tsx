import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { menuLinks, studio } from "@/data/site";

export function FullScreenMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          ref={panelRef}
          className="fixed inset-0 z-[60] flex flex-col bg-ink text-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
        >
          <div className="page-shell flex items-center justify-between py-6">
            <Link
              to="/"
              onClick={onClose}
              className="font-display text-xl tracking-tight text-paper"
            >
              {studio.shortName}
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-paper/40 text-paper transition-colors hover:bg-paper hover:text-ink"
              aria-label="Close menu"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.6} />
            </button>
          </div>

          <nav
            aria-label="Main"
            className="page-shell flex flex-1 flex-col justify-center overflow-y-auto py-8"
          >
            <ul className="space-y-1">
              {menuLinks.map((link, index) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.35,
                    delay: reduce ? 0 : 0.06 * index,
                    ease: "easeOut",
                  }}
                >
                  <Link
                    to={link.to}
                    onClick={onClose}
                    className="display-serif inline-flex items-baseline gap-3 py-1.5 text-[clamp(2.25rem,7vw,4.5rem)] text-paper transition-opacity hover:opacity-60"
                  >
                    {link.label}
                    {link.badge ? (
                      <span className="label-caps rounded-full bg-lime px-2.5 py-1 text-[11px] text-ink">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="page-shell grid gap-6 border-t border-paper/15 py-8 sm:grid-cols-2">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {studio.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="label-caps text-paper/70 hover:text-paper"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="text-sm text-paper/70 sm:text-right">
              <a href={`mailto:${studio.email}`} className="block hover:text-paper">
                {studio.email}
              </a>
              <p className="mt-1">
                &copy; {new Date().getFullYear()} {studio.name}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
