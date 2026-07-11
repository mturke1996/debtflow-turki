import { ReactNode } from "react";

export type PageHeroStat = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type PageHeroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  accent?: "teal" | "amber" | "success";
  headline?: ReactNode;
  trailing?: ReactNode;
  footerStats?: [PageHeroStat, PageHeroStat] | [PageHeroStat, PageHeroStat, PageHeroStat];
};

export const PageHero = ({
  eyebrow,
  title,
  subtitle,
  accent = "teal",
  headline,
  trailing,
  footerStats,
}: PageHeroProps) => (
  <section className={`page-hero page-hero--${accent}`}>
    <div
      className="page-hero-blob"
      aria-hidden
      style={{
        width: "min(72%, 320px)",
        height: "min(80%, 360px)",
        top: "-40%",
        insetInlineEnd: "-20%",
        opacity: 0.14,
        background: "radial-gradient(closest-side, rgba(45,212,191,0.4) 0%, transparent 70%)",
      }}
    />
    <div
      className="page-hero-blob"
      aria-hidden
      style={{
        width: "min(65%, 280px)",
        height: "min(70%, 300px)",
        bottom: "-45%",
        insetInlineStart: "-15%",
        opacity: 0.1,
        background: "radial-gradient(closest-side, rgba(20,184,166,0.35) 0%, transparent 70%)",
      }}
    />

    <div className="page-hero-body">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="hero-chip" style={{ marginBottom: 8 }}>
          {eyebrow}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
            fontWeight: 800,
            lineHeight: 1.35,
            textWrap: "balance",
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              margin: "6px 0 0",
              maxWidth: "32rem",
              fontSize: "0.75rem",
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.72)",
              textWrap: "pretty",
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {headline ? (
          <div
            className="num"
            style={{
              marginTop: 8,
              fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {headline}
          </div>
        ) : null}
      </div>
      {trailing ? <div style={{ flexShrink: 0 }}>{trailing}</div> : null}
    </div>

    {footerStats ? (
      <div className="hero-stat-strip">
        {footerStats.map((stat) => (
          <div key={stat.label} className="hero-stat-cell">
            <div className="hero-stat-label">{stat.label}</div>
            <div className={`hero-stat-value ${stat.valueClassName ?? ""}`}>{stat.value}</div>
          </div>
        ))}
      </div>
    ) : null}
  </section>
);
