const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const W = 560;
const H = 200;
const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function xFor(month: number) {
  // month 1–12 → x within plot area
  return PAD.left + ((month - 1) / 11) * PLOT_W;
}

function yFor(rate: number) {
  // rate 0–100 → y within plot area (inverted: 100 = top)
  return PAD.top + ((100 - rate) / 100) * PLOT_H;
}

type Point = { month: number; attendanceRate: number; reportCount: number };

export function StudentGrowthChart({ points }: { points: Point[] }) {
  // Build a lookup for fast access; month → point
  const byMonth = new Map<number, Point>(points.map((p) => [p.month, p]));

  // Polyline segments: connected only where consecutive months both have data
  const segments: string[] = [];
  let currentSeg: string[] = [];
  for (let m = 1; m <= 12; m++) {
    const p = byMonth.get(m);
    if (p) {
      currentSeg.push(`${xFor(m)},${yFor(p.attendanceRate)}`);
    } else {
      if (currentSeg.length > 1) segments.push(currentSeg.join(" "));
      currentSeg = [];
    }
  }
  if (currentSeg.length > 1) segments.push(currentSeg.join(" "));

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        aria-label="Monthly attendance rate chart"
        role="img"
        style={{ minWidth: 280 }}
      >
        <title>Monthly attendance rate</title>

        {/* Y-axis grid lines + labels */}
        {gridLines.map((pct) => {
          const y = yFor(pct);
          return (
            <g key={pct}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-ink-2)"
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {/* X-axis month labels */}
        {MONTHS.map((label, i) => (
          <text
            key={label}
            x={xFor(i + 1)}
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-ink-2)"
          >
            {label}
          </text>
        ))}

        {/* Connected line segments (gap where a month has no data) */}
        {segments.map((pts, i) => (
          <polyline
            // biome-ignore lint/suspicious/noArrayIndexKey: segments are position-derived, no stable key
            key={i}
            points={pts}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Data point dots */}
        {Array.from(byMonth.values()).map((p) => (
          <g key={p.month}>
            <title>
              {MONTHS[p.month - 1]}: {p.attendanceRate}% attendance ({p.reportCount}{" "}
              {p.reportCount === 1 ? "report" : "reports"})
            </title>
            <circle
              cx={xFor(p.month)}
              cy={yFor(p.attendanceRate)}
              r={5}
              fill="var(--color-accent-2-text)"
              stroke="var(--color-ground)"
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
