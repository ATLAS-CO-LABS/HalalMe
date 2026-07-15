"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Users, Target, Share2, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import DonationAmountSelector from "@/components/charity/DonationAmountSelector";
import { rewardsService } from "@/services/rewardsService";
import type { Charity } from "@/types/app";
import AuthGuard from "@/components/auth/AuthGuard";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";
const DEEP  = "#0D9488";

export default function CharityDetailPage() {
  return <AuthGuard><CharityDetailContent /></AuthGuard>;
}

function CharityDetailContent() {
  const params    = useParams();
  const router    = useRouter();
  const charityId = params.charityId as string;

  const [charity, setCharity]               = useState<Charity | null>(null);
  const [loading, setLoading]               = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await rewardsService.getCharityBySlug(charityId)
          .catch(() => rewardsService.getCharityById(charityId));
        setCharity(data);
      } catch { setCharity(null); }
      finally  { setLoading(false); }
    }
    load();
  }, [charityId]);

  const handleDonate = () => {
    if (selectedAmount && charity)
      router.push(`/charity/checkout?charityId=${charity.id}&amount=${selectedAmount}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
      <Header />
      <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${TEAL}60`, borderTopColor: "transparent" }} />
    </div>
  );

  if (!charity) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
      <Header />
      <div className="text-center">
        <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
        <h2 className="text-2xl font-extrabold uppercase tracking-tighter mb-2" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
          Cause Not Found
        </h2>
        <p className="mb-6 text-sm font-normal" style={{ color: `${CREAM}40`, fontFamily: "var(--font-body)" }}>
          The cause you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/charity/causes" className="text-sm font-bold uppercase tracking-wider" style={{ color: TEAL }}>
          ← Browse all causes
        </Link>
      </div>
    </div>
  );

  const pct = Math.min((charity.raised_amount / (charity.goal_amount || 1)) * 100, 100);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <Header />

      {/* Back */}
      <section className="pt-24 md:pt-32 px-6 md:px-10">
        <div className="max-w-[95vw] mx-auto">
          <Link
            href="/charity/causes"
            className="inline-flex items-center gap-2 mb-8 font-semibold text-sm uppercase tracking-wider transition-colors"
            style={{ color: `${CREAM}40` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}40`)}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Causes
          </Link>
        </div>
      </section>

      {/* Main */}
      <section className="px-6 md:px-10 pb-20">
        <div className="max-w-[95vw] mx-auto">
          <div className="grid lg:grid-cols-5 gap-px" style={{ backgroundColor: `${CREAM}08` }}>

            {/* ── Left - info ───────────────────────────── */}
            <div className="lg:col-span-3" style={{ backgroundColor: BG }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-8 md:p-10"
              >
                {/* Image */}
                <div className="relative h-64 md:h-80 mb-8 overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#091510" }}>
                  <Image
                    src={charity.image_url ?? "/images/page sections/rewards5.png"}
                    alt={charity.name}
                    fill
                    className={charity.image_url ? "object-contain p-10" : "object-cover"}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG} 0%, ${BG}80 35%, transparent 100%)` }} />
                  <div
                    className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5"
                    style={{ backgroundColor: `${BG}CC`, color: TEAL, border: `1px solid ${TEAL}30` }}
                  >
                    {charity.category}
                  </div>
                  {charity.is_featured && (
                    <div
                      className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5"
                      style={{ backgroundColor: TEAL, color: BG }}
                    >
                      Featured
                    </div>
                  )}
                </div>

                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: TEAL }}>
                    {charity.category}
                  </span>
                </div>

                <h1
                  className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.9] mb-6"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {charity.name}
                </h1>

                <p
                  className="text-base leading-relaxed mb-10 font-normal"
                  style={{ color: `${CREAM}60`, fontFamily: "var(--font-body)" }}
                >
                  {charity.long_description ?? charity.description}
                </p>

                {/* Impact stats */}
                <div
                  className="grid grid-cols-3 gap-px mb-10"
                  style={{ backgroundColor: `${CREAM}08` }}
                >
                  {[
                    { icon: Target, label: "Goal",   value: `£${(charity.goal_amount ?? 0).toLocaleString()}` },
                    { icon: Heart,  label: "Raised", value: `£${charity.raised_amount.toLocaleString()}` },
                    { icon: Users,  label: "Donors", value: charity.donor_count.toLocaleString() },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="py-6 px-4 text-center" style={{ backgroundColor: BG2 }}>
                      <Icon className="w-5 h-5 mx-auto mb-3" style={{ color: TEAL }} />
                      <p className="text-2xl md:text-3xl font-extrabold tracking-tighter leading-none" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>{value}</p>
                      <p className="text-[10px] uppercase tracking-[0.25em] mt-2 font-medium" style={{ color: `${CREAM}35` }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* What your donation does */}
                <div className="mb-8 p-6 md:p-8" style={{ backgroundColor: BG2, border: `1px solid ${CREAM}08` }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>Impact</span>
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-6"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    What Your
                    <br />
                    <span style={{ color: `${CREAM}40` }}>Donation Does.</span>
                  </h3>
                  <div className="space-y-4">
                    {[
                      { amount: "£5",   desc: "Provides essential supplies for one person" },
                      { amount: "£10",  desc: "Supports a family for one week" },
                      { amount: "£20",  desc: "Makes a meaningful impact on the community" },
                      { amount: "£50+", desc: "Creates lasting change for those in need" },
                    ].map(({ amount, desc }, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span
                          className="text-sm font-extrabold tracking-tighter shrink-0 mt-0.5 w-10"
                          style={{ color: TEAL, fontFamily: "var(--font-headline)" }}
                        >
                          {amount}
                        </span>
                        <p className="text-sm font-normal leading-relaxed" style={{ color: `${CREAM}50`, fontFamily: "var(--font-body)" }}>
                          {desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{ color: `${CREAM}30` }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}30`)}
                >
                  <Share2 className="w-4 h-4" /> Share this cause
                </button>
              </motion.div>
            </div>

            {/* ── Right - donation card ─────────────────── */}
            <div className="lg:col-span-2" style={{ backgroundColor: BG2 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-8 md:p-10 sticky top-24"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>Donate Now</span>
                </div>
                <h2
                  className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-8"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  Make a<br />
                  <span style={{ color: `${CREAM}40` }}>Donation.</span>
                </h2>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-[0.15em]" style={{ color: TEAL }}>
                      £{charity.raised_amount.toLocaleString()} raised
                    </span>
                    <span className="text-xs font-bold" style={{ color: `${CREAM}30` }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5" style={{ backgroundColor: `${CREAM}10` }}>
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: TEAL }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: `${CREAM}30` }}>
                    Goal: £{(charity.goal_amount ?? 0).toLocaleString()}
                  </p>
                </div>

                <DonationAmountSelector
                  selectedAmount={selectedAmount}
                  onAmountSelect={setSelectedAmount}
                />

                <motion.button
                  onClick={handleDonate}
                  disabled={!selectedAmount}
                  className="w-full mt-6 py-4 font-extrabold uppercase tracking-tighter text-base transition-all"
                  style={{
                    backgroundColor: selectedAmount ? DEEP : `${CREAM}08`,
                    color: selectedAmount ? "#fff" : `${CREAM}25`,
                    cursor: selectedAmount ? "pointer" : "not-allowed",
                  }}
                  whileHover={selectedAmount ? { scale: 1.02 } : {}}
                  whileTap={selectedAmount ? { scale: 0.98 } : {}}
                >
                  {selectedAmount ? `Donate £${selectedAmount}` : "Select an Amount"}
                </motion.button>

                <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${CREAM}10` }}>
                  <div className="flex items-center justify-center gap-2 text-xs" style={{ color: `${CREAM}30` }}>
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: TEAL }} />
                    <span>Secure payment · 5% platform fee</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
