import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search.authorization_id === "string" ? search.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization request.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = `${location.pathname}${location.searchStr}`;
      throw redirect({ to: "/portal", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id");
    if (!authorizationId) throw new Error("Missing authorization request.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    if (!("authorization_id" in data)) throw redirect({ href: data.redirect_url });
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="flex min-h-svh items-center justify-center bg-obsidian px-6 text-paper">
      <p role="alert" className="max-w-md text-center text-paper/70">Could not load this connection request: {String((error as Error)?.message ?? error)}</p>
    </main>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const result = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(authorization_id, { skipBrowserRedirect: true });
    if (result.error) {
      setBusy(false);
      setError(result.error.message);
      return;
    }
    window.location.href = result.data.redirect_url;
  }

  const clientName = details.client.name || "this app";
  return (
    <main className="flex min-h-svh items-center justify-center bg-obsidian px-5 py-10 text-paper">
      <section className="w-full max-w-lg border border-paper/15 bg-paper/[0.04] p-7 sm:p-10">
        <p className="label-caps text-brand">Brix Design Studio</p>
        <h1 className="mt-5 text-3xl font-semibold">Connect {clientName}</h1>
        <p className="mt-4 leading-7 text-paper/65">
          Allow {clientName} to use your Brix Design Studio workspace as <strong className="text-paper">{details.user.email}</strong>.
        </p>
        <p className="mt-3 text-sm text-paper/50">Requested access: {details.scope || "workspace information"}.</p>
        {error ? <p role="alert" className="mt-5 border-l-2 border-brand pl-3 text-sm text-paper/80">{error}</p> : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={busy} onClick={() => decide(false)} className="rounded-md border border-paper/20 px-5 py-3 text-sm text-paper/75 hover:bg-paper/[0.06] disabled:opacity-50">Deny</button>
          <button type="button" disabled={busy} onClick={() => decide(true)} className="rounded-md bg-brand px-5 py-3 text-sm font-medium text-paper hover:bg-brand-deep disabled:opacity-50">{busy ? "Connecting" : "Allow access"}</button>
        </div>
      </section>
    </main>
  );
}
