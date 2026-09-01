import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification03Icon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { supabase } from "@/integrations/supabase/client";
import {
  useProfile,
  useRoles,
  useSession,
  type AppRole,
} from "@/hooks/usePortal";
import { useTheme, type ThemeChoice } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Profile and settings | Brix Design Studio" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Manage your Brix profile, preferences, notifications and access details.",
      },
      { property: "og:title", content: "Profile and settings | Brix Design Studio" },
      {
        property: "og:description",
        content: "Manage your Brix profile, preferences, notifications and access details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

type SettingsTab = "profile" | "preferences" | "notifications" | "access";
type Frequency = "immediately" | "daily" | "never";
type FrequencyKey = "project" | "request" | "news";

const tabItems: Array<{
  id: SettingsTab;
  label: string;
  icon: typeof Settings02Icon;
}> = [
  { id: "profile", label: "Profile", icon: UserGroupIcon },
  { id: "preferences", label: "Preferences", icon: Settings02Icon },
  { id: "notifications", label: "Notifications", icon: Notification03Icon },
];

const inputClass =
  "w-full rounded-[3px] border border-input bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground";
const sectionClass = "border-b border-border py-8 first:pt-0 last:border-b-0";
const frequencyOptions: Array<{ value: Frequency; label: string }> = [
  { value: "immediately", label: "Immediately" },
  { value: "daily", label: "Daily summary" },
  { value: "never", label: "Never" },
];

function SettingsPage() {
  const { user } = useSession();
  const identity = user?.user_metadata as Record<string, unknown> | undefined;
  const { data: profile } = useProfile(user?.id, identity);
  const { data: roles } = useRoles(user?.id);
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);
  const [frequencies, setFrequencies] = useState<Record<FrequencyKey, Frequency>>({
    project: "immediately",
    request: "immediately",
    news: "daily",
  });

  const role: AppRole | undefined = roles?.includes("admin")
    ? "admin"
    : roles?.includes("designer")
      ? "designer"
      : roles?.includes("client")
        ? "client"
        : undefined;

  useEffect(() => {
    const saved = window.localStorage.getItem("brix-notification-frequencies");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Record<string, Frequency>;
      setFrequencies((current) => ({ ...current, ...parsed }));
    } catch {
      // Ignore malformed local preferences and keep accessible defaults.
    }
  }, []);

  function updateFrequency(key: FrequencyKey, value: Frequency) {
    const next = { ...frequencies, [key]: value };
    setFrequencies(next);
    window.localStorage.setItem("brix-notification-frequencies", JSON.stringify(next));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(data.get("full_name") ?? "").trim() || null,
        display_name: String(data.get("display_name") ?? "").trim() || null,
        job_title: String(data.get("job_title") ?? "").trim() || null,
        name_pronunciation: String(data.get("name_pronunciation") ?? "").trim() || null,
        timezone: String(data.get("timezone") ?? "").trim() || null,
        bio: String(data.get("bio") ?? "").trim() || null,
        phone: String(data.get("phone") ?? "").trim() || null,
        website_url: String(data.get("website_url") ?? "").trim() || null,
        instagram_handle: String(data.get("instagram_handle") ?? "").trim() || null,
        x_handle: String(data.get("x_handle") ?? "").trim() || null,
        linkedin_handle: String(data.get("linkedin_handle") ?? "").trim() || null,
      });
    setSaving(false);
    if (error) {
      toast.error("Your profile was not saved. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile saved.");
  }

  async function changeTheme(next: ThemeChoice) {
    if (!user) return;
    setTheme(next);
    const { error } = await supabase
      .from("profiles")
      .update({ theme_preference: next })
      .eq("id", user.id);
    if (error) toast.error("The theme was changed on this device, but not saved to your profile.");
  }

  async function setNotifyPreference(key: "notify_in_app" | "notify_email", value: boolean) {
    if (!user) return;
    const patch = key === "notify_in_app" ? { notify_in_app: value } : { notify_email: value };
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) {
      toast.error("That notification preference was not saved.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <PortalShell
      title="Profile and settings"
      description="Your details, preferences and notification choices for the studio portal."
      role={role}
      profileName={profile?.full_name}
      avatarUrl={profile?.avatar_url}
    >
      <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto lg:grid lg:content-start">
          <div role="tablist" aria-label="Settings tabs" className="flex gap-2 lg:grid">
            {tabItems.map((item) => (
              <Button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                variant={tab === item.id ? "secondary" : "ghost"}
                onClick={() => setTab(item.id)}
                className="justify-start rounded-full px-4 py-2.5 text-left font-normal lg:w-full"
              >
                <HugeiconsIcon icon={item.icon} size={17} strokeWidth={1.6} aria-hidden />
                {item.label}
              </Button>
            ))}
            <Button
              type="button"
              role="tab"
              aria-selected={tab === "access"}
              variant={tab === "access" ? "secondary" : "ghost"}
              onClick={() => setTab("access")}
              className="justify-start rounded-full px-4 py-2.5 text-left font-normal lg:w-full"
            >
              <HugeiconsIcon icon={UserGroupIcon} size={17} strokeWidth={1.6} aria-hidden />
              Access
            </Button>
          </div>
        </nav>

        <div className="min-w-0">
          {tab === "profile" ? (
            <form onSubmit={saveProfile} className="max-w-2xl">
              <section className={sectionClass} aria-labelledby="profile-details-heading">
                <h2 id="profile-details-heading" className="text-[20px] font-medium">
                  Edit your profile
                </h2>
                <p className="mt-2 text-caption text-muted-foreground">
                  Keep the details your project team sees up to date.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field id="full_name" label="Full name" defaultValue={profile?.full_name ?? ""} />
                  <Field id="display_name" label="Display name" defaultValue={profile?.display_name ?? ""} />
                  <Field id="job_title" label="Title" defaultValue={profile?.job_title ?? ""} />
                  <Field
                    id="name_pronunciation"
                    label="Name pronunciation"
                    defaultValue={profile?.name_pronunciation ?? ""}
                    placeholder="How should we say your name?"
                  />
                  <Field id="timezone" label="Time zone" defaultValue={profile?.timezone ?? ""} placeholder="e.g. Asia/Manila" />
                  <Field id="phone" label="Phone" defaultValue={profile?.phone ?? ""} type="tel" />
                </div>
                <label htmlFor="bio" className="label-caps mt-5 block text-muted-foreground">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue={profile?.bio ?? ""}
                  className={`${inputClass} mt-2 resize-y`}
                />
                <Button type="submit" disabled={saving} className="mt-6 rounded-full px-5">
                  {saving ? "Saving" : "Save profile"}
                </Button>
              </section>

              <section className={sectionClass} aria-labelledby="social-heading">
                <h2 id="social-heading" className="text-[20px] font-medium">Social links</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field id="instagram_handle" label="Instagram" defaultValue={profile?.instagram_handle ?? ""} placeholder="@username" />
                  <Field id="x_handle" label="X" defaultValue={profile?.x_handle ?? ""} placeholder="@username" />
                  <Field id="linkedin_handle" label="LinkedIn" defaultValue={profile?.linkedin_handle ?? ""} placeholder="Profile URL" />
                  <Field id="website_url" label="Website" defaultValue={profile?.website_url ?? ""} placeholder="https://" type="url" />
                </div>
                <Button type="submit" variant="outline" disabled={saving} className="mt-6 rounded-full px-5">
                  Save social links
                </Button>
              </section>
            </form>
          ) : null}

          {tab === "preferences" ? (
            <div className="max-w-2xl">
              <section className={sectionClass} aria-labelledby="appearance-heading">
                <h2 id="appearance-heading" className="text-[20px] font-medium">Appearance</h2>
                <p className="mt-2 text-caption text-muted-foreground">Choose how the portal looks on this device.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {(["system", "light", "dark"] as ThemeChoice[]).map((choice) => (
                    <Button
                      key={choice}
                      type="button"
                      variant={theme === choice ? "secondary" : "outline"}
                      onClick={() => void changeTheme(choice)}
                      className="h-auto justify-start rounded-xl px-4 py-4 capitalize"
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
              </section>
              <section className={sectionClass} aria-labelledby="language-heading">
                <h2 id="language-heading" className="text-[20px] font-medium">Language</h2>
                <p className="mt-2 text-caption text-muted-foreground">More languages will be available as the studio grows.</p>
                <label htmlFor="language" className="sr-only">Language</label>
                <select id="language" className={`${inputClass} mt-5 max-w-sm`} defaultValue={profile?.language ?? "English"}>
                  <option>English</option>
                </select>
              </section>
            </div>
          ) : null}

          {tab === "notifications" ? (
            <div className="max-w-2xl">
              <section className={sectionClass} aria-labelledby="delivery-heading">
                <h2 id="delivery-heading" className="text-[20px] font-medium">Delivery</h2>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  <PreferenceRow
                    label="Portal updates"
                    description="Show project activity and updates in the portal."
                    checked={profile?.notify_in_app ?? true}
                    onChange={(checked) => void setNotifyPreference("notify_in_app", checked)}
                  />
                  <PreferenceRow
                    label="Email updates"
                    description="Send important project updates to your email."
                    checked={profile?.notify_email ?? true}
                    onChange={(checked) => void setNotifyPreference("notify_email", checked)}
                  />
                </div>
              </section>
              <section className={sectionClass} aria-labelledby="activity-notifications-heading">
                <h2 id="activity-notifications-heading" className="text-[20px] font-medium">Activity preferences</h2>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  <FrequencyRow label="Project updates" value={frequencies["project"]} onChange={(value) => updateFrequency("project", value)} />
                  <FrequencyRow label="Request replies" value={frequencies["request"]} onChange={(value) => updateFrequency("request", value)} />
                  <FrequencyRow label="Studio news" value={frequencies["news"]} onChange={(value) => updateFrequency("news", value)} />
                </div>
              </section>
            </div>
          ) : null}

          {tab === "access" ? (
            <div className="max-w-2xl">
              <section className={sectionClass} aria-labelledby="access-heading">
                <h2 id="access-heading" className="text-[20px] font-medium">Account access</h2>
                <dl className="mt-6 divide-y divide-border border-y border-border">
                  <DetailRow label="Email" value={user?.email ?? "Not available"} />
                  <DetailRow
                    label="Role"
                    value={role === "admin" ? "Admin" : role === "designer" ? "Designer" : role === "client" ? "Client" : "Not assigned"}
                  />
                  <DetailRow label="Status" value={profile?.is_active === false ? "Deactivated" : "Active"} />
                  <DetailRow label="Sign-in" value="Managed by your studio account" />
                </dl>
              </section>
              <section className={sectionClass} aria-labelledby="security-heading">
                <h2 id="security-heading" className="text-[20px] font-medium">Security</h2>
                <p className="mt-2 text-caption text-muted-foreground">
                  Access changes and sign-in activity are managed by the studio account system.
                </p>
              </section>
            </div>
          ) : null}
        </div>
      </div>
    </PortalShell>
  );
}

function Field({
  id,
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caps block text-muted-foreground">
        {label}
      </label>
      <input id={id} name={id} type={type} defaultValue={defaultValue} placeholder={placeholder} className={`${inputClass} mt-2`} />
    </div>
  );
}

function PreferenceRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 py-5">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        <span className="mt-1 block text-caption text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

function FrequencyRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Frequency;
  onChange: (value: Frequency) => void;
}) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[15px] font-medium">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as Frequency)} className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm sm:w-44">
        {frequencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="label-caps text-muted-foreground">{label}</dt>
      <dd className="text-[15px]">{value}</dd>
    </div>
  );
}
