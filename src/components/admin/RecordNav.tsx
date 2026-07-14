"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSiblings, type Siblings } from "@/lib/adminRecordNav";

// Prev / Next stepper for detail pages, driven by the id list the originating
// list page stashed in sessionStorage. Renders nothing when there are no
// siblings (e.g. arrived via deep link), so it's safe to drop in unconditionally.
export default function RecordNav({ navKey, currentId, basePath }: {
  navKey: string; currentId: string; basePath: string;
}) {
  const router = useRouter();
  const [sib, setSib] = useState<Siblings>({ prevId: null, nextId: null, index: -1, total: 0 });

  useEffect(() => { setSib(getSiblings(navKey, currentId)); }, [navKey, currentId]);

  // Arrow-key navigation (when not typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === "[" && sib.prevId) router.push(`${basePath}/${sib.prevId}`);
      if (e.key === "]" && sib.nextId) router.push(`${basePath}/${sib.nextId}`);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sib, basePath, router]);

  if (sib.index === -1 || sib.total <= 1) return null;

  const btn = "inline-flex items-center justify-center w-8 h-8 rounded-none border border-[#102C26]/15 text-[#102C26]/70 hover:bg-[#102C26]/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 tabular-nums hidden sm:inline">{sib.index + 1} of {sib.total}</span>
      <button onClick={() => sib.prevId && router.push(`${basePath}/${sib.prevId}`)} disabled={!sib.prevId} aria-label="Previous record (press [)" title="Previous ( [ )" className={btn}>
        <ChevronLeft size={16} />
      </button>
      <button onClick={() => sib.nextId && router.push(`${basePath}/${sib.nextId}`)} disabled={!sib.nextId} aria-label="Next record (press ])" title="Next ( ] )" className={btn}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
