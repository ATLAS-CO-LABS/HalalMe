'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUpRight } from 'lucide-react';

const serviceLinks = [
  { href: '/delivery', label: 'Delivery', desc: 'Halal food to your door',   num: '01', accent: '#B96AF0' },
  { href: '/kitchen',  label: 'Kitchen',  desc: 'Recipes & AI assistant',    num: '02', accent: '#F03E9E' },
  { href: '/hub',      label: 'Social',   desc: 'Community & sharing',       num: '03', accent: '#F59E0B' },
  { href: '/charity',  label: 'Charity',  desc: 'Give back, verified',       num: '04', accent: '#14B8A6' },
  { href: '/rewards',  label: 'Rewards',  desc: 'Earn points, redeem perks', num: '05', accent: '#FB7185' },
];

const infoLinks = [
  { href: '/about',           label: 'About'         },
  { href: '/contact',         label: 'Contact'       },
  { href: '/help',            label: 'Help'          },
  { href: '/for-restaurants', label: 'For Merchants' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Close everything on navigation - adjust state during render instead of an
  // effect so the menu never paints open on the new route
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setUserMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [userMenuOpen]);

  // Lock page scroll + close on Escape while the menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) return () => { document.body.style.overflow = ''; };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setUserMenuOpen(false);
    setMenuOpen(false);
    await logout();
    setIsLoggingOut(false);
    router.push('/');
  };

  return (
    <>
      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-300 ${
          menuOpen
            ? 'bg-transparent'
            : scrolled
              ? 'bg-[#0A1C19]/96 backdrop-blur-md border-b border-[#F7E7CE]/8'
              : 'bg-transparent'
        }`}
      >
        {/* Soft scrim so the nav stays legible over hero imagery - fades out once scrolled */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#050F0D]/65 via-[#050F0D]/25 to-transparent transition-opacity duration-300 ${
            scrolled || menuOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5">
              <span style={{ position: 'relative', display: 'inline-flex', width: 26, height: 26, flexShrink: 0 }}>
                <span style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: '50%' }} />
                <Image
                  src="/logo/logo.png"
                  alt="HalalMe Logo"
                  width={26}
                  height={26}
                  className="object-contain relative z-10"
                />
              </span>
              <span
                className="text-xl font-black text-[#F7E7CE] tracking-tight"
                style={{ fontFamily: 'var(--font-logo)' }}
              >
                HalalMe
              </span>
            </Link>

            {/* Right cluster: auth + menu trigger */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Auth - desktop */}
              <div className="hidden md:flex items-center gap-2.5">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 text-sm font-semibold text-[#F7E7CE]/70 hover:text-[#F7E7CE] transition-colors pl-1 pr-3 py-1 hover:bg-[#F7E7CE]/8 border border-transparent hover:border-[#F7E7CE]/15"
                    >
                      <div className="h-8 w-8 bg-[#F7E7CE]/15 border border-[#F7E7CE]/25 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#F7E7CE]">
                          {(user.full_name ?? user.username ?? 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="max-w-24 truncate">{user.full_name ?? user.username}</span>
                      <svg
                        className={`h-4 w-4 text-[#F7E7CE]/40 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute right-0 mt-2 w-56 bg-[#102C26] border border-[#F7E7CE]/10 shadow-2xl shadow-black/40 overflow-hidden"
                        >
                          <div className="bg-[#0A1C19] px-4 py-3 border-b border-[#F7E7CE]/8">
                            <p className="text-xs text-[#F7E7CE]/40">Signed in as</p>
                            <p className="text-sm font-semibold text-[#F7E7CE] truncate">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link href="/profile">
                              <div className="px-4 py-2.5 text-sm text-[#F7E7CE]/70 hover:bg-[#F7E7CE]/8 hover:text-[#F7E7CE] cursor-pointer transition-colors">
                                Profile Settings
                              </div>
                            </Link>
                            <Link href="/dashboard">
                              <div className="px-4 py-2.5 text-sm text-[#F7E7CE]/70 hover:bg-[#F7E7CE]/8 hover:text-[#F7E7CE] cursor-pointer transition-colors">
                                Dashboard
                              </div>
                            </Link>
                            <hr className="my-1 border-[#F7E7CE]/8" />
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoggingOut ? 'Logging out…' : 'Logout'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : isLoggingOut ? (
                  <div className="h-8 w-8 bg-[#F7E7CE]/10 border border-[#F7E7CE]/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#F7E7CE]/40 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/login')}
                      className="text-sm font-semibold text-[#F7E7CE]/60 hover:text-[#F7E7CE] px-4 py-2 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => router.push('/select-role')}
                      className="text-sm font-bold text-[#102C26] bg-[#F7E7CE] hover:bg-[#F7E7CE]/90 px-5 py-2.5 transition-colors uppercase tracking-tight"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              {/* Auth - mobile (avatar or sign-up) */}
              <div className="md:hidden flex items-center">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    <div className="h-8 w-8 bg-[#F7E7CE]/15 border border-[#F7E7CE]/25 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#F7E7CE]">
                        {(user.full_name ?? user.username ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ) : isLoggingOut ? (
                  <div className="h-8 w-8 bg-[#F7E7CE]/10 border border-[#F7E7CE]/20 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#F7E7CE]/40 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push('/select-role')}
                    className="text-xs font-bold text-[#102C26] bg-[#F7E7CE] hover:bg-[#F7E7CE]/90 px-3.5 py-2 transition-colors uppercase tracking-tight"
                  >
                    Sign Up
                  </button>
                )}
              </div>

              {/* Menu trigger - morphing lines + label */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="group flex items-center gap-2.5 pl-3 pr-3.5 py-2.5 border border-[#F7E7CE]/15 hover:border-[#F7E7CE]/40 text-[#F7E7CE]/70 hover:text-[#F7E7CE] transition-colors duration-200"
              >
                <span className="relative w-4.5 h-3 flex flex-col justify-between">
                  <motion.span
                    animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="block h-0.5 w-full bg-current origin-center"
                  />
                  <motion.span
                    animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.15 }}
                    className="block h-0.5 w-full bg-current"
                  />
                  <motion.span
                    animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="block h-0.5 w-full bg-current origin-center"
                  />
                </span>
                <span className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.2em] w-9 text-left">
                  {menuOpen ? 'Close' : 'Menu'}
                </span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ─── Full-Screen Navigation Layer ────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE }}
            className="fixed inset-0 z-60 bg-[#0A1C19] overflow-y-auto"
          >
            {/* Faint watermark anchoring the layer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 right-0 font-black leading-none tracking-tighter select-none text-[#F7E7CE]/3 translate-x-[4%] translate-y-[12%]"
              style={{ fontFamily: 'var(--font-logo)', fontSize: 'clamp(8rem, 24vw, 26rem)' }}
            >
              HalalMe
            </div>

            <div className="relative min-h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
              <motion.div
                initial="hidden"
                animate="show"
                exit="exit"
                variants={{
                  show: { transition: { staggerChildren: 0.06, delayChildren: reduce ? 0 : 0.25 } },
                  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
                }}
                className="flex-1 grid lg:grid-cols-12 gap-10 lg:gap-6"
              >
                {/* Services - the main event */}
                <nav className="lg:col-span-8 flex flex-col justify-center" aria-label="Services">
                  <motion.p
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1 },
                      exit: { opacity: 0 },
                    }}
                    className="text-[10px] font-bold text-[#F7E7CE]/30 uppercase tracking-[0.3em] mb-6"
                  >
                    Services
                  </motion.p>
                  <ul>
                    {serviceLinks.map((s) => {
                      const active = pathname?.startsWith(s.href);
                      return (
                        <li key={s.href} className="overflow-hidden border-b border-[#F7E7CE]/8 last:border-b-0">
                          <motion.div
                            variants={{
                              hidden: { y: '105%' },
                              show: { y: 0, transition: { duration: 0.7, ease: EASE } },
                              exit: { y: '105%', transition: { duration: 0.25, ease: 'easeIn' } },
                            }}
                          >
                            <Link
                              href={s.href}
                              className="group flex items-baseline gap-4 sm:gap-6 py-3 sm:py-4"
                              onMouseEnter={(e) => {
                                const name = e.currentTarget.querySelector<HTMLElement>('.nav-name');
                                if (name) name.style.color = s.accent;
                              }}
                              onMouseLeave={(e) => {
                                const name = e.currentTarget.querySelector<HTMLElement>('.nav-name');
                                if (name) name.style.color = active ? s.accent : '';
                              }}
                            >
                              <span
                                className="text-[10px] sm:text-xs font-bold tracking-[0.25em] shrink-0"
                                style={{ color: active ? s.accent : 'rgba(247,231,206,0.3)' }}
                              >
                                {s.num}
                              </span>
                              <span
                                className="nav-name font-extrabold uppercase tracking-tighter leading-[0.95] transition-all duration-300 group-hover:translate-x-2 text-[#F7E7CE]"
                                style={{
                                  fontSize: 'clamp(2.2rem, 6.5vw, 4.75rem)',
                                  color: active ? s.accent : undefined,
                                }}
                              >
                                {s.label}
                              </span>
                              <span className="hidden md:flex items-center gap-2 ml-auto text-[10px] uppercase tracking-[0.2em] text-[#F7E7CE]/30 group-hover:text-[#F7E7CE]/60 transition-colors duration-300 shrink-0">
                                {s.desc}
                                <ArrowUpRight
                                  className="w-3.5 h-3.5 opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
                                  style={{ color: s.accent }}
                                />
                              </span>
                            </Link>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Info + account column */}
                <div className="lg:col-span-4 flex flex-col justify-center gap-10 lg:pl-10 lg:border-l lg:border-[#F7E7CE]/8">
                  <div>
                    <motion.p
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1 },
                        exit: { opacity: 0 },
                      }}
                      className="text-[10px] font-bold text-[#F7E7CE]/30 uppercase tracking-[0.3em] mb-5"
                    >
                      Company
                    </motion.p>
                    <ul className="space-y-1">
                      {infoLinks.map((link) => {
                        const active = pathname?.startsWith(link.href);
                        return (
                          <li key={link.href} className="overflow-hidden">
                            <motion.div
                              variants={{
                                hidden: { y: '110%' },
                                show: { y: 0, transition: { duration: 0.55, ease: EASE } },
                                exit: { y: '110%', transition: { duration: 0.2, ease: 'easeIn' } },
                              }}
                            >
                              <Link
                                href={link.href}
                                className={`group flex items-center gap-3 py-1.5 text-lg font-bold uppercase tracking-tight transition-colors duration-200 ${
                                  active ? 'text-[#F59E0B]' : 'text-[#F7E7CE]/55 hover:text-[#F7E7CE]'
                                }`}
                              >
                                <span
                                  className={`h-px bg-[#F59E0B] transition-all duration-300 ${active ? 'w-5' : 'w-0 group-hover:w-5'}`}
                                />
                                {link.label}
                              </Link>
                            </motion.div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Account block */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                      exit: { opacity: 0, transition: { duration: 0.15 } },
                    }}
                  >
                    {user ? (
                      <div className="border border-[#F7E7CE]/10 p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 bg-[#F7E7CE]/15 border border-[#F7E7CE]/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-[#F7E7CE]">
                              {(user.full_name ?? user.username ?? 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#F7E7CE] truncate">{user.full_name ?? user.username}</p>
                            <p className="text-xs text-[#F7E7CE]/40 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href="/dashboard"
                            className="flex-1 text-center text-xs font-bold text-[#102C26] bg-[#F7E7CE] hover:bg-[#F7E7CE]/90 py-2.5 transition-colors uppercase tracking-tight"
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex-1 text-center text-xs font-semibold text-red-400 py-2.5 border border-red-900/40 hover:bg-red-900/20 transition-colors uppercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoggingOut ? 'Logging out…' : 'Logout'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <button
                          onClick={() => { setMenuOpen(false); router.push('/select-role'); }}
                          className="w-full text-sm font-bold text-[#102C26] bg-[#F7E7CE] hover:bg-[#F7E7CE]/90 py-3 transition-colors uppercase tracking-tight"
                        >
                          Create Free Account
                        </button>
                        <button
                          onClick={() => { setMenuOpen(false); router.push('/login'); }}
                          className="w-full text-sm font-semibold text-[#F7E7CE]/60 hover:text-[#F7E7CE] py-3 border border-[#F7E7CE]/15 hover:border-[#F7E7CE]/30 hover:bg-[#F7E7CE]/5 transition-colors"
                        >
                          Log in
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Menu footer strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.55, duration: 0.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="mt-10 pt-5 border-t border-[#F7E7CE]/8 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-[#F7E7CE]/25"
              >
                <span>© {new Date().getFullYear()} HalalMe</span>
                <span>Five services. One account.</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
