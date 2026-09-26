"use client";

// Route-level error boundary. Catches render/data errors in any page below the
// root layout and reports them to Sentry.
//
// This is the one users actually hit. `global-error.tsx` only takes over when the
// root layout itself throws, which also means it loses the layout (and its own
// <html>/<body>), so it stays deliberately bare. Keep this page on-brand and give
// people a way out; keep that one minimal.

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { RotateCcw, Home, ArrowRight } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-3xl mx-auto text-center">
        <span
          className="block text-[4rem] sm:text-[5.5rem] md:text-[7rem] font-extrabold leading-none tracking-tighter"
          style={{ color: "rgba(247,231,206,0.08)", fontFamily: "var(--font-headline)" }}
        >
          ERROR
        </span>

        <h1 className="-mt-5 sm:-mt-8 md:-mt-10 text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-[#F7E7CE]">
          Something Broke on Our End.
        </h1>
        <p className="mt-4 text-sm md:text-base text-[#F7E7CE]/50 max-w-md mx-auto leading-relaxed">
          This one is on us, not you. The error has been reported to our team.
          Try again, and if it keeps happening let us know.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#F7E7CE]/20 text-[#F7E7CE] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/8 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* The digest is the only handle support has to find this exact crash in
            Sentry, so surface it rather than hiding it. */}
        {error.digest && (
          <p className="mt-8 text-[11px] text-[#F7E7CE]/25 font-mono">
            Reference: {error.digest}
          </p>
        )}

        <Link
          href="/help"
          className="group mt-10 inline-flex items-center gap-2 text-xs text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 transition-colors"
        >
          Visit the Help Centre
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
