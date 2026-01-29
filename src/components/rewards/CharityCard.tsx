"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Users } from "lucide-react";
import { Charity } from "@/data/charities";

interface CharityCardProps {
  charity: Charity;
}

export default function CharityCard({ charity }: CharityCardProps) {
  const progressPercentage = Math.min(
    (charity.raised / charity.goal) * 100,
    100
  );

  return (
    <Link href={`/rewards/causes/${charity.id}`}>
      <motion.div
        className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-emerald-500 transition-all h-full flex flex-col"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 flex items-center justify-center">
          <Heart className="w-16 h-16 text-emerald-400/50" />
          {charity.featured && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
            {charity.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3
            className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {charity.name}
          </h3>
          <p
            className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow font-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {charity.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-emerald-400 font-semibold">
                £{charity.raised.toLocaleString()}
              </span>
              <span className="text-gray-500">
                of £{charity.goal.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPercentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{charity.donors} donors</span>
            </div>
            <span className="text-emerald-400 font-semibold">
              {Math.round(progressPercentage)}% funded
            </span>
          </div>
        </div>

        {/* Donate Button */}
        <div className="px-5 pb-5">
          <motion.div
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-3 rounded-xl font-semibold group-hover:from-emerald-500 group-hover:to-teal-500 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Donate Now
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
