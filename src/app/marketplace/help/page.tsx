"use client";

import Link from "next/link";
import { ArrowRight, Lock, PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Eyebrow, PageHeader } from "@/components/marketplace/shared";
import { BG, BG2, BLUE, CREAM, DEEP, WATERMARK } from "@/components/marketplace/theme";

const BASICS = [
  {
    num: "01",
    icon: Truck,
    title: "Delivery",
    desc: "Each seller posts your items themselves, using their own courier. Delivery is charged per seller, and many offer free delivery over a set amount. You see the exact cost in your basket before you pay.",
  },
  {
    num: "02",
    icon: PackageCheck,
    title: "More Than One Parcel",
    desc: "If your basket has items from different sellers, you pay once but each seller sends their own parcel. They may arrive on different days, and each has its own tracking number.",
  },
  {
    num: "03",
    icon: RotateCcw,
    title: "Returns",
    desc: "You can return most items within at least 14 days of delivery. Each seller's returns policy is shown on their store page and on every product page. Contact HalalMe to start a return and we will arrange it with the seller.",
  },
];

const FAQ = [
  {
    q: "How do I track my order?",
    a: "Go to Your Orders. Each parcel shows its progress, and once it has been posted you will see the courier and tracking number there and in your email.",
  },
  {
    q: "When will my order arrive?",
    a: "Every seller shows how quickly they send orders on their store page, usually within 1 to 3 working days. Delivery time after that depends on the courier.",
  },
  {
    q: "Who am I buying from?",
    a: "You are buying from independent sellers through HalalMe. HalalMe takes your payment, verifies every seller before they can open a store, and reviews each product before it goes on sale.",
  },
  {
    q: "Something arrived damaged or is not as described. What do I do?",
    a: "Contact HalalMe with your parcel number and a photo if you can. We will sort out a replacement or refund with the seller.",
  },
  {
    q: "Who pays for return postage?",
    a: "It depends on the seller and the reason. If an item is faulty or not as described, you do not pay. For a change of mind, the seller's own policy applies.",
  },
  {
    q: "Can I use a discount code?",
    a: "Yes. Enter it in your basket. Codes are offered by individual sellers, so a code applies to that seller's products only.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Card payments are handled by a secure payment provider. HalalMe and its sellers never see or store your card details.",
  },
];

export default function MarketplaceHelpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Delivery, Returns & Help"
        description="How buying from independent sellers on HalalMe Marketplace works."
      />

      <section className="py-16 md:py-20" style={{ backgroundColor: BG, borderBottom: `1px solid ${BLUE}50` }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <Eyebrow>The Basics</Eyebrow>
          <ul className="grid md:grid-cols-3" style={{ gap: "1px", backgroundColor: `${BLUE}50` }}>
            {BASICS.map((item) => (
              <li key={item.num} className="relative p-7 md:p-9 overflow-hidden" style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}>
                <span aria-hidden="true" className="absolute -top-5 -right-2 text-[7rem] md:text-[8rem] font-extrabold leading-none select-none pointer-events-none" style={{ color: WATERMARK }}>
                  {item.num}
                </span>
                <div className="relative z-10">
                  <item.icon className="w-7 h-7 mb-6" style={{ color: BLUE }} aria-hidden="true" />
                  <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-3" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                    {item.title}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: `${CREAM}CC`, fontFamily: "var(--font-body)" }}>
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 grid lg:grid-cols-3 gap-10">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter leading-[0.92]" style={{ color: CREAM }}>
              Common Questions
            </h2>
            <ul className="mt-8 space-y-3">
              {[
                { icon: ShieldCheck, text: "Every seller verified by HalalMe" },
                { icon: Lock, text: "Secure card checkout" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wide" style={{ color: `${CREAM}B3` }}>
                  <item.icon className="w-4 h-4" style={{ color: BLUE }} aria-hidden="true" /> {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2" style={{ borderTop: `1px solid ${BLUE}50` }}>
            {FAQ.map((item) => (
              <details key={item.q} className="group" style={{ borderBottom: `1px solid ${BLUE}50` }}>
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-base font-bold" style={{ color: CREAM }}>
                  {item.q}
                  <span className="text-2xl leading-none transition-transform group-open:rotate-45" style={{ color: BLUE }} aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed max-w-2xl" style={{ color: `${CREAM}CC`, fontFamily: "var(--font-body)" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: DEEP }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter text-white">Still Need a Hand?</h2>
            <p className="text-sm md:text-base mt-2 text-white/80">Our team answers every message, usually within 1 working day.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-3 px-7 py-4 font-extrabold uppercase tracking-tighter text-sm text-white hover:opacity-90" style={{ backgroundColor: BG }}>
              Contact support <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/marketplace/orders" className="inline-flex items-center gap-3 px-7 py-4 border-2 border-white/40 font-extrabold uppercase tracking-tighter text-sm text-white hover:bg-white/10">
              Your orders
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
