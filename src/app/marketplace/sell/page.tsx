"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, Megaphone, PackageCheck, Send, ShieldCheck, Store } from "lucide-react";
import { Eyebrow, PageHeader } from "@/components/marketplace/shared";
import { BG, BG2, BLUE, CREAM, DEEP, WATERMARK } from "@/components/marketplace/theme";

const STEPS = [
  {
    num: "01",
    icon: Send,
    title: "Apply Online",
    desc: "Tell us about your business, upload your documents and set up your store profile.",
  },
  {
    num: "02",
    icon: ClipboardCheck,
    title: "We Review",
    desc: "Our team checks your business details and documents, usually within 2 working days.",
  },
  {
    num: "03",
    icon: Store,
    title: "List Your Products",
    desc: "Add photos, prices and stock from your own dashboard. We check each listing before it goes live.",
  },
  {
    num: "04",
    icon: PackageCheck,
    title: "You Ship, You Get Paid",
    desc: "Orders arrive in your dashboard. You post them with your own courier, add tracking, and we pay you your share.",
  },
];

const REASONS = [
  {
    icon: Megaphone,
    title: "A Ready Audience",
    desc: "Reach people who already use HalalMe for food, recipes, community and giving.",
  },
  {
    icon: ShieldCheck,
    title: "A Trusted Shelf",
    desc: "We check every seller and every listing, so your products sit next to businesses that share your standards.",
  },
  {
    icon: Store,
    title: "No Shop to Build",
    desc: "No website, checkout or payment setup on your side. You get a dashboard for products, orders and payouts.",
  },
];

export default function MarketplaceSellPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sell on HalalMe"
        title="Put Your Products in Front of the Community"
        description="Open your own store on HalalMe Marketplace. Apply online, list your products, and manage orders and payouts from one dashboard."
      />

      {/* How it works */}
      <section className="py-16 md:py-24" style={{ backgroundColor: BG, borderBottom: `1px solid ${BLUE}50` }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <Eyebrow>How It Works</Eyebrow>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "1px", backgroundColor: `${BLUE}50` }}>
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="relative p-7 md:p-8 overflow-hidden min-h-56 flex flex-col"
                style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-5 -right-2 text-[7rem] md:text-[8rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: WATERMARK }}
                >
                  {step.num}
                </span>
                <div className="relative z-10">
                  <step.icon className="w-7 h-7 mb-6" style={{ color: BLUE }} aria-hidden="true" />
                  <h2
                    className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {step.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 md:py-24" style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <Eyebrow>Why Sell Here</Eyebrow>
          <ul className="grid md:grid-cols-3" style={{ gap: "1px", backgroundColor: `${BLUE}50` }}>
            {REASONS.map((reason) => (
              <li
                key={reason.title}
                className="p-7 md:p-8"
                style={{ backgroundColor: BG, border: `1px solid ${BLUE}50` }}
              >
                <reason.icon className="w-7 h-7 mb-6" style={{ color: BLUE }} aria-hidden="true" />
                <h2
                  className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {reason.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}>
                  {reason.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: DEEP }}>
        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9] mb-6 text-white">
            Think You Are
            <br />
            <span className="text-white/60">a Good Fit?</span>
          </h2>
          <p
            className="text-base md:text-lg max-w-xl leading-relaxed mb-10 text-white/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            The application takes a few minutes to start, and you can save it and come back at any time.
          </p>
          <Link
            href="/partner/vendor"
            className="inline-flex items-center gap-3 px-8 py-4 font-extrabold uppercase tracking-tighter text-base text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BG }}
          >
            Apply to Sell <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
