"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, Heart, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import CharityCard from "@/components/charity/CharityCard";
import { rewardsService } from "@/services/rewardsService";
import type { Charity } from "@/types/app";
import AuthGuard from "@/components/auth/AuthGuard";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";

export default function CausesPage() {
  return <AuthGuard><CausesContent /></AuthGuard>;
}

function CausesContent() {
  const [charities, setCharities]       = useState<Charity[]>([]);
  const [categories, setCategories]     = useState<string[]>(["All"]);
  const [loading, setLoading]           = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery]   = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [data, cats] = await Promise.all([
          rewardsService.getCharities(),
          rewardsService.getCategories(),
        ]);
        setCharities(data);
        setCategories(["All", ...cats]);
      } catch (err) {
        console.error("Failed to load charities:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCharities = charities.filter((c) => {
    const matchesCat    = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
            onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}40`)}
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

      {/* ─── Search + Filter ──────────────────────────────── */}
      <section className="px-6 md:px-10 pb-8" style={{ backgroundColor: BG2 }}>
        <div className="max-w-[95vw] mx-auto pt-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: `${CREAM}30` }} />
              <input
                type="text"
                placeholder="Search causes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors"
                style={{
                  backgroundColor: BG,
                  border: `1px solid ${CREAM}12`,
                  color: CREAM,
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = TEAL)}
                onBlur={(e) => (e.currentTarget.style.borderColor = `${CREAM}12`)}
              />
            </div>

            {/* Mobile dropdown */}
            <div className="md:hidden relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: `${CREAM}30` }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm appearance-none focus:outline-none"
                style={{
                  backgroundColor: BG,
                  border: `1px solid ${CREAM}12`,
                  color: CREAM,
                  fontFamily: "var(--font-body)",
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c} style={{ backgroundColor: BG2 }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category pills - desktop */}
          <div className="hidden md:flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: selectedCategory === cat ? TEAL : "transparent",
                  color: selectedCategory === cat ? "#fff" : `${CREAM}50`,
                  border: `1px solid ${selectedCategory === cat ? TEAL : `${CREAM}15`}`,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: `${CREAM}30` }}
          >
            {loading
              ? "Loading causes..."
              : `${filteredCharities.length} cause${filteredCharities.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </section>

      {/* ─── Grid ─────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-12" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: `${CREAM}08` }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse" style={{ backgroundColor: BG2 }} />
              ))}
            </div>
          ) : filteredCharities.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: `${CREAM}08` }}>
              {filteredCharities.map((charity, index) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <CharityCard charity={charity} />
                </motion.div>
              ))}
            </div>
          ) : charities.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <Heart className="w-14 h-14 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
              <h3
                className="text-xl font-extrabold uppercase tracking-tighter mb-2"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                Our First Causes Are Coming Soon
              </h3>
              <p className="text-sm font-normal max-w-md mx-auto" style={{ color: `${CREAM}40`, fontFamily: "var(--font-body)" }}>
                We&apos;re onboarding our first charity partners. Check back shortly to start giving.
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <Heart className="w-14 h-14 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
              <h3
                className="text-xl font-extrabold uppercase tracking-tighter mb-2"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                No Causes Found
              </h3>
              <p className="text-sm font-normal" style={{ color: `${CREAM}40`, fontFamily: "var(--font-body)" }}>
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
