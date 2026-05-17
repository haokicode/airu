import type { Segment } from "@/lib/mock-data";
import { Badge, RiskDot } from "@/components/ui";

export function SegmentList({ segments }: { segments: Segment[] }) {
  return (
    <div className="segment-list">
      {segments.map((segment) => {
        const tone = segment.risk === "healthy" ? "healthy" : segment.risk === "caution" ? "caution" : "danger";
        return (
          <article className="segment-row" key={segment.name}>
            <RiskDot risk={segment.risk} />
            <div>
              <h3>{segment.name}</h3>
              <p>{segment.distance}</p>
            </div>
            <Badge tone={tone}>
              AQI {segment.aqi} - {segment.label}
            </Badge>
          </article>
        );
      })}
    </div>
  );
}
