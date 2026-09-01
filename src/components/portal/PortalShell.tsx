import { Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Calendar03Icon,
  DashboardSquare01Icon,
  File01Icon,
  GridIcon,
  Logout01Icon,
  Menu01Icon,
  Message01Icon,
  Moon02Icon,
  Notification03Icon,
  Settings02Icon,
  Sun03Icon,
  SparklesIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { studio } from "@/data/site";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, useSession, type AppRole } from "@/hooks/usePortal";
import { useTheme } from "@/lib/theme";
import { AssistantDock } from "@/components/portal/AssistantDock";
import wordmarkLight from "@/assets/brix-wordmark-light.svg.asset.json";
import wordmarkDark from "@/assets/brix-wordmark-dark.svg.asset.json";

const roleLabel: Record<AppRole, string> = {
  admin: "Admin",
  designer: "Designer",
  client: "Client",
};

type NavItem = {
  to: string;
  label: string;
  icon: typeof DashboardSquare01Icon;
  staffOnly?: boolean;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { to: "/library", label: "Asset library", icon: GridIcon },
  { to: "/guidelines", label: "Brand guidelines", icon: BookOpen01Icon },
  { to: "/modules", label: "Module library", icon: SparklesIcon },
  { to: "/documents", label: "Documents", icon: File01Icon },
  { to: "/meetings", label: "Meetings", icon: Calendar03Icon },
  { to: "/requests", label: "Requests", icon: Message01Icon },
  { to: "/assistant", label: "Assistant", icon: Message01Icon, staffOnly: true },
  { to: "/admin", label: "Team", icon: UserGroupIcon, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings02Icon },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={dark}
      aria-label={dark ? "Switch to the light theme" : "Switch to the dark theme"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
    >
      <HugeiconsIcon icon={dark ? Sun03Icon : Moon02Icon} size={18} strokeWidth={1.6} aria-hidden />
    </button>
  );
}

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
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
      >
        <HugeiconsIcon icon={Notification03Icon} size={19} strokeWidth={1.6} aria-hidden />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-primary-foreground">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="region"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-3xl border border-border bg-card p-4 shadow-lg"
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
                  className={`rounded-2xl p-3 ${item.read_at ? "" : "bg-muted"}`}
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
              Nothing here yet. File changes and connection updates show up in this list.
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
  actions,
  children,
}: {
  title: string;
  description?: string | undefined;
  role?: AppRole | undefined;
  profileName?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  const items = navItems.filter((item) => {
    if (item.adminOnly) return role === "admin";
    if (item.staffOnly) return role === "admin" || role === "designer";
    return true;
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/portal", replace: true });
  }

  const linkClass =
    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Sidebar */}
      <div
        id="portal-nav"
        className={`${navOpen ? "block" : "hidden"} border-b border-border bg-card px-4 py-5 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-6`}
      >
        <Link
          to="/dashboard"
          aria-label={`${studio.shortName} portal home`}
          className="flex items-center gap-2"
        >
          <img
            src={theme === "dark" ? wordmarkDark.url : wordmarkLight.url}
            alt={`${studio.shortName} wordmark`}
            width={1939}
            height={573}
            className="h-4 w-auto"
          />
          <span className="text-caption text-muted-foreground">Client Portal</span>
        </Link>

        <nav aria-label="Portal sections" className="mt-7 grid gap-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setNavOpen(false)}
              activeProps={{ className: "bg-muted text-foreground" }}
              className={linkClass}
            >
              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.6} aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        {role ? (
          <p className="mt-7 rounded-2xl bg-muted px-4 py-3 text-caption text-muted-foreground">
            You are signed in as {roleLabel[role]}.
            {role === "client" ? " You can view and download, and raise requests." : ""}
          </p>
        ) : null}
      </div>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNavOpen((value) => !value)}
                aria-expanded={navOpen}
                aria-controls="portal-nav"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
              >
                <HugeiconsIcon icon={Menu01Icon} size={19} strokeWidth={1.6} aria-hidden />
                <span className="sr-only">Portal menu</span>
              </button>
              <span className="text-[15px] font-medium">{title}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {actions}
              <ThemeToggle />
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
                  className="h-9 w-9 shrink-0 rounded-full bg-muted object-cover"
                />
              ) : null}
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.6} aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1 px-5 pb-40 pt-8 md:px-8 md:pt-10">
          <div className="mx-auto w-full max-w-5xl">
            <h1 className="display-serif text-[clamp(1.75rem,4vw,2.5rem)]">{title}</h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
            ) : null}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      {role === "admin" || role === "designer" ? <AssistantDock /> : null}
    </div>
  );
}
