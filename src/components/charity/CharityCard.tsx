"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, Users, ArrowRight } from "lucide-react";
import type { Charity } from "@/types/app";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";

interface CharityCardProps {
  charity: Charity;
}

export default function CharityCard({ charity }: CharityCardProps) {
  const pct = Math.min((charity.raised_amount / (charity.goal_amount || 1)) * 100, 100);

  return (
    <Link href={`/charity/causes/${charity.slug}`}>
      <div
        className="group relative flex flex-col min-h-[320px] overflow-hidden transition-colors duration-300 cursor-pointer"
        style={{ backgroundColor: BG2, border: `1px solid ${CREAM}05` }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1C3828")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
      >
        {/* Image area */}
        <div className="relative h-44 flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#091510" }}>
          {charity.image_url ? (
            <Image
              src={charity.image_url}
              alt={charity.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <Heart className="w-12 h-12" style={{ color: `${TEAL}25` }} />
          )}
          {charity.is_featured && (
            <div
              className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
              style={{ backgroundColor: TEAL, color: BG }}
            >
              Featured
            </div>
          )}
          <div
            className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
            style={{ backgroundColor: `${BG}CC`, color: TEAL, border: `1px solid ${TEAL}30` }}
          >
            {charity.category}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3
            className="text-base font-extrabold uppercase tracking-tighter mb-2 transition-colors duration-300 group-hover:text-teal-400 line-clamp-1"
            style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
          >
            {charity.name}
          </h3>
          <p
            className="text-xs leading-relaxed mb-4 line-clamp-2 flex-1 font-normal"
            style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}
          >
            {charity.description}
          </p>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold" style={{ color: TEAL }}>
                £{charity.raised_amount.toLocaleString()}
              </span>
              <span style={{ color: `${CREAM}30` }}>
                of £{(charity.goal_amount ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="h-1" style={{ backgroundColor: `${CREAM}10` }}>
              <motion.div
                className="h-full"
                style={{ backgroundColor: TEAL }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: `${CREAM}30` }}>
              <Users className="w-3.5 h-3.5" />
              <span>{charity.donor_count.toLocaleString()} donors</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 group-hover:text-white"
              style={{ color: TEAL }}
            >
              Donate <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
