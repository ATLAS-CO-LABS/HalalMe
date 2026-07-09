"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

const AMBER = "#F59E0B";
const CREAM = "#F7E7CE";

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
      <div className="p-6 mb-6 border" style={{ backgroundColor: `${CREAM}08`, borderColor: `${AMBER}20` }}>
        <Icon className="w-12 h-12" style={{ color: `${AMBER}80` }} />
      </div>
      <h3
        className="text-2xl font-extrabold uppercase tracking-tighter mb-2 text-center"
        style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
      >
        {title}
      </h3>
      <p
        className="text-center mb-6 max-w-md font-normal"
        style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}
      >
        {description}
      </p>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-3 font-extrabold uppercase tracking-tighter text-sm"
          style={{ backgroundColor: AMBER, color: "#0B0D0F" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
