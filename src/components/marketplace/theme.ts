import {
  Shirt,
  Moon,
  BookOpen,
  Sparkles,
  Baby,
  UtensilsCrossed,
  ShoppingBasket,
  Gift,
  Tag,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";

/* ─── Marketplace design tokens - dark navy ───────────────── */
export const BG = "#0C1524"; // deep navy, lifted from near-black
export const BG2 = "#121E33"; // card sections
export const BG_HOVER = "#182844";
export const WATERMARK = "#0A1220"; // oversized card numerals
export const CREAM = "#F7E7CE";
export const BLUE = "#3B82F6";
export const DEEP = "#2563EB"; // blue-600 - solid button bg

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "modest-fashion": Shirt,
  "prayer-worship": Moon,
  "books-learning": BookOpen,
  "beauty-skincare": Sparkles,
  "kids-family": Baby,
  "food-pantry": UtensilsCrossed,
  "daily-essentials": ShoppingBasket,
  "gifts-occasions": Gift,
};

/** Categories come from the catalogue, so an unknown handle gets a generic icon. */
export function CategoryIcon({ handle, ...props }: { handle: string } & LucideProps) {
  return createElement(CATEGORY_ICONS[handle] ?? Tag, props);
}

export function formatPrice(amount: number): string {
  return `£${amount.toFixed(2)}`;
}
