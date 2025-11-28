import React, { useState } from "react";
import { cn, fmtUSD, fmtPct } from "../utils";
import { Label, Tooltip, InfoIcon, Switch, CopyIcon } from "./ui";
import { getMarginStatus } from "../logic";

// --- Helper Components ---

export function Field({ label, hint, tooltip, children }: { label?: string; hint?: string; tooltip?: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        {label && <Label>{label}</Label>}
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon />
          </Tooltip>
        )}
      </div>
      {children}
      {hint && <div className="text-xs text-gray-600">{hint}</div>}
    </div>
  );
}

export function BadgeStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm w-full">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 truncate">{label}</div>
      <div className="text-sm font-bold text-gray-900 truncate">{value}</div>
    </div>
  );
}

export function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("inline-block h-3 w-3 rounded-sm", color)} />
      <span>{label}</span>
    </div>
  );
}

export function RowSwitch({ label, checked, onChange, tooltip }: { label: string; checked: boolean; onChange: (v: boolean) => void; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center">
        <Label className="mr-2">{label}</Label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon />
          </Tooltip>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function AccordionLike({ title, children }: { title: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <span className="text-gray-600">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

export function MetricBox({ label, value, sub, copyable }: { label: string; value: React.ReactNode; sub?: string; copyable?: string }) {
  const doCopy = () => {
    if (!copyable) return;
    navigator.clipboard?.writeText(String(copyable));
  };
  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-white shadow-sm">
      <div className="text-[11px] font-bold text-gray-500 uppercase flex items-center justify-between mb-1">
        <span>{label}</span>
        {copyable && (
          <button
            onClick={doCopy}
            className="text-gray-400 hover:text-gray-700"
            title="Copy"
          >
            <CopyIcon />
          </button>
        )}
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export function DistributionBar({ segments, total, height = "h-4" }: { segments: { label: string; value: number; color: string }[]; total: number; height?: string }) {
  return (
    <div className="w-full space-y-2">
      <div className={cn("w-full rounded-full overflow-hidden flex", height)}>
        {segments.map((s, i) => {
           const pct = total > 0 ? (s.value / total) * 100 : 0;
           if (pct < 0.1) return null;
           return (
             <div key={i} style={{ width: `${pct}%` }} className={s.color} title={`${s.label}: ${fmtUSD(s.value)} (${pct.toFixed(1)}%)`} />
           );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
             <div className={cn("w-2.5 h-2.5 rounded-sm", s.color)} />
             <span>{s.label} ({Math.round(total > 0 ? (s.value/total)*100 : 0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Dynamic Margin Badge ---
export function MarginBadge({ pct, rolePreset }: { pct: number; rolePreset?: "pre" | "licensed" }) {
  const styles = getMarginStatus(pct, rolePreset || "licensed");

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md text-xs font-bold border-none bg-transparent p-0">
      <div className={cn("px-2 py-0.5 rounded flex items-center gap-1", styles.badgeClass)}>
        <span>{fmtPct(pct)}</span>
        <span className="hidden sm:inline opacity-75">• {styles.status}</span>
      </div>
    </div>
  );
}