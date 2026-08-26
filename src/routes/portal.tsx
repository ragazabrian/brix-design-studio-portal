import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import wordmarkDark from "@/assets/brix-wordmark-dark.svg.asset.json";
import authPanel from "@/assets/auth-panel.jpg";

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
  "w-full rounded-xl border border-paper/12 bg-paper/[0.05] px-4 py-3 text-[15px] text-paper transition-colors placeholder:text-paper/35 hover:border-paper/20 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.4 17.6 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.15-3.2-.45-4.7H24v9.1h12.6c-.55 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 7-10.1 7-17.4Z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7a14.6 14.6 0 0 1 0-9.4l-7.8-6.1a24 24 0 0 0 0 21.6l7.8-6.1Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.5-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-7.9 2.2-6.4 0-11.7-3.9-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48Z"
      />
    </svg>
  );
}

function PortalAuthPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
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
      toast.error("Google sign in did not complete. Try again or use your email and password.");
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

  const signingIn = mode === "signin";

  return (
    <main className="min-h-svh bg-obsidian text-paper lg:grid lg:min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="relative flex min-h-svh flex-col px-5 py-8 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Brix Design Studio home">
            <img src={wordmarkDark.url} alt="Brix Design Studio" className="h-5 w-auto" />
          </Link>
          <Link
            to="/"
            className="label-caps inline-flex items-center gap-2 text-paper/60 transition-colors hover:text-paper"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.7} aria-hidden />
            Back to site
          </Link>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12"
        >
          <h1 className="display-serif text-center text-[clamp(1.75rem,4.5vw,2.5rem)]">
            {signingIn ? "Welcome back to Brix" : "Create your Brix account"}
          </h1>
          <p className="mx-auto mt-4 max-w-[34ch] text-center text-[15px] text-paper/60">
            {signingIn
              ? "Sign in to reach your files, guidelines, tasks and logged hours."
              : "Use your work email so we can match you to the right projects."}
          </p>

          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="mt-9 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-paper px-5 py-3.5 text-[15px] font-medium text-obsidian transition-all duration-300 hover:-translate-y-0.5 hover:bg-paper/90 disabled:translate-y-0 disabled:opacity-60"
          >
            <HugeiconsIcon icon={GoogleIcon} size={20} strokeWidth={1.6} aria-hidden />
            Continue with Google
          </button>

          <div className="my-7 flex items-center gap-4 text-paper/40">
            <span className="h-px flex-1 bg-paper/15" />
            <span className="text-caption">or use your email</span>
            <span className="h-px flex-1 bg-paper/15" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!signingIn ? (
              <div>
                <label htmlFor="full_name" className="label-caps mb-2 block text-paper/60">
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
              <label htmlFor="email" className="label-caps mb-2 block text-paper/60">
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
              <label htmlFor="password" className="label-caps mb-2 block text-paper/60">
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
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-3.5 text-[15px] font-medium text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-deep disabled:translate-y-0 disabled:opacity-60"
            >
              {busy ? "One moment" : signingIn ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-caption text-paper/45">
            By continuing you agree to how we handle your project data, set out in our terms.
          </p>

          <p className="mt-8 text-center text-[15px] text-paper/60">
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
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
        <div className="absolute inset-x-10 bottom-10">
          <p className="display-serif max-w-[24ch] text-[clamp(1.5rem,2.2vw,2rem)] text-paper">
            Every file, decision and hour, kept in one place your team can find.
          </p>
          <p className="mt-3 text-[15px] text-paper/70">Brix Client Portal</p>
        </div>
      </div>
    </main>
  );
}
