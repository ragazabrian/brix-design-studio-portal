import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  Facebook02Icon,
  Linkedin01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { toast } from "sonner";

import { studio } from "@/data/site";
import { PageHeader, SiteShell } from "@/components/site/SiteShell";
import { PillButton, Reveal } from "@/components/site/Primitives";
import { supabase } from "@/integrations/supabase/client";

const socialIcons: Record<string, typeof InstagramIcon> = {
  Instagram: InstagramIcon,
  Facebook: Facebook02Icon,
  LinkedIn: Linkedin01Icon,
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact: Start a Project with Brix Design Studio" },
      {
        name: "description",
        content:
          "Email Brian Jess Ragaza at Brix Design Studio, or send a short brief through the form. We reply within two working days.",
      },
      { property: "og:title", content: "Contact | Brix Design Studio" },
      {
        property: "og:description",
        content: "Send a short brief to Brix Design Studio. We reply within two working days.",
      },
    ],
  }),
  component: ContactPage,
});

const inputClass =
  "w-full rounded-3xl border border-input bg-paper px-5 py-3 text-[15px] placeholder:text-muted-foreground focus-visible:border-ink";

function ContactPage() {
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? "") || null,
      message: String(data.get("message") ?? ""),
    });
    setSending(false);

    if (error) {
      toast.error("Your message did not send. Please email us directly.");
      return;
    }

    toast.success("Message sent. We reply within two working days.");
    form.reset();
  }

  return (
    <SiteShell>
      <PageHeader
        label="Contact"
        title="Tell us what you are working on."
        intro="A few sentences is enough to start. Include a timeline if you have one, and we will tell you honestly whether we are the right fit."
      />

      <section className="page-shell grid gap-12 py-14 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16 md:py-20">
        <Reveal>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label-caps mb-2 block text-muted-foreground">
                Your name
              </label>
              <input id="name" name="name" required autoComplete="name" className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="label-caps mb-2 block text-muted-foreground">
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
              <label htmlFor="company" className="label-caps mb-2 block text-muted-foreground">
                Company (optional)
              </label>
              <input id="company" name="company" autoComplete="organization" className={inputClass} />
            </div>
            <div>
              <label htmlFor="message" className="label-caps mb-2 block text-muted-foreground">
                What do you need?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className={`${inputClass} resize-y`}
              />
            </div>
            <PillButton type="submit" disabled={sending} className="disabled:opacity-60">
              {sending ? "Sending" : "Send message"}
            </PillButton>
            <p className="text-caption text-muted-foreground">
              We use your details to reply to this enquiry and nothing else.
            </p>
          </form>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="rounded-3xl bg-frost p-6 md:p-8">
            <h2 className="font-display text-2xl">Direct</h2>
            <p className="mt-4 text-muted-foreground">
              {studio.contactName} reads every enquiry personally.
            </p>
            <a
              href={`mailto:${studio.email}`}
              className="mt-5 inline-flex items-center gap-2 text-[17px] underline-offset-4 hover:underline"
            >
              <HugeiconsIcon icon={Mail01Icon} size={20} strokeWidth={1.6} aria-hidden />
              {studio.email}
            </a>

            <h3 className="label-caps mt-10 text-muted-foreground">Elsewhere</h3>
            <ul className="mt-4 space-y-3">
              {studio.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 underline-offset-4 hover:underline"
                  >
                    <HugeiconsIcon
                      icon={socialIcons[social.label] ?? InstagramIcon}
                      size={20}
                      strokeWidth={1.6}
                      aria-hidden
                    />
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-muted-foreground">{studio.location}</p>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
