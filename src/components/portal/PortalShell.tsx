import { Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon, Notification03Icon } from "@hugeicons/core-free-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { studio } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, useSession, type AppRole } from "@/hooks/usePortal";
import wordmarkLight from "@/assets/brix-wordmark-light.svg.asset.json";

const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  designer: "Designer",
  client: "Client",
};

function NotificationBell() {
  const { user } = useSession();
  const { data: items } = useNotifications(user?.id);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const unread = (items ?? []).filter((item) => !item.read_at).length;

  async function markAllRead() {
    if (!user || unread === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    await queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications, nothing unread"
        }
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-frost"
      >
        <HugeiconsIcon icon={Notification03Icon} size={19} strokeWidth={1.6} aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-ink px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-paper">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="region"
          aria-label="Notifications"
          className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-3xl border border-border bg-paper p-4 shadow-lg"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="label-caps text-muted-foreground">Notifications</h2>
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm underline underline-offset-4 disabled:opacity-50"
              disabled={unread === 0}
            >
              Mark all read
            </button>
          </div>
          {items && items.length > 0 ? (
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-2xl p-3 ${item.read_at ? "bg-paper" : "bg-frost"}`}
                >
                  <p className="text-[15px] font-medium">{item.title}</p>
                  {item.body ? (
                    <p className="mt-1 text-caption text-muted-foreground">{item.body}</p>
                  ) : null}
                  <p className="mt-1 text-caption text-muted-foreground tabular-nums">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-caption text-muted-foreground">
              Nothing here yet. Connection updates and file changes will show up in this list.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

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
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/portal", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-border">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link
            to="/dashboard"
            aria-label={`${studio.shortName} portal home`}
            className="flex items-center gap-2"
          >
            <img
              src={wordmarkLight.url}
              alt={`${studio.shortName} wordmark`}
              width={1939}
              height={573}
              className="h-5 w-auto"
            />
            <span className="hidden text-sm text-muted-foreground sm:inline">Client Portal</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <nav aria-label="Portal" className="flex items-center gap-1">
              <Link
                to="/dashboard"
                activeProps={{ className: "bg-frost" }}
                className="rounded-full px-3 py-2 text-sm transition-colors hover:bg-frost"
              >
                Projects
              </Link>
              <Link
                to="/assistant"
                activeProps={{ className: "bg-frost" }}
                className="rounded-full px-3 py-2 text-sm transition-colors hover:bg-frost"
              >
                Assistant
              </Link>
              {role === "admin" ? (
                <Link
                  to="/admin"
                  activeProps={{ className: "bg-frost" }}
                  className="rounded-full px-3 py-2 text-sm transition-colors hover:bg-frost"
                >
                  Team
                </Link>
              ) : null}
              <Link
                to="/settings"
                activeProps={{ className: "bg-frost" }}
                className="rounded-full px-3 py-2 text-sm transition-colors hover:bg-frost"
              >
                Settings
              </Link>
            </nav>

            {role ? (
              <span className="label-caps rounded-full bg-frost px-3 py-1.5 text-ink">
                {roleLabel[role]}
              </span>
            ) : null}

            <NotificationBell />

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profileName ? `Profile photo of ${profileName}` : "Your profile photo"}
                width={36}
                height={36}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                className="h-9 w-9 shrink-0 rounded-full bg-frost object-cover"
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
