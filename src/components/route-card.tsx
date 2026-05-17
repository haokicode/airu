import Link from "next/link";
import { Clock3, Footprints, Leaf, Route } from "lucide-react";
import type { RouteOption } from "@/lib/mock-data";
import { Badge, HealthScoreBar, ScorePill } from "@/components/ui";

export function RouteCard({
  route,
  selected,
  href,
}: {
  route: RouteOption;
  selected?: boolean;
  href?: string;
}) {
  const tone = route.score >= 70 ? "healthy" : route.score >= 40 ? "caution" : "danger";
  const content = (
    <>
      <div className="route-card-heading">
        <div>
          <div className="route-card-title-row">
            <h3>{route.label}</h3>
            {route.recommended ? <Badge tone="healthy">Direkomendasikan</Badge> : null}
          </div>
          <p>{route.summary}</p>
        </div>
        <ScorePill score={route.score} />
      </div>
      <div className="metric-grid">
        <span>
          <Clock3 aria-hidden="true" />
          {route.duration}
        </span>
        <span>
          <Footprints aria-hidden="true" />
          {route.distance}
        </span>
        <span>
          <Leaf aria-hidden="true" />
          AQI {route.aqi} - {route.aqiLabel}
        </span>
        <span>
          <Route aria-hidden="true" />
          {route.delta ?? "Baseline"}
        </span>
      </div>
      <HealthScoreBar score={route.score} />
      <span className={`route-risk-label route-risk-${tone}`}>
        {tone === "healthy" ? "Aman untuk profil saat ini" : "Perlu perhatian untuk profil sensitif"}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`route-card ${selected ? "selected" : ""}`}>
        {content}
      </Link>
    );
  }

  return <article className={`route-card ${selected ? "selected" : ""}`}>{content}</article>;
}
