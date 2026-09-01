import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import wordmarkDark from "@/assets/brix-wordmark-dark.svg.asset.json";
import authPanel from "@/assets/auth-panel.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/client-login")({
  head: () => ({
    meta: [
      { title: "Client sign in | Brix Design Studio" },
      { name: "description", content: "Sign in to view your Brix projects, assets, and guidelines." },
      { property: "og:title", content: "Client sign in | Brix Design Studio" },
      { property: "og:description", content: "Your private Brix project workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientLoginPage,
});

function ClientLoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

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
      toast.error("That email and password do not match a client account.");
      return;
    }
    navigate({ to: "/client/dashboard" });
  }

  async function googleSignIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/client-login`,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign in did not complete.");
      return;
    }
    if (!result.redirected) navigate({ to: "/client/dashboard" });
  }

  const field = "w-full rounded-md border border-paper/15 bg-paper/[0.06] px-4 py-3 text-paper placeholder:text-paper/35 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

  return (
    <main className="portal-auth-theme min-h-svh bg-obsidian text-paper lg:grid lg:grid-cols-2">
      <section className="flex min-h-svh flex-col px-5 py-6 sm:px-10 lg:px-16">
        <img src={wordmarkDark.url} alt="Brix Design Studio" className="h-4 w-auto self-start" />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <p className="label-caps text-brand">Client workspace</p>
          <h1 className="mt-4 text-4xl font-semibold">Your project, in one place.</h1>
          <p className="mt-4 max-w-sm text-paper/60">Sign in to view the projects, files, guidelines, modules, and documents shared with you.</p>
          <Button type="button" variant="outline" onClick={googleSignIn} disabled={busy} className="mt-8 h-11 border-paper/20 bg-paper text-obsidian hover:bg-paper/90">Continue with Google</Button>
          <div className="my-5 flex items-center gap-3 text-xs text-paper/40"><span className="h-px flex-1 bg-paper/15" />or use email<span className="h-px flex-1 bg-paper/15" /></div>
          <form onSubmit={signIn} className="space-y-4">
            <div><label htmlFor="client-email" className="label-caps mb-2 block text-paper/55">Email</label><input id="client-email" name="email" type="email" required autoComplete="email" className={field} /></div>
            <div><label htmlFor="client-password" className="label-caps mb-2 block text-paper/55">Password</label><input id="client-password" name="password" type="password" required autoComplete="current-password" className={field} /></div>
            <Button type="submit" disabled={busy} className="h-11 w-full bg-brand text-paper hover:bg-brand-deep">{busy ? "Signing in" : "Sign in"}</Button>
          </form>
          <p className="mt-6 text-sm text-paper/50">New here? Use the secure link in your Brix invitation email.</p>
          <Link to="/portal" className="mt-4 text-sm text-paper/60 underline underline-offset-4">Studio team sign in</Link>
        </div>
      </section>
      <div className="relative hidden overflow-hidden lg:block"><img src={authPanel} alt="Brix studio workspace" className="grayscale-media h-full w-full object-cover" /><div className="absolute inset-0 bg-obsidian/35" /></div>
    </main>
  );
}