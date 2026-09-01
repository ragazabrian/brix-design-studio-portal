import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";

import { supabase } from "@/integrations/supabase/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import wordmarkDark from "@/assets/brix-wordmark-dark.svg";
import authPanel from "@/assets/auth-panel.jpg";

export const Route = createFileRoute("/portal")({
  validateSearch: (search: Record<string, unknown>) => ({
    next:
      typeof search.next === "string" &&
      search.next.startsWith("/") &&
      !search.next.startsWith("//")
        ? search.next
        : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in | Brix Design Studio" },
      {
        name: "description",
        content:
          "Sign in to Brix Design Studio with Google or email to reach your files, guidelines and tasks.",
      },
      { property: "og:title", content: "Sign in | Brix Design Studio" },
      {
        property: "og:description",
        content: "Reach your Brix project files, guidelines and tasks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalAuthPage,
});

const inputClass =
  "w-full rounded-xl border border-paper/12 bg-paper/[0.05] px-4 py-3 text-[15px] text-paper transition-colors placeholder:text-paper/35 hover:border-paper/20 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60";

function PortalAuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const safeNext = next || "/dashboard";
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: safeNext as "/dashboard" });
    });
    return () => {
      active = false;
    };
  }, [navigate, safeNext]);

  function onGoogleSuccess() {
    navigate({ to: safeNext as "/dashboard" });
  }

  function onGoogleError(message: string) {
    toast.error(message);
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
          emailRedirectTo: `${window.location.origin}/portal${next ? `?next=${encodeURIComponent(next)}` : ""}`,
          data: { full_name: String(data.get("full_name") ?? "") },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created. Check your inbox if confirmation is required.");
      navigate({ to: safeNext as "/dashboard" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("That email and password do not match an account.");
      return;
    }
    navigate({ to: safeNext as "/dashboard" });
  }

  const signingIn = mode === "signin";

  return (
    <main className="portal-auth-theme h-svh overflow-hidden bg-obsidian text-paper lg:grid lg:grid-cols-2">
      {/* Form side */}
      <div className="relative flex h-svh flex-col overflow-y-auto px-5 py-6 sm:px-10 lg:h-full lg:px-14 xl:px-20">
        <div className="flex shrink-0 items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3"
            aria-label="Brix Design Studio home"
          >
            <img src={wordmarkDark} alt="Brix Design Studio" className="h-4 w-auto" />
          </Link>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-8"
        >
          <h1 className="display-serif text-center text-[clamp(1.5rem,3.4vw,2.125rem)] leading-tight">
            {signingIn ? "Welcome back to Brix" : "Create your Brix account"}
          </h1>
          <p className="mx-auto mt-3 max-w-[34ch] text-center text-sm text-paper/55">
            {signingIn
              ? "Sign in to reach your files, guidelines and tasks."
              : "Use your work email so we can match you to the right projects."}
          </p>

          <GoogleSignInButton
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            disabled={busy}
            className="mt-7 flex justify-center"
          />

          <div className="my-5 flex items-center gap-4 text-paper/40">
            <span className="h-px flex-1 bg-paper/12" />
            <span className="text-caption">or use your email</span>
            <span className="h-px flex-1 bg-paper/12" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {!signingIn ? (
              <div>
                <label htmlFor="full_name" className="label-caps mb-1.5 block text-paper/55">
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="label-caps mb-1.5 block text-paper/55">
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
              <label htmlFor="password" className="label-caps mb-1.5 block text-paper/55">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={signingIn ? "current-password" : "new-password"}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3 text-[15px] font-medium text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep disabled:translate-y-0 disabled:opacity-60"
            >
              {busy ? "One moment" : signingIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-caption text-paper/40">
            By continuing you agree to how we handle your project data, set out in our terms.
          </p>

          <p className="mt-5 text-center text-sm text-paper/60">
            {signingIn ? "No account yet? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(signingIn ? "signup" : "signin")}
              className="font-medium text-paper underline underline-offset-4 transition-colors hover:text-brand"
            >
              {signingIn ? "Create one" : "Sign in instead"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Image side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={authPanel}
          alt="A designer at work in the Brix studio"
          width={1024}
          height={1536}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
        <div className="absolute inset-x-10 bottom-10">
          <p className="display-serif max-w-[24ch] text-[clamp(1.5rem,2.2vw,2rem)] text-paper">
            Every file, decision and hour, kept in one place your team can find.
          </p>
          <p className="mt-3 text-[15px] text-paper/70">Project workspace</p>
        </div>
      </div>
    </main>
  );
}
