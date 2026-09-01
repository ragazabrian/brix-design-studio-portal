import { Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Calendar03Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  File01Icon,
  GridIcon,
  Logout01Icon,
  Menu01Icon,
  Message01Icon,
  Notification03Icon,
  Settings02Icon,
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
];

function NotificationsPopover({ onClose }: { onClose: () => void }) {
  const { user } = useSession();
  const { data: items } = useNotifications(user?.id);
  const queryClient = useQueryClient();
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
    <div
      role="region"
      aria-label="Notifications"
      className="mt-2 rounded-2xl border border-border bg-background p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="label-caps text-muted-foreground">Notifications</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} strokeWidth={1.6} aria-hidden />
        </button>
      </div>
      {items && items.length > 0 ? (
        <>
          <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className={`rounded-xl p-2.5 ${item.read_at ? "" : "bg-muted"}`}>
                <p className="text-[14px] font-medium">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 text-caption text-muted-foreground">{item.body}</p>
                ) : null}
                <p className="mt-1 text-caption text-muted-foreground tabular-nums">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="mt-2 text-sm underline underline-offset-4 disabled:opacity-50"
          >
            Mark all read
          </button>
        </>
      ) : (
        <p className="mt-2 text-caption text-muted-foreground">
          Nothing here yet. File changes and requests show up in this list.
        </p>
      )}
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
  hideAssistantDock,
  children,
}: {
  title: string;
  description?: string | undefined;
  role?: AppRole | undefined;
  profileName?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  actions?: ReactNode;
  /** Set on pages that already show the full assistant. */
  hideAssistantDock?: boolean | undefined;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const { user } = useSession();
  const { data: notifications } = useNotifications(user?.id);
  const [navOpen, setNavOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const unread = (notifications ?? []).filter((item) => !item.read_at).length;

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
      {/* Mobile menu button, kept out of a top bar on purpose. */}
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        aria-expanded={navOpen}
        aria-controls="portal-nav"
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card lg:hidden"
      >
        <HugeiconsIcon icon={Menu01Icon} size={19} strokeWidth={1.6} aria-hidden />
        <span className="sr-only">Open portal menu</span>
      </button>

      {navOpen ? (
        <button
          type="button"
          aria-label="Close portal menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
        />
      ) : null}

      {/* Sidebar: navigation, notifications, profile and sign out all live here. */}
      <div
        id="portal-nav"
        className={`${
          navOpen ? "fixed inset-y-0 left-0 z-50 w-[17rem] overflow-y-auto" : "hidden"
        } flex flex-col gap-6 border-border bg-card px-5 py-6 lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-auto lg:overflow-y-auto lg:border-r`}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/dashboard"
            aria-label={`${studio.shortName} portal home`}
            onClick={() => setNavOpen(false)}
            className="flex items-center"
          >
            <img
              src={resolvedTheme === "dark" ? wordmarkDark.url : wordmarkLight.url}
              alt={`${studio.shortName} wordmark`}
              width={1939}
              height={573}
              className="h-4 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close portal menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted lg:hidden"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.6} aria-hidden />
          </button>
        </div>

        <nav aria-label="Portal sections" className="grid gap-1">
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

        <div className="mt-auto grid gap-1 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setNotifyOpen((value) => !value)}
            aria-expanded={notifyOpen}
            className={`${linkClass} w-full text-left`}
          >
            <HugeiconsIcon icon={Notification03Icon} size={18} strokeWidth={1.6} aria-hidden />
            <span className="flex-1">Notifications</span>
            {unread > 0 ? (
              <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[11px] font-medium tabular-nums text-primary-foreground">
                {unread}
              </span>
            ) : null}
          </button>
          {notifyOpen ? <NotificationsPanel onClose={() => setNotifyOpen(false)} /> : null}

          <Link
            to="/settings"
            onClick={() => setNavOpen(false)}
            activeProps={{ className: "bg-muted text-foreground" }}
            className={linkClass}
          >
            <HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={1.6} aria-hidden />
            Profile and settings
          </Link>

          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-muted px-3 py-2.5">
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
                className="h-9 w-9 shrink-0 rounded-full bg-background object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{profileName ?? "Your account"}</p>
              {role ? <p className="text-caption text-muted-foreground">{roleLabel[role]}</p> : null}
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-background"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.6} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <main id="main" className="flex-1 px-5 pb-40 pt-16 md:px-8 lg:pt-10">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="display-serif text-[clamp(1.75rem,4vw,2.5rem)]">{title}</h1>
                {description ? (
                  <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      {(role === "admin" || role === "designer") && !hideAssistantDock ? <AssistantDock /> : null}
    </div>
  );
}
