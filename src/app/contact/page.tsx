'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-24 md:pt-40 md:pb-32 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900">
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-100 text-sm font-medium">Get In Touch</span>
            </motion.div>

            <motion.h1
              className="text-5xl font-extrabold tracking-tight text-white md:text-7xl"
              style={{ fontFamily: 'var(--font-headline)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Contact{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Us
              </span>
            </motion.h1>
            <motion.p
              className="mt-8 text-xl leading-relaxed text-emerald-50/80 md:text-2xl font-normal"
              style={{ fontFamily: 'var(--font-body)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We&apos;re here to help. Reach out for support, partnerships, or general inquiries.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactFormSection />

      {/* Support Channels */}
      <SupportChannelsSection />

      {/* Business Info */}
      <BusinessInfoSection />
    </div>
  );
}

function ContactFormSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ fullName: '', email: '', subject: '', message: '' });

      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Get in Touch
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Send Us a Message
          </h2>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-normal"
                style={{ fontFamily: 'var(--font-body)' }}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-normal"
                style={{ fontFamily: 'var(--font-body)' }}
                placeholder="your.email@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-normal"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <option value="">Select a subject</option>
                <option value="support">Support</option>
                <option value="order">Order Issue</option>
                <option value="partnership">Partnership</option>
                <option value="charity">Charity / Rewards</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none font-normal"
                style={{ fontFamily: 'var(--font-body)' }}
                placeholder="Tell us how we can help..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
                  Message sent successfully! We&apos;ll get back to you soon.
                </p>
              </div>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}

function SupportChannelsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const channels = [
    {
      title: 'General Support',
      email: 'support@halalme.co.uk',
      description: 'For account help, orders, and general questions',
    },
    {
      title: 'Business & Partnerships',
      email: 'partners@halalme.co.uk',
      description: 'For restaurant partnerships and business inquiries',
    },
    {
      title: 'Charity & Rewards',
      email: 'rewards@halalme.co.uk',
      description: 'For charity partnerships and reward program questions',
    },
  ];

  return (
    <section ref={ref} className="px-6 py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Support Channels
          </span>
          <h2 className="text-4xl font-extrabold text-emerald-950 md:text-5xl mb-6" style={{ fontFamily: 'var(--font-headline)' }}>
            Other Ways to Reach Us
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {channels.map((channel, index) => (
            <motion.div
              key={channel.title}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:border-emerald-300 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold text-emerald-950 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                {channel.title}
              </h3>
              <p className="text-slate-600 mb-4 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                {channel.description}
              </p>
              <a
                href={`mailto:${channel.email}`}
                className="text-emerald-600 hover:text-emerald-700 font-semibold break-all"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {channel.email}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessInfoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative overflow-hidden px-6 py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-600/30 to-teal-500/20 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 to-orange-400/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

      <div className="mx-auto max-w-4xl relative z-10">
        <motion.div
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-extrabold text-white mb-8 text-center" style={{ fontFamily: 'var(--font-headline)' }}>
            Business Information
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Company Name
              </h3>
              <p className="text-emerald-100/80 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                HalalMe Ltd
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Country of Operation
              </h3>
              <p className="text-emerald-100/80 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                United Kingdom
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Support Hours
              </h3>
              <p className="text-emerald-100/80 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                Monday - Friday: 9:00 AM - 6:00 PM GMT<br />
                Saturday - Sunday: 10:00 AM - 4:00 PM GMT
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
                Response Time
              </h3>
              <p className="text-emerald-100/80 font-normal" style={{ fontFamily: 'var(--font-body)' }}>
                We aim to respond within 24 hours during business days
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back to Home CTA */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-200/70 hover:text-amber-300 font-semibold transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
