"use client";

// SVG charts for the analytics module — no chart library, tuned to the admin
// panel's palette and sharp (rounded-none) visual language.
//
// Color: every hue here is validated for lightness/chroma/CVD-safety against
// a white chart surface (node scripts/validate_palette.js from the dataviz
// skill). CHART_COLORS.green is a lightened, saturated derivative of the
// brand forest (#102C26) — the raw brand hex is too dark/desaturated to pass
// as a chart mark (it's an ink color, not a fill color) — kept brand-adjacent
// by holding the same hue. ORDINAL_GREEN is a 6-step light→dark ramp of that
// same hue for genuinely ordered data (pipeline stages).
//
// Not built in this pass: a table-view twin per chart. The existing CSV
// Export already makes every value reachable outside the visual chart, which
// covers the same underlying need without a second UI per card.

import { useId, useRef, useState } from "react";
import { display } from "../_fonts";

const INK = "#102C26";

export const CHART_COLORS = {
  green: "#1B8F5F",
  amber: "#F59E0B",
  blue: "#0D7DBF",
  magenta: "#B23A9E",
} as const;

// Light → dark, single hue (green), for ordered data (funnel stages, ranked statuses).
export const ORDINAL_GREEN = ["#1d9060", "#007a4c", "#006538", "#005025", "#003c13", "#002902"];

export type Point = { label: string; value: number };

function niceStep(max: number, targetTicks = 4): number {
  if (max <= 0) return 1;
  const rough = max / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return step * mag;
}

/**
 * Nice round y-axis ticks. Forces a whole-number step (≥1) when every value
 * in the series is an integer (counts) — fractional ticks are meaningless for
 * a count ("0.6 merchants") and niceStep's float step (e.g. 0.2) accumulates
 * binary floating-point error under repeated addition (0.4 + 0.2 renders as
 * 0.6000000000000001), which shows up as a garbled/clipped axis label.
 * Ticks are also built by multiplying the index (not repeated `+=`) and
 * rounded to 12 significant digits to kill any remaining float noise.
 */
function computeTicks(rawMax: number, wholeNumbers: boolean, targetTicks = 4) {
  let step = niceStep(rawMax, targetTicks);
  if (wholeNumbers) step = Math.max(1, Math.round(step));
  const niceMax = Math.max(step, Math.ceil(rawMax / step) * step);
  const count = Math.round(niceMax / step);
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) ticks.push(Number((i * step).toPrecision(12)));
  return { ticks, niceMax };
}

// ─── Card wrapper ───────────────────────────────────────────────────────────
export function ChartCard({
  title, subtitle, children, right,
}: {
  title: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-none border border-[#102C26]/12 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className={`${display.className} text-sm font-bold uppercase tracking-tight text-[#102C26]`}>{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function ChartEmpty({ msg = "No data for this period" }: { msg?: string }) {
  return <div className="flex items-center justify-center h-40 text-sm text-gray-400">{msg}</div>;
}

// ─── Tooltip (shared shell) ─────────────────────────────────────────────────
function ChartTooltip({
  leftPct, topPct, value, label,
}: { leftPct: number; topPct: number; value: string; label: string }) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-none bg-[#102C26] text-white text-xs px-2.5 py-1.5 shadow-lg whitespace-nowrap"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, marginTop: "-10px" }}
    >
      <div className="font-bold tabular-nums">{value}</div>
      <div className="text-white/60 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}

// ─── Time series (area + line, gridlines, crosshair) ────────────────────────
export function TimeSeries({
  data, color = CHART_COLORS.green, height = 200, format = (n: number) => String(n),
}: {
  data: Point[]; color?: string; height?: number; format?: (n: number) => string;
}) {
  const gradId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) return <ChartEmpty />;

  const W = 600, H = height;
  const padLeft = 38, padRight = 8, padTop = 10, padBottom = 20;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const rawMax = Math.max(1, ...data.map((d) => d.value));
  const wholeNumbers = data.every((d) => Number.isInteger(d.value));
  const { ticks, niceMax } = computeTicks(rawMax, wholeNumbers);

  const n = data.length;
  const x = (i: number) => padLeft + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => padTop + plotH * (1 - v / niceMax);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${(padTop + plotH).toFixed(1)} L${x(0).toFixed(1)},${(padTop + plotH).toFixed(1)} Z`;

  const xLabelStep = Math.max(1, Math.ceil(n / 6));
  const last = data[n - 1];

  function nearestIndex(clientX: number): number {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const dataX = ((clientX - rect.left) / rect.width) * W;
    let idx = 0, best = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x(i) - dataX);
      if (d < best) { best = d; idx = i; }
    }
    return idx;
  }

  const hoveredPoint = hover !== null ? data[hover] : null;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onPointerMove={(e) => setHover(nearestIndex(e.clientX))}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} preserveAspectRatio="none" className="overflow-visible block">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines + y-axis labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padLeft} y1={y(t)} x2={W - padRight} y2={y(t)} stroke={INK} strokeOpacity="0.07" strokeWidth="1" />
            <text x={padLeft - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
              {format(t)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* end marker — the current/latest value, always visible */}
        <circle cx={x(n - 1)} cy={y(last.value)} r="4" fill={color} stroke="#fff" strokeWidth="2" />

        {/* crosshair + hover dot */}
        {hoveredPoint && hover !== null && (
          <g>
            <line x1={x(hover)} y1={padTop} x2={x(hover)} y2={padTop + plotH} stroke={INK} strokeOpacity="0.15" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(hoveredPoint.value)} r="4.5" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}

        {/* x-axis labels — placed in data space so they stay aligned with gridlines */}
        {data.map((d, i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 4}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            fontSize="9"
            fill="#9ca3af"
            style={{ visibility: i % xLabelStep === 0 || i === n - 1 ? "visible" : "hidden" }}
          >
            {d.label}
          </text>
        ))}
      </svg>

      {hoveredPoint && hover !== null && (
        <ChartTooltip
          leftPct={(x(hover) / W) * 100}
          topPct={(y(hoveredPoint.value) / H) * 100}
          value={format(hoveredPoint.value)}
          label={hoveredPoint.label}
        />
      )}
    </div>
  );
}

// ─── Bar series (vertical bars, gridlines) ──────────────────────────────────
// For sparse per-period counts (records added per day) where a line/area
// chart would imply a continuous trend between points that don't really
// connect. One bar per period reads as what it is: a count on that day.
export function BarSeries({
  data, color = CHART_COLORS.green, height = 200, format = (n: number) => String(n),
}: {
  data: Point[]; color?: string; height?: number; format?: (n: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) return <ChartEmpty />;

  const W = 600, H = height;
  const padLeft = 38, padRight = 8, padTop = 10, padBottom = 20;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const rawMax = Math.max(1, ...data.map((d) => d.value));
  const wholeNumbers = data.every((d) => Number.isInteger(d.value));
  const { ticks, niceMax } = computeTicks(rawMax, wholeNumbers);

  const n = data.length;
  const slot = plotW / n;
  const barW = Math.max(1, Math.min(28, slot * 0.6));
  const cx = (i: number) => padLeft + slot * (i + 0.5);
  const y = (v: number) => padTop + plotH * (1 - v / niceMax);

  const xLabelStep = Math.max(1, Math.ceil(n / 6));

  function nearestIndex(clientX: number): number {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const dataX = ((clientX - rect.left) / rect.width) * W;
    const idx = Math.floor((dataX - padLeft) / slot);
    return Math.max(0, Math.min(n - 1, idx));
  }

  const hoveredPoint = hover !== null ? data[hover] : null;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onPointerMove={(e) => setHover(nearestIndex(e.clientX))}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} preserveAspectRatio="none" className="overflow-visible block">
        {/* gridlines + y-axis labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padLeft} y1={y(t)} x2={W - padRight} y2={y(t)} stroke={INK} strokeOpacity="0.07" strokeWidth="1" />
            <text x={padLeft - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
              {format(t)}
            </text>
          </g>
        ))}

        {/* bars */}
        {data.map((d, i) => {
          const isHover = hover === i;
          const barH = Math.max(0, y(0) - y(d.value));
          return (
            <rect
              key={i}
              x={cx(i) - barW / 2}
              y={y(d.value)}
              width={barW}
              height={barH}
              fill={color}
              opacity={isHover ? 1 : 0.85}
            />
          );
        })}

        {/* x-axis labels — placed in data space so they stay aligned with bars */}
        {data.map((d, i) => (
          <text
            key={i}
            x={cx(i)}
            y={H - 4}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            fontSize="9"
            fill="#9ca3af"
            style={{ visibility: i % xLabelStep === 0 || i === n - 1 ? "visible" : "hidden" }}
          >
            {d.label}
          </text>
        ))}
      </svg>

      {hoveredPoint && hover !== null && (
        <ChartTooltip
          leftPct={(cx(hover) / W) * 100}
          topPct={(y(hoveredPoint.value) / H) * 100}
          value={format(hoveredPoint.value)}
          label={hoveredPoint.label}
        />
      )}
    </div>
  );
}

// ─── Horizontal bar list (rankings / breakdowns) ────────────────────────────
export function BarList({
  data, color = CHART_COLORS.green, colors, format = (n: number) => n.toLocaleString(),
}: {
  data: { label: string; value: number; sub?: string }[];
  /** Single hue for every bar (nominal — a ranked list of the same kind of thing). */
  color?: string;
  /** Optional per-bar hues (ordinal — e.g. ORDINAL_GREEN for a pipeline in stage order). Overrides `color`. */
  colors?: string[];
  format?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const barColor = colors?.[i % colors.length] ?? color;
        const isHover = hover === i;
        return (
          <div
            key={i}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover((h) => (h === i ? null : h))}
            className="cursor-default"
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className={`text-sm truncate transition-colors ${isHover ? "text-[#102C26] font-medium" : "text-gray-800"}`}>{d.label}</span>
              <span className="text-sm font-semibold text-[#102C26] tabular-nums shrink-0">
                {format(d.value)}{d.sub && <span className="text-gray-400 font-normal ml-1">{d.sub}</span>}
              </span>
            </div>
            <div className="h-2.5 bg-[#102C26]/6 rounded-none overflow-hidden">
              <div
                className="h-full rounded-none transition-all"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: barColor, opacity: isHover ? 1 : 0.92 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut (proportions) ────────────────────────────────────────────────────
export function Donut({
  segments, centerLabel, centerValue, size = 150,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel?: string; centerValue?: string; size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 56, c = 2 * Math.PI * r, cx = 80, cy = 80;
  let offset = 0;

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 160 160" width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeOpacity="0.08" strokeWidth="16" />
          {total > 0 && segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * c;
            const isHover = hover === i;
            const el = (
              <circle
                key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
                strokeWidth={isHover ? 19 : 16}
                strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset}
                style={{ transition: "stroke-width 120ms" }}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        {(centerValue || centerLabel) && hover === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && <span className={`${display.className} text-xl font-extrabold text-[#102C26]`}>{centerValue}</span>}
            {centerLabel && <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500">{centerLabel}</span>}
          </div>
        )}
        {hover !== null && total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3">
            <span className={`${display.className} text-lg font-extrabold text-[#102C26]`}>{segments[hover].value.toLocaleString()}</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 truncate max-w-full">{segments[hover].label}</span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 min-w-0">
        {segments.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm cursor-default"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover((h) => (h === i ? null : h))}
          >
            <span className="w-2.5 h-2.5 rounded-none shrink-0" style={{ backgroundColor: s.color }} />
            <span className={`truncate transition-colors ${hover === i ? "text-[#102C26] font-medium" : "text-gray-700"}`}>{s.label}</span>
            <span className="text-gray-500 tabular-nums ml-auto">
              {s.value.toLocaleString()}{total > 0 && <span className="text-gray-400"> · {Math.round((s.value / total) * 100)}%</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Funnel (stages + conversion %) ─────────────────────────────────────────
export function Funnel({ stages }: { stages: { label: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (stages.length === 0) return <ChartEmpty />;
  const max = Math.max(1, stages[0].value);
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const prev = i > 0 ? stages[i - 1].value : null;
        const conv = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        const isLast = i === stages.length - 1;
        const barColor = isLast ? CHART_COLORS.amber : ORDINAL_GREEN[Math.min(i, ORDINAL_GREEN.length - 1)];
        const isHover = hover === i;
        return (
          <div
            key={i}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover((h) => (h === i ? null : h))}
            className="cursor-default"
          >
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className={`text-sm transition-colors ${isHover ? "text-[#102C26] font-semibold" : "text-gray-800 font-medium"}`}>{s.label}</span>
              <span className="text-sm tabular-nums shrink-0">
                <span className="font-semibold text-[#102C26]">{s.value.toLocaleString()}</span>
                {conv !== null && <span className="text-gray-400 ml-2">{conv}% ↓</span>}
              </span>
            </div>
            <div className="h-6 bg-[#102C26]/6 rounded-none overflow-hidden">
              <div
                className="h-full rounded-none flex items-center px-2 transition-all"
                style={{ width: `${Math.max((s.value / max) * 100, s.value > 0 ? 4 : 0)}%`, backgroundColor: barColor, opacity: isHover ? 1 : 0.92 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
