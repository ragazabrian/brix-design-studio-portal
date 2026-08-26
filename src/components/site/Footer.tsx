import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  Facebook02Icon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";

import { menuLinks, studio } from "@/data/site";

const socialIcons: Record<string, typeof InstagramIcon> = {
  Instagram: InstagramIcon,
  Facebook: Facebook02Icon,
  LinkedIn: Linkedin01Icon,
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:py-16">
        <div>
          <p className="font-display text-2xl">{studio.name}</p>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Brand and design work for companies that need one clear system, plus a portal where
            every file lives.
          </p>
          <ul className="mt-6 flex items-center gap-3">
            {studio.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-ink hover:text-paper"
                  aria-label={`${studio.name} on ${social.label}`}
                >
                  <HugeiconsIcon
                    icon={socialIcons[social.label] ?? InstagramIcon}
                    size={20}
                    strokeWidth={1.6}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <nav aria-label="Footer">
            <h2 className="label-caps text-muted-foreground">Pages</h2>
            <ul className="mt-4 space-y-2">
              {menuLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[15px] underline-offset-4 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="label-caps text-muted-foreground">Contact</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              <li>{studio.contactName}</li>
              <li>
                <a href={`mailto:${studio.email}`} className="underline-offset-4 hover:underline">
                  {studio.email}
                </a>
              </li>
              <li className="text-muted-foreground">{studio.location}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="page-shell flex flex-col gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {studio.name}. All rights reserved.
        </p>
        <p>English</p>
      </div>
    </footer>
  );
}
