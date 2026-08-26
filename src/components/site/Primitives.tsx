import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number | undefined;
  className?: string | undefined;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Reveals each child in sequence, so long lists arrive as one calm wave. */
export function RevealGroup({
  children,
  step = 0.08,
  className,
}: {
  children: ReactNode[];
  step?: number;
  className?: string | undefined;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <Reveal key={index} delay={index * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

/** Splits a headline into lines that rise in one after another. */
export function RevealLines({
  lines,
  className,
  delay = 0.1,
}: {
  lines: string[];
  className?: string | undefined;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            animate={reduce ? { y: 0 } : { y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + index * 0.1 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

const pillBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-all duration-300 ease-out hover:-translate-y-0.5";

const pillVariants = {
  solid: "bg-ink text-paper hover:bg-brand",
  outline: "border border-ink text-ink hover:border-brand hover:bg-brand hover:text-paper",
  brand: "bg-brand text-paper hover:bg-brand-deep",
  lime: "bg-brand text-paper hover:bg-brand-deep",
  onDark: "border border-paper/70 text-paper hover:border-paper hover:bg-paper hover:text-ink",
} as const;

type PillProps = {
  variant?: keyof typeof pillVariants | undefined;
  className?: string | undefined;
  children: ReactNode;
};

export function PillLink({
  to,
  href,
  variant = "solid",
  className,
  children,
}: PillProps & { to?: string | undefined; href?: string | undefined }) {
  const classes = cn(pillBase, pillVariants[variant], className);

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={to ?? "/"} className={classes}>
      {children}
    </Link>
  );
}

export function PillButton({
  variant = "solid",
  className,
  children,
  ...rest
}: PillProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(pillBase, pillVariants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ArrowLink({
  to,
  href,
  children,
  className,
}: {
  to?: string | undefined;
  href?: string | undefined;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    "group inline-flex items-center gap-2 text-[15px] font-medium transition-colors duration-300 hover:text-brand",
    className,
  );
  const inner = (
    <>
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        size={18}
        strokeWidth={1.8}
        className="transition-transform duration-300 ease-out group-hover:translate-x-1"
      />
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <Link to={to ?? "/"} className={classes}>
      {inner}
    </Link>
  );
}

export function SectionIntro({
  label,
  title,
  description,
  action,
  showScrollHint = false,
}: {
  label: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  showScrollHint?: boolean;
}) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <div className="flex items-start justify-between gap-6 border-b border-border pb-4">
        <span className="label-caps text-muted-foreground">{label}</span>
        {showScrollHint ? (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={20}
            strokeWidth={1.5}
            className="text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </div>
      {title || description || action ? (
        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-2xl">
            {title ? (
              <h2 className="display-serif text-[clamp(1.75rem,3.4vw,2.75rem)]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-4 text-muted-foreground md:text-[17px]">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
    </Reveal>
  );
}
