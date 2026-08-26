import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "@/components/site/SiteShell";
import { PillButton, Reveal } from "@/components/site/Primitives";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Sign in to the Brix Client Portal" },
      {
        name: "description",
        content:
          "Sign in to the Brix Design Studio Client Portal with Google or email to reach your files, guidelines, tasks and hours.",
      },
      { property: "og:title", content: "Sign in to the Brix Client Portal" },
      {
        property: "og:description",
        content: "Reach your files, guidelines, tasks and hours in the Brix Client Portal.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalAuthPage,
});

const inputClass =
  "w-full rounded-3xl border border-paper/25 bg-paper/5 px-5 py-3 text-[15px] text-paper placeholder:text-paper/50 focus-visible:border-paper";

function PortalAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/dashboard" });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign in did not complete. Try again or use email.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: String(data.get("full_name") ?? "") },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created. Check your inbox if confirmation is required.");
      navigate({ to: "/dashboard" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("That email and password do not match an account.");
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <SiteShell>
      <section className="page-shell py-14 md:py-20">
        <Reveal className="mx-auto max-w-xl">
          <div className="rounded-3xl bg-ink p-6 text-paper md:p-10">
            <h1 className="display-serif text-[clamp(1.75rem,4vw,2.5rem)]">
              {mode === "signin" ? "Sign in to your portal" : "Create your portal account"}
            </h1>
            <p className="mt-4 text-paper/70">
              {mode === "signin"
                ? "Your files, guidelines, tasks and hours, in one place."
                : "Use your work email so we can match you to the right projects."}
            </p>

            <button
              type="button"
              onClick={onGoogle}
              disabled={busy}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-paper px-5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-paper/90 disabled:opacity-60"
            >
              <HugeiconsIcon icon={GoogleIcon} size={20} strokeWidth={1.6} aria-hidden />
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-4 text-paper/50">
              <span className="h-px flex-1 bg-paper/20" />
              <span className="text-caption">or</span>
              <span className="h-px flex-1 bg-paper/20" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" ? (
                <div>
                  <label htmlFor="full_name" className="label-caps mb-2 block text-paper/70">
                    Full name
                  </label>
                  <input id="full_name" name="full_name" required className={inputClass} />
                </div>
              ) : null}
              <div>
                <label htmlFor="email" className="label-caps mb-2 block text-paper/70">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@work-email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="password" className="label-caps mb-2 block text-paper/70">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={inputClass}
                />
              </div>
              <PillButton
                type="submit"
                variant="lime"
                disabled={busy}
                className="w-full disabled:opacity-60"
              >
                {mode === "signin" ? "Sign in" : "Create account"}
              </PillButton>
            </form>

            <p className="mt-6 text-caption text-paper/60">
              {mode === "signin" ? "New to the portal? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="underline underline-offset-4 hover:text-paper"
              >
                {mode === "signin" ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
