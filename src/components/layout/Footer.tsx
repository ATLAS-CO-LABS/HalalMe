'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

const services = [
  { label: 'Delivery', href: '/delivery' },
  { label: 'Kitchen',  href: '/kitchen'  },
  { label: 'Hub',      href: '/hub'      },
  { label: 'Rewards',  href: '/rewards'  },
];

const companyLinks = [
  { label: 'About',            href: '/about'            },
  { label: 'For Restaurants',  href: '/for-restaurants'  },
  { label: 'Blog',             href: '/blog'             },
  { label: 'Careers',          href: '/careers'          },
  { label: 'Help',             href: '/help'             },
  { label: 'Contact',          href: '/contact'          },
];

const legalLinks = [
  { label: 'Privacy Policy',   href: '/privacy'  },
  { label: 'Terms of Service', href: '/terms'    },
  { label: 'Cookie Policy',    href: '/cookies'  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0A1C19]">

      {/* ── Trust Strip ──────────────────────────────────────── */}
      <div className="border-b border-[#F7E7CE]/8">
        <div className="mx-auto max-w-[95vw] px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#F7E7CE]/8">
          {[
            { num: '01', title: 'Halal Certified',   body: 'Every partner and product is scholar-reviewed and certified.' },
            { num: '02', title: 'Scholar Verified',  body: 'Our standards are set and audited by qualified Islamic scholars.' },
            { num: '03', title: 'Community First',   body: 'Built by Muslims, for Muslims - recommendations from real people.' },
            { num: '04', title: 'One Account',       body: 'Your profile, rewards, and history unified across all services.' },
          ].map((item) => (
            <div key={item.num} className="relative px-6 py-8 overflow-hidden">
              <span aria-hidden="true" className="absolute -bottom-2 -right-1 text-[4rem] font-extrabold text-[#F7E7CE]/[0.04] leading-none select-none pointer-events-none">
                {item.num}
              </span>
              <p className="text-[9px] font-bold text-[#F59E0B] uppercase tracking-[0.25em] mb-2">{item.num}</p>
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#F7E7CE]/80 mb-2">{item.title}</h3>
              <p className="text-xs text-[#F7E7CE]/35 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Footer Grid ──────────────────────────────────── */}
      <div className="mx-auto max-w-[95vw] px-6 pt-14 pb-8">
        <div className="grid gap-10 lg:grid-cols-12">

          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span style={{ position: "relative", display: "inline-flex", width: 36, height: 36, flexShrink: 0 }}>
                <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                <Image src="/logo/logo.png" alt="HalalMe Logo" width={36} height={36} className="object-contain relative z-10" />
              </span>
              <span
                className="text-2xl font-black text-[#F7E7CE]"
                style={{ fontFamily: 'var(--font-logo)' }}
              >
                HalalMe
              </span>
            </Link>
            <p className="text-[#F7E7CE]/45 text-sm leading-relaxed max-w-xs">
              The complete Halal ecosystem - food, travel, community, and more. Built for Muslims, trusted worldwide.
            </p>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-[#F7E7CE]/6 border border-[#F7E7CE]/12 px-4 py-2 w-fit">
              <span className="text-[#F7E7CE]/60 text-xs">☪</span>
              <span className="text-[#F7E7CE]/60 text-xs font-semibold uppercase tracking-wide">Scholar Verified Platform</span>
            </div>
            {/* Social Icons */}
            <div className="flex gap-2.5">
              {[
                {
                  name: 'Twitter',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  ),
                },
                {
                  name: 'Instagram',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  ),
                },
                {
                  name: 'Facebook',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 bg-[#F7E7CE]/6 border border-[#F7E7CE]/10 hover:bg-[#F7E7CE] text-[#F7E7CE]/50 hover:text-[#102C26] flex items-center justify-center transition-all duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="text-[10px] font-bold text-[#F7E7CE]/30 uppercase tracking-[0.25em] mb-5">Our Services</h3>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-[#F7E7CE]/50 hover:text-[#F7E7CE] text-sm transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-bold text-[#F7E7CE]/30 uppercase tracking-[0.25em] mb-5">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[#F7E7CE]/50 hover:text-[#F7E7CE] text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3 className="text-[10px] font-bold text-[#F7E7CE]/30 uppercase tracking-[0.25em] mb-5">Stay in the loop</h3>
            <div className="bg-[#102C26] border border-[#F7E7CE]/8 p-5">
              <p className="text-[#F7E7CE]/70 text-sm font-medium mb-1">Halal updates, straight to you.</p>
              <p className="text-[#F7E7CE]/35 text-xs mb-5 leading-relaxed">
                New features, community stories & Halal living tips.
              </p>
              <form className="flex flex-col gap-2.5">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-[#0A1C19] border border-[#F7E7CE]/12 text-sm text-[#F7E7CE] placeholder-[#F7E7CE]/25 focus:outline-none focus:border-[#F7E7CE]/35 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-4 py-2.5 bg-[#F7E7CE] text-[#102C26] text-sm font-bold uppercase tracking-tight hover:bg-[#F7E7CE]/90 transition-colors"
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>

        </div>

        {/* ── Disclaimer ───────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-[#F7E7CE]/8">
          <p className="text-[#F7E7CE]/25 text-[11px] leading-relaxed max-w-4xl">
            <span className="font-semibold text-[#F7E7CE]/35 uppercase tracking-wide">Disclaimer: </span>
            HalalMe endeavours to ensure all listed restaurants, products, and services meet halal standards. However, we cannot guarantee the halal status of every item at all times. Users are encouraged to verify independently where required. HalalMe is not a halal certification body. All charity donations are processed through verified third-party partners. HalalMe is not responsible for the actions of independent vendors or third-party service providers. By using our platform, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-[#F7E7CE]/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#F7E7CE]/25 text-xs">
            © {currentYear} HalalMe. Built with trust, technology &amp; purpose.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-[#F7E7CE]/25 hover:text-[#F7E7CE]/55 text-xs transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[#F7E7CE]/25 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            All systems operational
          </div>
        </div>

      </div>
    </footer>
  );
}
