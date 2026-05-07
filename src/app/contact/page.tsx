"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#102C26]">
      <HeroSection />
      <ContactFormSection />
      <SupportChannelsSection />
      <BusinessInfoSection />
    </div>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A1C19] px-6 pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Get In Touch
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Contact
          <br />
          <span className="text-[#F7E7CE]/45">Us</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-lg md:text-xl text-[#F7E7CE]/50 max-w-md leading-relaxed"
        >
          We&apos;re here to help. Reach out for support, partnerships, or
          general inquiries.
        </motion.p>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[10rem] md:text-[18rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/60 select-none pointer-events-none translate-x-8 translate-y-8"
      >
        Hello
      </div>
    </section>
  );
}

/* ─── Contact Form ─────────────────────────────────────────────────── */

function ContactFormSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ fullName: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-[#0A1C19] border border-[#F7E7CE]/12 text-[#F7E7CE] placeholder-[#F7E7CE]/20 focus:outline-none focus:border-[#F7E7CE]/40 transition-all text-sm";
  const labelClass =
    "block text-xs font-bold text-[#F7E7CE]/45 uppercase tracking-[0.2em] mb-2";

  return (
    <section ref={ref} className="bg-[#102C26] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left: heading */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-8 h-px bg-[#F59E0B]" />
              <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
                Send a Message
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE] mb-6"
            >
              Send Us
              <br />
              <span className="text-[#F7E7CE]/45">a Message</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-[#F7E7CE]/45 text-sm md:text-base leading-relaxed max-w-sm"
            >
              Fill in the form and we&apos;ll get back to you within 24 hours
              during business days.
            </motion.p>
          </div>

          {/* Right: form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-6 md:p-8 space-y-5"
          >
            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className={labelClass}>
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="" className="bg-[#0A1C19]">
                  Select a subject
                </option>
                <option value="support" className="bg-[#0A1C19]">
                  Support
                </option>
                <option value="order" className="bg-[#0A1C19]">
                  Order Issue
                </option>
                <option value="partnership" className="bg-[#0A1C19]">
                  Partnership
                </option>
                <option value="charity" className="bg-[#0A1C19]">
                  Charity / Rewards
                </option>
                <option value="general" className="bg-[#0A1C19]">
                  General Inquiry
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className={labelClass}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-base hover:bg-[#F7E7CE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Sending…" : "Send Message"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#102C26] border border-[#F7E7CE]/15 p-4"
              >
                <p className="text-[#F7E7CE]/70 text-sm text-center font-semibold uppercase tracking-tight">
                  Message sent - we&apos;ll get back to you soon.
                </p>
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ─── Support Channels ─────────────────────────────────────────────── */

function SupportChannelsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const channels = [
    {
      num: "01",
      title: "General Support",
      email: "support@halalme.co.uk",
      desc: "For account help, orders, and general questions",
    },
    {
      num: "02",
      title: "Business & Partnerships",
      email: "partners@halalme.co.uk",
      desc: "For restaurant partnerships and business inquiries",
    },
    {
      num: "03",
      title: "Charity & Rewards",
      email: "rewards@halalme.co.uk",
      desc: "For charity partnerships and reward program questions",
    },
  ];

  return (
    <section ref={ref} className="bg-[#0A1C19] px-6 py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Support Channels
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Other Ways
          <br />
          <span className="text-[#F7E7CE]/45">to Reach Us</span>
        </motion.h2>
      </div>

      <div className="max-w-[95vw] mx-auto grid md:grid-cols-3 gap-px bg-[#F7E7CE]/8">
        {channels.map((ch, i) => (
          <motion.div
            key={ch.title}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="group relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-8 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300"
          >
            <span
              aria-hidden="true"
              className="absolute -top-4 -right-2 text-[6rem] font-extrabold text-[#102C26] group-hover:text-[#0A1C19]/12 leading-none select-none pointer-events-none transition-colors duration-300"
            >
              {ch.num}
            </span>
            <div className="relative z-10">
              <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-2 transition-colors duration-300">
                {ch.title}
              </h3>
              <p className="text-[#F7E7CE]/45 group-hover:text-[#102C26]/55 text-sm mb-4 leading-relaxed transition-colors duration-300">
                {ch.desc}
              </p>
              <a
                href={`mailto:${ch.email}`}
                className="text-[#F7E7CE]/60 group-hover:text-[#102C26] text-xs font-semibold uppercase tracking-wide break-all transition-colors duration-300 hover:underline"
              >
                {ch.email}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Business Info ────────────────────────────────────────────────── */

function BusinessInfoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const info = [
    { label: "Company Name", value: "HalalMe Delivery Ltd" },
    { label: "Country", value: "United Kingdom" },
    {
      label: "Support Hours",
      value: "Mon–Fri: 9:00 AM – 6:00 PM GMT\nSat–Sun: 10:00 AM – 4:00 PM GMT",
    },
    {
      label: "Response Time",
      value: "We aim to respond within 24 hours during business days",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#F7E7CE] py-24 md:py-32 px-6"
    >
      <div className="max-w-[95vw] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#102C26]/30" />
          <span className="text-[#102C26]/45 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
            Business Information
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#102C26] mb-14"
        >
          Find Us
        </motion.h2>

        {/* Info grid with hairline dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#102C26]/10 mb-14">
          {info.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="bg-[#F7E7CE] p-8"
            >
              <p className="text-[10px] font-bold text-[#102C26]/35 uppercase tracking-[0.25em] mb-2">
                {item.label}
              </p>
              <p className="text-[#102C26]/70 text-base font-medium leading-relaxed whitespace-pre-line">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#102C26]/50 hover:text-[#102C26] text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[8rem] md:text-[14rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/8 select-none pointer-events-none translate-x-6 translate-y-6"
      >
        Contact
      </div>
    </section>
  );
}
