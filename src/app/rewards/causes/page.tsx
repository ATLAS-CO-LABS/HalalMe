"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Filter, Heart, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import CharityCard from "@/components/rewards/CharityCard";
import { charities, categories } from "@/data/charities";

export default function CausesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCharities = charities.filter((charity) => {
    const matchesCategory =
      selectedCategory === "All" || charity.category === selectedCategory;
    const matchesSearch =
      charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600 rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600 rounded-full filter blur-3xl opacity-10"></div>
        </div>

        <div className="mx-auto max-w-6xl relative z-10">
          <Link
            href="/rewards"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Rewards</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Choose a{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Cause
              </span>
            </h1>
            <p
              className="text-lg text-gray-400 max-w-2xl font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Browse through our verified charity causes and make a donation
              that makes a difference.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 md:px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search causes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {/* Category Filter Dropdown (Mobile) */}
            <div className="md:hidden relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills (Desktop) */}
          <div className="hidden md:flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-gray-500 text-sm mb-6">
            Showing {filteredCharities.length} cause
            {filteredCharities.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Charity Grid */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          {filteredCharities.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharities.map((charity, index) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CharityCard charity={charity} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                No causes found
              </h3>
              <p
                className="text-gray-400 font-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
