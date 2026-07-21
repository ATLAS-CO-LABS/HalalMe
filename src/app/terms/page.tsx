"use client";

import { motion } from "framer-motion";

const CREAM = "#F7E7CE";
const GOLD = "#F59E0B";

const LAST_UPDATED = "21 July 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#102C26]">
      <Hero />
      <DocumentBody />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A1C19] px-6 pt-36 pb-20 md:pt-44 md:pb-24">
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Legal
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Terms of
          <br />
          <span className="text-[#F7E7CE]/45">Service</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-sm text-[#F7E7CE]/40"
        >
          Last updated {LAST_UPDATED}
        </motion.p>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight mb-4" style={{ color: CREAM }}>
        {title}
      </h2>
      <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: `${CREAM}90` }}>
        {children}
      </div>
    </div>
  );
}

function DocumentBody() {
  return (
    <section className="bg-[#102C26] px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm md:text-base leading-relaxed mb-16" style={{ color: `${CREAM}70` }}>
          These Terms of Service ("Terms") govern your access to and use of HalalMe, including our
          website, mobile experience, and all related services: Delivery, Kitchen (AI recipes), Hub
          (community), Charity donations, and Rewards. By creating an account or using any part of
          HalalMe, you agree to these Terms and to our{" "}
          <a href="/privacy" className="underline" style={{ color: GOLD }}>Privacy Policy</a>. If you do
          not agree, please do not use the platform.
        </p>

        <Section title="1. Who we are">
          <p>
            HalalMe is operated by <strong style={{ color: CREAM }}>HalalMe Delivery LTD</strong>{" "}
            (Company No. 13450710), registered in England and Wales, with a registered office at
            71-75 Shelton Street, London, WC2H 9JQ, United Kingdom.
          </p>
        </Section>

        <Section title="2. Your account">
          <p>
            You must be at least 16 years old to create a HalalMe account. You&apos;re responsible for
            keeping your login details secure and for all activity that happens under your account.
            Tell us straight away at{" "}
            <a href="mailto:support@halalme.co.uk" className="underline" style={{ color: GOLD }}>
              support@halalme.co.uk
            </a>{" "}
            if you think someone else has access to it.
          </p>
          <p>
            The information you give us when you register needs to be accurate and kept up to date.
            We can suspend or close an account that breaches these Terms, that we reasonably believe
            is fraudulent, or that&apos;s inactive for an extended period.
          </p>
        </Section>

        <Section title="3. Halal certification">
          <p>
            HalalMe verifies halal certification for all listed merchants at onboarding, but we
            cannot guarantee the halal status of every individual item at all times. Certification
            status can change, and preparation practices are ultimately the responsibility of each
            merchant. If you have a concern about a specific order or listing, please report it to{" "}
            <a href="mailto:support@halalme.co.uk" className="underline" style={{ color: GOLD }}>
              support@halalme.co.uk
            </a>{" "}
            and we&apos;ll investigate.
          </p>
        </Section>

        <Section title="4. Marketplace and third parties">
          <p>
            HalalMe is a marketplace. Merchants and delivery partners listed on the platform operate
            independently, they are not HalalMe employees, agents, or subsidiaries. We are not liable
            for the conduct, acts, or omissions of any merchant or delivery partner, or for
            third-party fulfilment of an order once it leaves their hands. Any dispute over food
            quality, order accuracy, or delivery should first be raised with the merchant or delivery
            partner directly; our support team can help facilitate this.
          </p>
        </Section>

        <Section title="5. Kitchen and AI-generated content">
          <p>
            HalalMe Kitchen includes an AI assistant ("AQI") that generates recipe suggestions based
            on your prompts. AI-generated recipes are suggestions only, they are not reviewed by a
            human for nutritional accuracy, allergen safety, or halal compliance before being shown
            to you. Always check ingredients and preparation methods yourself, particularly if you
            have allergies or specific dietary requirements.
          </p>
        </Section>

        <Section title="6. Hub and community content">
          <p>
            When you post, comment, or otherwise share content on HalalMe Hub, you keep ownership of
            it, but you grant HalalMe a non-exclusive, worldwide, royalty-free licence to host,
            display, and distribute it as part of operating the platform.
          </p>
          <p>
            You agree not to post content that is illegal, defamatory, harassing, hateful, or that
            infringes someone else&apos;s rights. We can remove content or suspend accounts that
            breach this, at our discretion.
          </p>
        </Section>

        <Section title="7. Payments">
          <p>
            Payments on HalalMe are processed by Stripe. We do not store your full card details on
            our own servers. By making a payment, you also agree to Stripe&apos;s own terms of
            service, which apply to the processing of that transaction.
          </p>
        </Section>

        <Section title="8. Charitable donations">
          <p>
            Donations made through HalalMe Charity are processed by verified charity partners via
            Stripe Connect, funds are paid directly to the receiving charity&apos;s own connected
            account, not held by HalalMe. A small platform fee, shown before you confirm your
            donation, is deducted to cover payment processing and platform costs. Donations are
            generally non-refundable once completed, except where required by law or at the
            discretion of the receiving charity.
          </p>
        </Section>

        <Section title="9. Rewards and points">
          <p>
            HalalMe Rewards lets you earn points through eligible activity (such as donations) and
            redeem them for perks within the platform. Points have no cash value, cannot be
            transferred between accounts, and may expire or be adjusted if we identify fraudulent or
            abusive activity. We may change the rewards program, including point values and
            available redemptions, at any time.
          </p>
        </Section>

        <Section title="10. Intellectual property">
          <p>
            The HalalMe name, logo, and platform design are owned by HalalMe Delivery LTD. You may
            not copy, reproduce, or use them without our written permission.
          </p>
        </Section>

        <Section title="11. Disclaimer and limitation of liability">
          <p>
            Services are provided on an <strong style={{ color: CREAM }}>&quot;as is&quot;</strong> basis,
            without warranties of any kind, express or implied. To the fullest extent permitted by
            law, HalalMe Delivery LTD is not liable for any indirect, incidental, or consequential
            loss arising from your use of the platform, including loss arising from the acts of
            independent merchants, delivery partners, or charity partners. Nothing in these Terms
            excludes liability that cannot be excluded under UK law, such as liability for death or
            personal injury caused by negligence, or fraud.
          </p>
        </Section>

        <Section title="12. Governing law">
          <p>
            These Terms are governed by the laws of England and Wales, and any dispute will be
            subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </Section>

        <Section title="13. Changes to these Terms">
          <p>
            We may update these Terms from time to time as the platform evolves. If we make material
            changes, we&apos;ll let you know, for example by email or an in-app notice, before they
            take effect. Continuing to use HalalMe after that means you accept the updated Terms.
          </p>
        </Section>

        <Section title="14. Contact us">
          <p>
            Questions about these Terms? Reach us at{" "}
            <a href="mailto:support@halalme.co.uk" className="underline" style={{ color: GOLD }}>
              support@halalme.co.uk
            </a>{" "}
            or write to us at 71-75 Shelton Street, London, WC2H 9JQ, United Kingdom.
          </p>
        </Section>
      </div>
    </section>
  );
}
