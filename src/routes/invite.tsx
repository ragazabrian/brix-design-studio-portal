import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import wordmarkDark from "@/assets/brix-wordmark-dark.svg";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { supabase } from "@/integrations/supabase/client";
import { acceptPortalInvitation, getPortalInvitation } from "@/lib/invitations.functions";

export const Route = createFileRoute("/invite")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Accept invitation | Brix Design Studio" },
      { name: "description", content: "Accept your invitation to the Brix project portal." },
      { property: "og:title", content: "Accept invitation | Brix Design Studio" },
      { property: "og:description", content: "Join your Brix project workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

type InviteState = Awaited<ReturnType<typeof getPortalInvitation>>;

function InvitePage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const getInvite = useServerFn(getPortalInvitation);
  const acceptInvite = useServerFn(acceptPortalInvitation);
  const [invite, setInvite] = useState<InviteState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      token
        ? getInvite({ data: { token } })
        : Promise.resolve({ available: false as const, reason: "not_found" as const }),
      supabase.auth.getUser(),
    ]).then(([nextInvite, userResult]) => {
      if (!active) return;
      setInvite(nextInvite);
      setSessionEmail(userResult.data.user?.email ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [getInvite, token]);

  async function complete(password?: string, fullName?: string) {
    if (!token) return;
    setBusy(true);
    if (password || fullName) {
      const attributes = {
        ...(password ? { password } : {}),
        ...(fullName ? { data: { full_name: fullName } } : {}),
      };
      const { error } = await supabase.auth.updateUser(attributes);
      if (error) {
        setBusy(false);
        toast.error(error.message);
        return;
      }
    }
    try {
      const result = await acceptInvite({ data: { token } });
      toast.success("Your account is ready.");
      navigate({ to: result.destination as "/dashboard" });
    } catch (error) {
      setBusy(false);
      toast.error(error instanceof Error ? error.message : "The invitation could not be accepted.");
    }
  }

  async function signIn(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });
    setBusy(false);
    if (error) {
      toast.error("That email and password do not match an account.");
      return;
    }
    await complete();
  }

  async function onGoogleSuccess() {
    const { data } = await supabase.auth.getUser();
    setSessionEmail(data.user?.email ?? null);
  }

  function onGoogleError(message: string) {
    toast.error(message);
  }

  const field =
    "w-full rounded-md border border-paper/15 bg-paper/[0.06] px-4 py-3 text-paper placeholder:text-paper/40 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

  return (
    <main className="portal-auth-theme flex min-h-svh items-center justify-center bg-obsidian px-5 py-10 text-paper">
      <section
        className="w-full max-w-lg border border-paper/15 bg-paper/[0.04] p-6 sm:p-10"
        aria-live="polite"
      >
        <img src={wordmarkDark} alt="Brix Design Studio" className="h-4 w-auto" />
        {loading ? (
          <p className="mt-12 text-paper/60">Checking your invitation.</p>
        ) : !invite?.available ? (
          <div className="mt-12">
            <h1 className="text-3xl font-semibold">This invitation is unavailable</h1>
            <p className="mt-4 text-paper/60">
              It may have expired, been cancelled, or already been accepted. Ask your Brix contact
              for a new invitation.
            </p>
            <Button asChild className="mt-8">
              <a href="/client-login">Go to client sign in</a>
            </Button>
          </div>
        ) : (
          <div className="mt-10">
            <HugeiconsIcon
              icon={Mail01Icon}
              size={28}
              strokeWidth={1.5}
              aria-hidden
              className="text-brand"
            />
            <p className="label-caps mt-6 text-paper/50">Portal invitation</p>
            <h1 className="mt-3 text-3xl font-semibold">
              Join Brix as{" "}
              {invite.role === "client"
                ? "a client"
                : invite.role === "designer"
                  ? "a designer"
                  : "an admin"}
            </h1>
            <p className="mt-4 text-paper/65">
              This invitation is for <strong className="text-paper">{invite.email}</strong>.
            </p>
            {invite.projects.length > 0 ? (
              <p className="mt-2 text-paper/65">Projects: {invite.projects.join(", ")}</p>
            ) : null}
            {invite.note ? (
              <p className="mt-5 border-l-2 border-brand pl-4 text-sm text-paper/70">
                {invite.note}
              </p>
            ) : null}

            {sessionEmail ? (
              sessionEmail.toLowerCase() === invite.email.toLowerCase() ? (
                <form
                  className="mt-8 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    void complete(
                      String(data.get("password") ?? ""),
                      String(data.get("full_name") ?? ""),
                    );
                  }}
                >
                  <div>
                    <label htmlFor="full_name" className="label-caps mb-2 block text-paper/55">
                      Full name
                    </label>
                    <input id="full_name" name="full_name" required className={field} />
                  </div>
                  <div>
                    <label htmlFor="new_password" className="label-caps mb-2 block text-paper/55">
                      Set password (optional)
                    </label>
                    <input
                      id="new_password"
                      name="password"
                      type="password"
                      minLength={8}
                      autoComplete="new-password"
                      className={field}
                    />
                    <p className="mt-2 text-xs text-paper/45">
                      Leave blank if you use Google or already have a password.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="h-11 w-full bg-brand text-paper hover:bg-brand-deep"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                    {busy ? "Setting up your account" : "Accept invitation"}
                  </Button>
                </form>
              ) : (
                <p className="mt-8 border border-destructive/40 bg-destructive/10 p-4 text-sm">
                  You are signed in as {sessionEmail}. Sign out, then use {invite.email} to accept
                  this invitation.
                </p>
              )
            ) : (
              <div className="mt-8">
                <GoogleSignInButton
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                  className="flex justify-center"
                />
                <div className="my-5 flex items-center gap-3 text-xs text-paper/40">
                  <span className="h-px flex-1 bg-paper/15" />
                  or sign in
                  <span className="h-px flex-1 bg-paper/15" />
                </div>
                <form onSubmit={signIn} className="space-y-4">
                  <div>
                    <label htmlFor="invite_email" className="label-caps mb-2 block text-paper/55">
                      Email
                    </label>
                    <input
                      id="invite_email"
                      name="email"
                      type="email"
                      readOnly
                      value={invite.email}
                      className={field}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="invite_password"
                      className="label-caps mb-2 block text-paper/55"
                    >
                      Password
                    </label>
                    <input
                      id="invite_password"
                      name="password"
                      type="password"
                      required
                      className={field}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="h-11 w-full bg-brand text-paper hover:bg-brand-deep"
                  >
                    {busy ? "Signing in" : "Sign in and accept"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
