"use client";

import { motion } from "framer-motion";

const CREAM = "#F7E7CE";
const GOLD = "#F59E0B";

const LAST_UPDATED = "21 July 2026";

export default function PrivacyPage() {
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
          Privacy
          <br />
          <span className="text-[#F7E7CE]/45">Policy</span>
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
          HalalMe Delivery LTD ("HalalMe", "we", "us") processes personal data under UK GDPR and the
          Data Protection Act 2018. This policy explains what we collect, why, who we share it with,
          and the rights you have over it.
        </p>

        <Section title="1. Who we are">
          <p>
            HalalMe is operated by <strong style={{ color: CREAM }}>HalalMe Delivery LTD</strong>{" "}
            (Company No. 13450710), registered in England and Wales, registered office at 71-75
            Shelton Street, London, WC2H 9JQ, United Kingdom. We are the data controller for the
            personal data described in this policy.
          </p>
        </Section>

        <Section title="2. What we collect">
          <p>Depending on how you use HalalMe, we collect:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong style={{ color: CREAM }}>Account details</strong> — name, email, username, phone number, avatar, and password (stored securely hashed, we never see it in plain text).</li>
            <li><strong style={{ color: CREAM }}>Profile and activity data</strong> — recipes, posts, comments, likes, follows, and messages you create on Kitchen and Hub.</li>
            <li><strong style={{ color: CREAM }}>AI chat content</strong> — messages you send to our Kitchen AI assistant (AQI), used to generate recipe responses.</li>
            <li><strong style={{ color: CREAM }}>Payment and donation data</strong> — handled directly by Stripe; we store the outcome (amount, status, receipt reference), never your full card number.</li>
            <li><strong style={{ color: CREAM }}>Delivery details</strong> — if you use HalalMe Delivery, your name, phone number, and delivery address are shared with our delivery platform partner to fulfil your order.</li>
            <li><strong style={{ color: CREAM }}>Device and usage data</strong> — IP address, browser type, and pages visited, collected automatically to keep the platform secure and working properly.</li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <ul className="list-disc pl-5 space-y-2">
            <li>To create and manage your account, and provide the services you request.</li>
            <li>To process payments and charitable donations.</li>
            <li>To generate AI recipe suggestions in response to your prompts.</li>
            <li>To send you transactional emails (order confirmations, password resets, receipts).</li>
            <li>To calculate and award Rewards points.</li>
            <li>To detect and prevent fraud, and keep the platform secure.</li>
            <li>To respond when you contact our support team.</li>
          </ul>
        </Section>

        <Section title="4. Who we share it with">
          <p>
            We don&apos;t sell your personal data. We share it only with service providers who help
            us run HalalMe, each bound by their own data protection obligations:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong style={{ color: CREAM }}>Supabase</strong> — hosts our database, authentication, and file storage.</li>
            <li><strong style={{ color: CREAM }}>Stripe</strong> — processes payments and charitable donations, including transferring donations directly to verified charity partners.</li>
            <li><strong style={{ color: CREAM }}>Cloudinary</strong> — hosts images you upload (avatars, post photos, recipe photos).</li>
            <li><strong style={{ color: CREAM }}>OpenAI</strong> — processes the messages you send to our Kitchen AI assistant to generate recipe responses.</li>
            <li><strong style={{ color: CREAM }}>Resend</strong> — sends transactional emails on our behalf.</li>
            <li><strong style={{ color: CREAM }}>Our delivery platform partner</strong> — receives your delivery details to fulfil Delivery orders.</li>
          </ul>
          <p>
            We may also disclose data if required by law, or to protect the rights, safety, or
            property of HalalMe, our users, or the public.
          </p>
        </Section>

        <Section title="5. International transfers">
          <p>
            Some of our service providers, including OpenAI and Stripe, may process data outside the
            UK. Where this happens, we rely on appropriate safeguards, such as Standard Contractual
            Clauses, to ensure your data remains protected to UK standards.
          </p>
        </Section>

        <Section title="6. How long we keep it">
          <p>
            We keep your data for as long as your account is active, and for a reasonable period
            after closure to meet legal, accounting, or fraud-prevention obligations (for example,
            financial transaction records are typically kept for 6 years as required by UK tax law).
            You can ask us to delete your account and associated data at any time, subject to those
            obligations.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>Under UK GDPR, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Ask us to correct inaccurate data.</li>
            <li>Ask us to delete your data ("right to be forgotten"), subject to our legal obligations.</li>
            <li>Ask us to restrict or object to certain processing.</li>
            <li>Receive your data in a portable format.</li>
            <li>Withdraw consent at any time, where we rely on consent.</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:support@halalme.co.uk" className="underline" style={{ color: GOLD }}>
              support@halalme.co.uk
            </a>
            . You also have the right to complain to the UK Information Commissioner&apos;s Office
            (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: GOLD }}>
              ico.org.uk
            </a>{" "}
            if you believe we haven&apos;t handled your data properly.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use cookies to keep you signed in and remember your preferences. See our{" "}
            <a href="/cookies" className="underline" style={{ color: GOLD }}>Cookie Policy</a>{" "}
            for details.
          </p>
        </Section>

        <Section title="9. Children&apos;s privacy">
          <p>
            HalalMe is not intended for children under 16, and we do not knowingly collect data from
            them. If you believe a child has provided us with personal data, contact us and
            we&apos;ll remove it.
          </p>
        </Section>

        <Section title="10. Security">
          <p>
            We use industry-standard technical and organisational measures to protect your data,
            including encrypted connections, row-level access controls on our database, and
            restricted internal access. No system is completely secure, but we work to keep your
            data safe and respond quickly if anything changes.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this policy as our services evolve. Material changes will be communicated
            before they take effect, for example by email or an in-app notice.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>
            For any privacy question or to exercise your rights, email{" "}
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
