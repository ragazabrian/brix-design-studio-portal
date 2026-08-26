import { Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { studio } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/hooks/usePortal";

const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  designer: "Designer",
  client: "Client",
};

export function PortalShell({
  title,
  description,
  role,
  profileName,
  avatarUrl,
  children,
}: {
  title: string;
  description?: string | undefined;
  role?: AppRole | undefined;
  profileName?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/portal" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-border">
        <div className="page-shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4">
          <Link to="/" className="min-w-0">
            <span className="font-display text-xl tracking-tight">{studio.shortName}</span>
            <span className="ml-2 hidden text-sm text-muted-foreground sm:inline">Client Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            {role ? (
              <span className="label-caps rounded-full bg-frost px-3 py-1.5 text-ink">
                {roleLabel[role]}
              </span>
            ) : null}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profileName ? `Profile photo of ${profileName}` : "Your profile photo"}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : null}
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-frost"
            >
              <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.6} aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="page-shell flex-1 py-10 md:py-14">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
          <h1 className="display-serif text-[clamp(1.75rem,4vw,2.75rem)]">{title}</h1>
          {description ? <p className="max-w-2xl text-muted-foreground">{description}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}
