"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Search, ImageOff, Check } from "lucide-react";

export interface BoostOption {
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string | null;
}

interface BoostTargetPickerProps {
  options: BoostOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
}

// Custom searchable combobox for picking which recipe/post to boost —
// replaces the plain native <select>, which can't show a thumbnail per item
// and gets unreadable once someone has more than a handful of recipes/posts.
export default function BoostTargetPicker({ options, value, onChange, placeholder }: BoostTargetPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 bg-[#102C26] border border-[#F7E7CE]/15 text-xs px-2 py-2 hover:border-[#F7E7CE]/30 transition-colors"
      >
        {selected ? (
          <>
            <Thumbnail imageUrl={selected.imageUrl} />
            <span className="flex-1 min-w-0 text-left truncate text-[#F7E7CE]/90">{selected.label}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-[#F7E7CE]/40">{placeholder}</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-[#F7E7CE]/40 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-[#0A1C19] border border-[#F7E7CE]/15 shadow-xl">
          {options.length > 5 && (
            <div className="flex items-center gap-2 px-2 py-2 border-b border-[#F7E7CE]/10">
              <Search className="w-3.5 h-3.5 text-[#F7E7CE]/30 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-xs text-[#F7E7CE]/80 placeholder:text-[#F7E7CE]/30 outline-none"
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-xs text-[#F7E7CE]/30 text-center">No matches</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-[#F7E7CE]/6 transition-colors"
                >
                  <Thumbnail imageUrl={o.imageUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#F7E7CE]/90 truncate">{o.label}</p>
                    {o.subtitle && <p className="text-[10px] text-[#F7E7CE]/35 truncate">{o.subtitle}</p>}
                  </div>
                  {o.id === value && <Check className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Thumbnail({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <span className="relative w-8 h-8 shrink-0 bg-[#F7E7CE]/6 overflow-hidden">
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill className="object-cover" sizes="32px" />
      ) : (
        <ImageOff className="w-3.5 h-3.5 text-[#F7E7CE]/20 absolute inset-0 m-auto" />
      )}
    </span>
  );
}
