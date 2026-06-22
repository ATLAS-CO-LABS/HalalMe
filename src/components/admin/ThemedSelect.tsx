"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface ThemedSelectOption {
  value: string;
  label: string;
}

// A fully on-brand dropdown. Native <select> can't style its option list
// (the OS renders it — that's the white/blue list), so this renders a custom
// menu we control: forest text, magenta selected check, sharp corners.
export default function ThemedSelect({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Select…",
  variant = "light",
  leftIcon,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: ThemedSelectOption[];
  disabled?: boolean;
  placeholder?: string;
  variant?: "light" | "dark";
  leftIcon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const dark = variant === "dark";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerCls = dark
    ? "bg-white/10 text-white border-white/20 hover:bg-white/15 focus:ring-[#F7E7CE]/40"
    : "bg-white text-[#102C26] border-[#102C26]/15 hover:border-[#102C26]/35 focus:ring-[#102C26]/15 focus:border-[#102C26]";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 ${leftIcon ? "pl-3" : "pl-3.5"} pr-3 py-2.5 text-sm font-medium border rounded-none text-left transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${triggerCls}`}
      >
        {leftIcon && (
          <span className={`${dark ? "text-white/60" : "text-[#102C26]/40"} shrink-0 flex`}>{leftIcon}</span>
        )}
        <span className={`flex-1 truncate ${selected ? "" : dark ? "text-white/50" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${dark ? "text-white/60" : "text-[#102C26]/45"}`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white border border-[#102C26]/12 rounded-none shadow-[0_10px_40px_-12px_rgba(16,44,38,0.45)] py-1 max-h-60 overflow-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-400">No options</p>
          ) : (
            options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    active
                      ? "bg-[#102C26]/[0.06] text-[#102C26] font-semibold"
                      : "text-gray-700 hover:bg-[#102C26]/[0.05]"
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {active && <Check size={14} className="text-[#F59E0B] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
