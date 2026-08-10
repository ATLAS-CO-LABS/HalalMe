import type { Metadata } from "next";
import Link from "next/link";
import { Truck, ChefHat, Users, HandHeart, Gift, ArrowRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: "/delivery", label: "Delivery", desc: "Order halal food near you", Icon: Truck, accent: "#B96AF0" },
  { href: "/kitchen", label: "Kitchen", desc: "AI-powered halal recipes", Icon: ChefHat, accent: "#F03E9E" },
  { href: "/social", label: "Social", desc: "The halal community feed", Icon: Users, accent: "#F59E0B" },
  { href: "/charity", label: "Charity", desc: "Give to registered causes", Icon: HandHeart, accent: "#14B8A6" },
  { href: "/rewards", label: "Rewards", desc: "Earn points, redeem perks", Icon: Gift, accent: "#FB7185" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-3xl mx-auto text-center">
        <span
          className="block text-[6rem] sm:text-[8rem] md:text-[10rem] font-extrabold leading-none tracking-tighter"
          style={{ color: "rgba(247,231,206,0.08)", fontFamily: "var(--font-headline)" }}
        >
          404
        </span>

        <h1 className="-mt-8 sm:-mt-12 md:-mt-16 text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-[#F7E7CE]">
          This Page Wandered Off the Map.
        </h1>
        <p className="mt-4 text-sm md:text-base text-[#F7E7CE]/50 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, or it&apos;s moved.
          Here&apos;s where you probably meant to go.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mt-14 grid gap-px sm:grid-cols-2 md:grid-cols-3 bg-[#F7E7CE]/8">
          {QUICK_LINKS.map(({ href, label, desc, Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 p-5 bg-[#102C26] hover:bg-[#0A1C19] transition-colors text-left"
            >
              <div
                className="w-9 h-9 flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accent}18` }}
              >
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold uppercase tracking-tighter text-[#F7E7CE]">
                  {label}
                </p>
                <p className="text-[11px] text-[#F7E7CE]/40 truncate">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#F7E7CE]/20 group-hover:text-[#F7E7CE]/50 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}

          <Link
            href="/help"
            className="group flex items-center gap-3 p-5 bg-[#102C26] hover:bg-[#0A1C19] transition-colors text-left"
          >
            <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-[#F7E7CE]/8">
              <span className="text-sm font-extrabold text-[#F7E7CE]/60">?</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold uppercase tracking-tighter text-[#F7E7CE]">
                Help Centre
              </p>
              <p className="text-[11px] text-[#F7E7CE]/40 truncate">Answers &amp; support</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#F7E7CE]/20 group-hover:text-[#F7E7CE]/50 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
