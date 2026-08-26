import { ArrowLink } from "@/components/site/Primitives";

export function CTABanner({
  image,
  eyebrow,
  title,
  linkLabel,
  to,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  linkLabel: string;
  to: string;
}) {
  return (
    <section className="page-shell py-16 md:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          className="grayscale-media absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="relative px-6 py-16 text-center md:px-16 md:py-28">
          {eyebrow ? <p className="label-caps text-paper/70">{eyebrow}</p> : null}
          <h2 className="display-serif mx-auto mt-5 max-w-3xl text-[clamp(1.75rem,4.4vw,3.25rem)] text-paper">
            {title}
          </h2>
          <div className="mt-8 flex justify-center">
            <ArrowLink to={to} className="text-paper">
              {linkLabel}
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
