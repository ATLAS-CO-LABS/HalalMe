"use client";

// Lightweight, dependency-free SVG charts for the analytics module. Tuned to the
// admin palette (forest #102C26, amber #F59E0B) so they read as part of the same
// system as the rest of the panel — no chart library needed.

import { useId } from "react";
import { display } from "../_fonts";

const FOREST = "#102C26";
const AMBER = "#F59E0B";

export type Point = { label: string; value: number };

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

// ─── Time series (area + line) ──────────────────────────────────────────────
export function TimeSeries({
  data, color = AMBER, height = 180, format = (n: number) => String(n),
}: {
  data: Point[]; color?: string; height?: number; format?: (n: number) => string;
}) {
  const gradId = useId();
  if (data.length === 0) return <ChartEmpty />;

  const W = 600, H = height, padX = 8, padY = 16;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;
  const x = (i: number) => padX + (n === 1 ? (W - padX * 2) / 2 : (i * (W - padX * 2)) / (n - 1));
  const y = (v: number) => padY + (H - padY * 2) * (1 - v / max);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${H - padY} L${x(0).toFixed(1)},${H - padY} Z`;

  // Show at most ~6 x-axis labels to avoid crowding.
  const step = Math.ceil(n / 6);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke={FOREST} strokeOpacity="0.1" strokeWidth="1" />
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.value)} r={n > 40 ? 0 : 2.5} fill={color}>
            <title>{`${d.label}: ${format(d.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between mt-1.5 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-gray-400 tabular-nums" style={{ visibility: i % step === 0 || i === n - 1 ? "visible" : "hidden" }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal bar list (rankings / breakdowns) ────────────────────────────
export function BarList({
  data, color = FOREST, format = (n: number) => n.toLocaleString(),
}: {
  data: { label: string; value: number; sub?: string }[]; color?: string; format?: (n: number) => string;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-sm text-gray-800 truncate">{d.label}</span>
            <span className="text-sm font-semibold text-[#102C26] tabular-nums shrink-0">
              {format(d.value)}{d.sub && <span className="text-gray-400 font-normal ml-1">{d.sub}</span>}
            </span>
          </div>
          <div className="h-2 bg-[#102C26]/6 rounded-none overflow-hidden">
            <div className="h-full rounded-none transition-all" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
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
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 56, c = 2 * Math.PI * r, cx = 80, cy = 80;
  let offset = 0;

  return (
    <div className="flex items-center gap-5 flex-wrap">
      <svg viewBox="0 0 160 160" width={size} height={size} className="shrink-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={FOREST} strokeOpacity="0.08" strokeWidth="16" />
        {total > 0 && segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="16"
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset}>
              <title>{`${s.label}: ${s.value.toLocaleString()}`}</title>
            </circle>
          );
          offset += dash;
          return el;
        })}
        {(centerValue || centerLabel) && (
          <g className="rotate-90" style={{ transformOrigin: "80px 80px" }}>
            {centerValue && <text x="80" y="78" textAnchor="middle" className={`${display.className}`} fontSize="22" fontWeight="800" fill={FOREST}>{centerValue}</text>}
            {centerLabel && <text x="80" y="96" textAnchor="middle" fontSize="9" fill="#6b7280" style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>{centerLabel}</text>}
          </g>
        )}
      </svg>
      <div className="space-y-1.5 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-none shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-700 truncate">{s.label}</span>
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
  if (stages.length === 0) return <ChartEmpty />;
  const max = Math.max(1, stages[0].value);
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const prev = i > 0 ? stages[i - 1].value : null;
        const conv = prev && prev > 0 ? Math.round((s.value / prev) * 100) : null;
        return (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-sm font-medium text-gray-800">{s.label}</span>
              <span className="text-sm tabular-nums shrink-0">
                <span className="font-semibold text-[#102C26]">{s.value.toLocaleString()}</span>
                {conv !== null && <span className="text-gray-400 ml-2">{conv}% ↓</span>}
              </span>
            </div>
            <div className="h-7 bg-[#102C26]/6 rounded-none overflow-hidden">
              <div className="h-full rounded-none flex items-center px-2 transition-all"
                style={{ width: `${Math.max((s.value / max) * 100, s.value > 0 ? 4 : 0)}%`, backgroundColor: i === stages.length - 1 ? AMBER : FOREST }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
