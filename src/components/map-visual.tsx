import type { RiskLevel } from "@/lib/mock-data";

type MapVisualProps = {
  compact?: boolean;
  showHotspots?: boolean;
  selected?: "healthy" | "fastest";
  label?: string;
};

const healthySegments: Array<{ className: string; risk: RiskLevel }> = [
  { className: "seg h1", risk: "healthy" },
  { className: "seg h2", risk: "healthy" },
  { className: "seg h3", risk: "caution" },
  { className: "seg h4", risk: "healthy" },
];

const fastestSegments: Array<{ className: string; risk: RiskLevel }> = [
  { className: "seg f1", risk: "caution" },
  { className: "seg f2", risk: "danger" },
  { className: "seg f3", risk: "danger" },
];

export function MapVisual({
  compact,
  showHotspots = true,
  selected = "healthy",
  label = "Peta rute Airu dengan segmen kualitas udara",
}: MapVisualProps) {
  const activeSegments = selected === "healthy" ? healthySegments : fastestSegments;
  const mutedSegments = selected === "healthy" ? fastestSegments : healthySegments;

  return (
    <div className={`map-visual ${compact ? "map-visual-compact" : ""}`} role="img" aria-label={label}>
      <div className="map-grid" aria-hidden="true" />
      <span className="map-road road-a" />
      <span className="map-road road-b" />
      <span className="map-road road-c" />
      <span className="map-road road-d" />
      {mutedSegments.map((segment) => (
        <span
          key={segment.className}
          className={`${segment.className} route-segment route-muted risk-${segment.risk}`}
        />
      ))}
      {activeSegments.map((segment) => (
        <span key={segment.className} className={`${segment.className} route-segment risk-${segment.risk}`} />
      ))}
      <span className="map-pin map-pin-start">A</span>
      <span className="map-pin map-pin-end">B</span>
      {showHotspots ? (
        <>
          <span className="aqi-hotspot hotspot-a">96</span>
          <span className="aqi-hotspot hotspot-b">154</span>
        </>
      ) : null}
    </div>
  );
}
