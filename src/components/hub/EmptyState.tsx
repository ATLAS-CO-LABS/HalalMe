"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="bg-gray-800 rounded-full p-6 mb-6">
        <Icon className="w-12 h-12 text-gray-600" />
      </div>
      <h3
        className="text-2xl font-bold text-white mb-2 text-center"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {title}
      </h3>
      <p
        className="text-gray-400 text-center mb-6 max-w-md font-normal"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {description}
      </p>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="bg-gradient-to-br from-[#FF8A1E] to-[#CC6A0F] text-white px-6 py-3 rounded-full font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
