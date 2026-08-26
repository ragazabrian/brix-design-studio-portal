import { useId, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import type { NewsItem } from "@/data/site";
import { ArrowLink } from "@/components/site/Primitives";
import { cn } from "@/lib/utils";

export function NewsAccordionItem({ item }: { item: NewsItem }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const [day, month, year] = item.date.split(".");

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 py-6 text-left md:gap-8 md:py-8"
        >
          <span className="label-caps shrink-0 text-muted-foreground">
            <span className="block">{day}</span>
            <span className="block">{month}</span>
            <span className="block">{year}</span>
          </span>
          <span className="min-w-0 font-display text-[clamp(1.25rem,2.6vw,1.9rem)] leading-tight">
            {item.title}
          </span>
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition-transform duration-300",
              open && "rotate-45 bg-ink text-paper",
            )}
            aria-hidden
          >
            <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={1.8} />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        hidden={!open}
        className="grid grid-cols-1 gap-4 pb-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-8"
      >
        <span aria-hidden className="hidden w-[3.5rem] md:block" />
        <div>
          <p className="max-w-2xl text-muted-foreground md:text-[17px]">{item.body}</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {item.links.map((link) => (
              <li key={link.label}>
                <ArrowLink to={link.to} href={link.href}>
                  {link.label}
                </ArrowLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
