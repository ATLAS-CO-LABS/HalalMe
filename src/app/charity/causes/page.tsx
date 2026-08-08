import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import { supabasePublic } from "@/services/supabase";
import type { Charity } from "@/types/app";
import CausesGrid from "./CausesGrid";

const BG    = "#0F1F17";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";

export const metadata: Metadata = {
  title: "Browse Causes",
  description: "Browse verified charity causes on HalalMe and give sadaqah or zakat directly, with a full record of your impact.",
  alternates: { canonical: "/charity/causes" },
  openGraph: {
    title: "Browse Causes | HalalMe Charity",
    description: "Browse verified charity causes on HalalMe and give sadaqah or zakat directly, with a full record of your impact.",
    url: "https://halalme.co.uk/charity/causes",
  },
};

// Public read — no session needed, matches the "public SELECT" convention
// (see src/app/sitemap.ts for the same pattern).
async function getCharities(): Promise<Charity[]> {
  const { data, error } = await supabasePublic
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .eq("stripe_charges_enabled", true)
    .order("is_featured", { ascending: false });

  if (error) {
    console.error("[charity/causes] getCharities failed", error);
    return [];
  }
  return data ?? [];
}

export default async function CausesPage() {
  const charities = await getCharities();
  const categories = ["All", ...new Set(charities.map((c) => c.category))].sort(
    (a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)),
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <Header />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-6 md:px-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page sections/rewards4.png"
            alt="Browse causes"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG}D0 0%, ${BG}70 45%, transparent 80%)` }} />
        </div>
        <div className="relative z-10 max-w-[95vw] mx-auto">
          <Link
            href="/charity"
            className="inline-flex items-center gap-2 mb-10 font-semibold text-sm uppercase tracking-wider transition-colors"
            style={{ color: `${CREAM}40` }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Charity
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
              Verified Causes
            </span>
          </div>

          <h1
            className="font-extrabold uppercase tracking-tighter leading-[0.88] text-4xl sm:text-5xl md:text-7xl mb-4"
            style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
          >
            Choose a{" "}
            <span style={{ color: TEAL }}>Charity.</span>
          </h1>
          <p
            className="text-base max-w-xl leading-relaxed font-normal"
            style={{ color: `${CREAM}50`, fontFamily: "var(--font-body)" }}
          >
            Browse through our verified charity causes and make a donation that makes a difference.
          </p>
        </div>
      </section>

      <CausesGrid charities={charities} categories={categories} />
    </div>
  );
}
