'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const serviceLinks = [
  { href: '/delivery', label: 'Delivery', desc: 'Halal food to your door'    },
  { href: '/kitchen',  label: 'Kitchen',  desc: 'Recipes & AI assistant'     },
  { href: '/hub',      label: 'Social',   desc: 'Community & sharing'        },
  { href: '/rewards',  label: 'Rewards',  desc: 'Give back, get rewarded'    },
];

const infoLinks = [
  { href: '/about',   label: 'About'   },
  { href: '/contact', label: 'Contact' },
  { href: '/help',    label: 'Help'    },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isServiceActive = serviceLinks.some((s) => pathname?.startsWith(s.href));

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 150);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A1C19]/96 backdrop-blur-md border-b border-[#F7E7CE]/8'
            : 'bg-[#102C26]/80 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ─── Mobile: Hamburger (left) ─── */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-[#F7E7CE]/70 hover:text-[#F7E7CE] transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* ─── Logo ─── */}
            <Link href="/" className="flex items-center gap-2.5 md:flex-none">
              <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
                <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
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

            {/* ─── Desktop Navigation ─── */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Services Dropdown */}
              <div
                ref={servicesRef}
                className="relative"
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <button
                  className={`relative flex items-center gap-1 px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                    isServiceActive || servicesOpen
                      ? 'text-[#F7E7CE] bg-[#F7E7CE]/10'
                      : 'text-[#F7E7CE]/60 hover:text-[#F7E7CE] hover:bg-[#F7E7CE]/8'
                  }`}
                >
                  Services
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {isServiceActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#F59E0B]" />
                  )}
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-1/2 -translate-x-1/2 mt-1 w-[340px] bg-[#102C26] border border-[#F7E7CE]/10 shadow-2xl shadow-black/40 overflow-hidden p-2"
                    >
                      <div className="grid grid-cols-2 gap-px bg-[#F7E7CE]/8">
                        {serviceLinks.map((service) => {
                          const active = pathname?.startsWith(service.href);
                          return (
                            <Link key={service.href} href={service.href}>
                              <div
                                className={`flex flex-col gap-0.5 px-3 py-2.5 transition-all duration-150 ${
                                  active
                                    ? 'bg-[#F7E7CE] text-[#102C26]'
                                    : 'bg-[#102C26] text-[#F7E7CE]/70 hover:bg-[#F7E7CE]/8 hover:text-[#F7E7CE]'
                                }`}
                              >
                                <p className="text-sm font-bold uppercase tracking-tight leading-tight">
                                  {service.label}
                                </p>
                                <p className={`text-[11px] leading-tight ${active ? 'text-[#102C26]/60' : 'text-[#F7E7CE]/40'}`}>
                                  {service.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Info links */}
              {infoLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href}>
                    <span
                      className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'text-[#F7E7CE] bg-[#F7E7CE]/10'
                          : 'text-[#F7E7CE]/60 hover:text-[#F7E7CE] hover:bg-[#F7E7CE]/8'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#F59E0B]" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* ─── Desktop Auth ─── */}
            <div className="hidden md:flex items-center gap-2.5">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#F7E7CE]/70 hover:text-[#F7E7CE] transition-colors pl-1 pr-3 py-1 hover:bg-[#F7E7CE]/8 border border-transparent hover:border-[#F7E7CE]/15"
                  >
                    <div className="h-8 w-8 bg-[#F7E7CE]/15 border border-[#F7E7CE]/25 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#F7E7CE]">
                        {(user.full_name ?? user.username ?? "U").charAt(0).toUpperCase()}
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
                            onClick={async () => { setIsLoggingOut(true); setUserMenuOpen(false); await logout(); setIsLoggingOut(false); router.push('/'); }}
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
                /* Avatar slot while signOut network call completes in background */
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

            {/* ─── Mobile: Auth (right) ─── */}
            <div className="md:hidden flex items-center">
              {user ? (
                <Link href="/dashboard">
                  <div className="h-8 w-8 bg-[#F7E7CE]/15 border border-[#F7E7CE]/25 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#F7E7CE]">
                      {(user.full_name ?? user.username ?? "U").charAt(0).toUpperCase()}
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
                  className="text-xs font-bold text-[#102C26] bg-[#F7E7CE] hover:bg-[#F7E7CE]/90 px-4 py-2 transition-colors uppercase tracking-tight"
                >
                  Sign Up
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-Over Menu ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-[#102C26] border-r border-[#F7E7CE]/10 shadow-2xl md:hidden flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-[#F7E7CE]/10">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <span style={{ position: "relative", display: "inline-flex", width: 22, height: 22, flexShrink: 0 }}>
                    <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                    <Image src="/logo/logo.png" alt="HalalMe Logo" width={22} height={22} className="object-contain relative z-10" />
                  </span>
                  <span className="text-lg font-black text-[#F7E7CE]" style={{ fontFamily: 'var(--font-logo)' }}>
                    HalalMe
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-[#F7E7CE]/40 hover:text-[#F7E7CE] transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto">
                {/* Brand strip */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06, duration: 0.28 }}
                  className="mx-3 mt-3 mb-4 bg-[#0A1C19] border border-[#F7E7CE]/8 px-4 py-3"
                >
                  <p className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-widest mb-0.5">HalalMe</p>
                  <p className="text-[#F7E7CE] text-sm font-bold leading-snug">Four services.<br />One account.</p>
                </motion.div>

                {/* Services */}
                <div className="px-3 mb-4">
                  <p className="px-1 pb-2.5 text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-widest">Services</p>
                  <div className="grid grid-cols-2 gap-px bg-[#F7E7CE]/8">
                    {serviceLinks.map((link, i) => {
                      const isActive = pathname?.startsWith(link.href);
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.08 + i * 0.04, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>
                            <motion.div
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className={`flex flex-col gap-0.5 p-3 transition-colors ${
                                isActive
                                  ? 'bg-[#F7E7CE] text-[#102C26]'
                                  : 'bg-[#102C26] text-[#F7E7CE]/70 hover:bg-[#F7E7CE]/8 hover:text-[#F7E7CE]'
                              }`}
                            >
                              <p className={`text-[13px] font-bold uppercase tracking-tight leading-tight`}>
                                {link.label}
                              </p>
                              <p className={`text-[10px] leading-tight ${isActive ? 'text-[#102C26]/55' : 'text-[#F7E7CE]/40'}`}>
                                {link.desc}
                              </p>
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Info links */}
                <div className="px-3 pb-4">
                  <p className="px-1 pb-2.5 text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-widest">Info</p>
                  <div className="flex flex-wrap gap-2">
                    {infoLinks.map((link, i) => {
                      const isActive = pathname?.startsWith(link.href);
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.38 + i * 0.05, duration: 0.22 }}
                        >
                          <Link href={link.href} onClick={() => setMobileMenuOpen(false)}>
                            <motion.div
                              whileTap={{ scale: 0.92 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className={`px-4 py-2 text-sm font-semibold border uppercase tracking-tight transition-colors ${
                                isActive
                                  ? 'bg-[#F7E7CE] text-[#102C26] border-[#F7E7CE]'
                                  : 'bg-transparent text-[#F7E7CE]/60 border-[#F7E7CE]/15 hover:text-[#F7E7CE] hover:border-[#F7E7CE]/30'
                              }`}
                            >
                              {link.label}
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </nav>

              {/* Panel footer */}
              <div className="px-4 py-5 border-t border-[#F7E7CE]/10">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="h-10 w-10 bg-[#F7E7CE]/15 border border-[#F7E7CE]/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-[#F7E7CE]">{(user.full_name ?? user.username ?? "U").charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#F7E7CE] truncate">{user.full_name ?? user.username}</p>
                        <p className="text-xs text-[#F7E7CE]/40 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center text-sm font-semibold text-[#F7E7CE]/70 py-2.5 border border-[#F7E7CE]/15 hover:bg-[#F7E7CE]/8 hover:text-[#F7E7CE] transition-colors uppercase tracking-tight"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => { setIsLoggingOut(true); setMobileMenuOpen(false); await logout(); setIsLoggingOut(false); router.push('/'); }}
                        disabled={isLoggingOut}
                        className="flex-1 text-center text-sm font-semibold text-red-400 py-2.5 border border-red-900/40 hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? 'Logging out…' : 'Logout'}
                      </button>
                    </div>
                  </div>
                ) : isLoggingOut ? (
                  /* Signing-out state in mobile panel */
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="h-10 w-10 bg-[#F7E7CE]/10 border border-[#F7E7CE]/15 flex items-center justify-center shrink-0">
                      <svg className="h-5 w-5 text-[#F7E7CE]/40 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#F7E7CE]/40">Logging out…</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => { router.push('/select-role'); setMobileMenuOpen(false); }}
                      className="w-full text-sm font-bold text-[#102C26] bg-[#F7E7CE] hover:bg-[#F7E7CE]/90 py-3 transition-colors uppercase tracking-tight"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                      className="w-full text-sm font-semibold text-[#F7E7CE]/60 hover:text-[#F7E7CE] py-3 border border-[#F7E7CE]/15 hover:border-[#F7E7CE]/30 hover:bg-[#F7E7CE]/5 transition-colors"
                    >
                      Log in
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
