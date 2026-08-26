import { useState } from "react";

import { clientNames } from "@/data/site";
import { cn } from "@/lib/utils";

function Row({ names, direction }: { names: string[]; direction: "left" | "right" }) {
  const [paused, setPaused] = useState(false);
  const doubled = [...names, ...names];

  return (
    <div
      className="overflow-hidden py-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <ul
        className={cn(
          "flex w-max items-center gap-10",
          direction === "left" ? "marquee-track-left" : "marquee-track-right",
          paused && "marquee-paused",
        )}
      >
        {doubled.map((name, index) => (
          <li key={`${name}-${index}`} className="flex items-center gap-10">
            <span className="whitespace-nowrap font-display text-xl text-muted-foreground md:text-2xl">
              {name}
            </span>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-border" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LogoMarquee() {
  const half = Math.ceil(clientNames.length / 2);

  return (
    <section aria-label="Selected clients" className="border-y border-border py-8 md:py-10">
      <h2 className="page-shell label-caps mb-4 text-muted-foreground">Clients</h2>
      <Row names={clientNames.slice(0, half)} direction="left" />
      <Row names={clientNames.slice(half)} direction="right" />
    </section>
  );
}
