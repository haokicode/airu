import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Loader2 } from "lucide-react";
import type { RiskLevel } from "@/lib/mock-data";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: LucideIcon;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  icon: Icon,
  loading,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} type={type} {...props}>
      {loading ? <Loader2 aria-hidden="true" className="button-icon spin" /> : null}
      {!loading && Icon ? <Icon aria-hidden="true" className="button-icon" /> : null}
      {children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  icon?: LucideIcon;
  trailing?: boolean;
  children: ReactNode;
  className?: string;
};

export function LinkButton({
  href,
  variant = "primary",
  icon: Icon,
  trailing,
  children,
  className = "",
}: LinkButtonProps) {
  return (
    <Link href={href} className={`button button-${variant} ${className}`}>
      {Icon ? <Icon aria-hidden="true" className="button-icon" /> : null}
      {children}
      {trailing ? <ArrowRight aria-hidden="true" className="button-icon" /> : null}
    </Link>
  );
}

export function IconButton({
  label,
  icon: Icon,
  variant = "secondary",
  className = "",
}: {
  label: string;
  icon: LucideIcon;
  variant?: "secondary" | "ghost";
  className?: string;
}) {
  return (
    <button aria-label={label} className={`icon-button icon-button-${variant} ${className}`}>
      <Icon aria-hidden="true" />
    </button>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "healthy" | "caution" | "danger" | "neutral";
  children: ReactNode;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function ScorePill({ score, label }: { score: number; label?: string }) {
  const tone = score >= 70 ? "healthy" : score >= 40 ? "caution" : "danger";
  return (
    <div className={`score-pill score-pill-${tone}`} aria-label={`Skor sehat ${score}`}>
      <strong>{score}</strong>
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function HealthScoreBar({ score }: { score: number }) {
  const tone = score >= 70 ? "healthy" : score >= 40 ? "caution" : "danger";
  return (
    <div className="health-score" aria-label={`Health score ${score} dari 100`}>
      <div className="health-score-meta">
        <span>Health Score</span>
        <strong>{score}/100</strong>
      </div>
      <div className="health-score-track">
        <span className={`health-score-fill health-score-${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function RiskDot({ risk }: { risk: RiskLevel }) {
  return <span className={`risk-dot risk-dot-${risk}`} aria-hidden="true" />;
}
