// Storefront category copy. Handles match VENDOR_CATEGORIES in
// lib/vendorOnboarding, which is what vendors and admins pick from. Products
// and sellers are no longer kept here: the shop reads the same sample store as
// the vendor portal and the admin screens (see marketplaceService).

import type { MarketplaceCategory } from "@/types/marketplace";

export const MOCK_CATEGORIES: MarketplaceCategory[] = [
  { handle: "modest-fashion", title: "Modest Fashion", description: "Hijabs, abayas, thobes and modest activewear." },
  { handle: "prayer-worship", title: "Prayer & Worship", description: "Prayer mats, tasbih, attar and home decor." },
  { handle: "books-learning", title: "Books & Learning", description: "Qur'an, Islamic literature and study aids." },
  { handle: "beauty-skincare", title: "Beauty & Skincare", description: "Wudu-friendly makeup and halal-conscious skincare." },
  { handle: "kids-family", title: "Kids & Family", description: "Islamic toys, books and modest kidswear." },
  { handle: "food-pantry", title: "Food & Pantry", description: "Halal snacks, spices and pantry staples." },
  { handle: "daily-essentials", title: "Daily Essentials", description: "Everyday home and personal care picks." },
  { handle: "gifts-occasions", title: "Gifts & Occasions", description: "Eid, Ramadan, nikah and new-home gifts." },
];
