import type { MarketplaceVendor } from "@/types/marketplace";
import { BG, BLUE } from "@/components/marketplace/theme";

/** A seller's logo, or their initials when they have not uploaded one. */
export function SellerLogo({ seller, size = 56 }: { seller: Pick<MarketplaceVendor, "name" | "logo">; size?: number }) {
  return (
    <span
      className="relative shrink-0 overflow-hidden flex items-center justify-center font-extrabold"
      style={{ width: size, height: size, fontSize: size / 3.2, backgroundColor: BG, border: `1px solid ${BLUE}50`, color: BLUE }}
    >
      {seller.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- seller upload
        <img src={seller.logo} alt="" className="w-full h-full object-cover" />
      ) : (
        seller.name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
