import Link from "next/link";
import { BG2, BLUE, CREAM } from "@/components/marketplace/theme";

const LINKS = [
  { href: "/marketplace/shop", label: "Shop all" },
  { href: "/marketplace/sellers", label: "Sellers" },
  { href: "/marketplace/orders", label: "Your orders" },
  { href: "/marketplace/help", label: "Delivery & returns" },
  { href: "/marketplace/sell", label: "Sell on HalalMe" },
  { href: "/contact", label: "Contact us" },
];

/** Slim footer for the shop. The main site footer is hidden on Marketplace pages. */
export default function MarketplaceFooter() {
  return (
    <footer style={{ backgroundColor: BG2, borderTop: `1px solid ${BLUE}50` }}>
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <nav aria-label="Marketplace footer">
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-white"
                  style={{ color: `${CREAM}B3` }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs" style={{ color: `${CREAM}80` }}>
          Sold and sent by independent sellers. Checked by HalalMe.
        </p>
      </div>
    </footer>
  );
}
