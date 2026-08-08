"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Heart } from "lucide-react";
import CharityCard from "@/components/charity/CharityCard";
import type { Charity } from "@/types/app";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";

interface CausesGridProps {
  charities: Charity[];
  categories: string[];
}

// Client island: search + category filtering over data the server already
// fetched. No loading state needed — the list arrives with the page.
export default function CausesGrid({ charities, categories }: CausesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery]           = useState("");

  const filteredCharities = charities.filter((c) => {
    const matchesCat    = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
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
            {filteredCharities.length} cause{filteredCharities.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </section>

      {/* ─── Grid ─────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-12" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto">
          {filteredCharities.length > 0 ? (
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
    </>
  );
}
