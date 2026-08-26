import type { ReactNode } from "react";

import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export function SiteShell({
  children,
  overHero = false,
}: {
  children: ReactNode;
  overHero?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar overHero={overHero} />
      <main id="main" className={overHero ? "flex-1" : "flex-1 pt-16 md:pt-20"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="page-shell border-b border-border py-14 md:py-20">
      <p className="label-caps text-muted-foreground">{label}</p>
      <h1 className="display-serif mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.25rem)]">{title}</h1>
      {intro ? <p className="mt-6 max-w-2xl text-muted-foreground md:text-[17px]">{intro}</p> : null}
    </header>
  );
}
