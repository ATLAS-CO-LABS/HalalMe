import type { Metadata } from "next";
import { MarketplaceCartProvider } from "@/context/MarketplaceCartContext";
import { MarketplaceSavedProvider } from "@/context/MarketplaceSavedContext";
import MarketplaceNav from "@/components/marketplace/MarketplaceNav";
import MarketplaceFooter from "@/components/marketplace/MarketplaceFooter";
import { BG } from "@/components/marketplace/theme";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Modest fashion, prayer essentials, books and more from verified independent sellers. One basket, one checkout.",
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketplaceCartProvider>
      <MarketplaceSavedProvider>
        {/* pt-16 clears the fixed site header; the section bar sticks just below it */}
        <div className="min-h-screen pt-16 flex flex-col" style={{ backgroundColor: BG }}>
          <MarketplaceNav />
          <div className="flex-1">{children}</div>
          <MarketplaceFooter />
        </div>
      </MarketplaceSavedProvider>
    </MarketplaceCartProvider>
  );
}
