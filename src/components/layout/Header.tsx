'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const serviceLinks = [
  { href: '/delivery', label: 'Delivery', desc: 'Halal food to your door', color: 'bg-red-500' },
  { href: '/fresh', label: 'Fresh', desc: 'Chef-prepared meals', color: 'bg-lime-500' },
  { href: '/kitchen', label: 'Kitchen', desc: 'Recipes & AI assistant', color: 'bg-fuchsia-500' },
  { href: '/hub', label: 'Hub', desc: 'Community & sharing', color: 'bg-amber-500' },
  { href: '/travel', label: 'Travel', desc: 'Flights, hotels & cars', color: 'bg-sky-500' },
  { href: '/rewards', label: 'Rewards', desc: 'Give back, get rewarded', color: 'bg-emerald-500' },
  { href: '/marketplace', label: 'Marketplace', desc: 'Halal products & essentials', color: 'bg-indigo-600' },
];

const infoLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/help', label: 'Help' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isServiceActive = serviceLinks.some((s) => pathname?.startsWith(s.href));

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
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

  // Lock body scroll when mobile menu is open
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
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100/60'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ─── Mobile: Hamburger (left) ─── */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
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
              <Image
                src="/logo/logo.png"
                alt="HalalMe Logo"
                width={34}
                height={34}
                className="object-contain"
              />
              <span
                className="text-xl font-black text-emerald-900 tracking-tight"
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
                  className={`relative flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isServiceActive || servicesOpen
                      ? 'text-emerald-900 bg-emerald-50'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/60'
                  }`}
                >
                  Services
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {isServiceActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-1/2 -translate-x-1/2 mt-1 w-[340px] rounded-2xl bg-white shadow-xl shadow-gray-200/60 ring-1 ring-gray-100 overflow-hidden p-2"
                    >
                      <div className="grid grid-cols-2 gap-1">
                        {serviceLinks.map((service) => {
                          const active = pathname?.startsWith(service.href);
                          return (
                            <Link key={service.href} href={service.href}>
                              <div
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                                  active
                                    ? 'bg-emerald-50 text-emerald-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${service.color} shrink-0`} />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold leading-tight">{service.label}</p>
                                  <p className="text-[11px] text-gray-400 leading-tight mt-0.5 truncate">{service.desc}</p>
                                </div>
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
                      className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'text-emerald-900 bg-emerald-50'
                          : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/60'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-600 rounded-full" />
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
                    className="flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-900 transition-colors rounded-full pl-1 pr-3 py-1 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="max-w-24 truncate">{user.name}</span>
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-gray-200/60 overflow-hidden"
                      >
                        <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100/50">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-semibold text-emerald-800 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/profile">
                            <div className="px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer transition-colors">
                              Profile Settings
                            </div>
                          </Link>
                          <Link href="/dashboard">
                            <div className="px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer transition-colors">
                              Dashboard
                            </div>
                          </Link>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                              router.push('/');
                            }}
                            className="flex w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-sm font-semibold text-gray-600 hover:text-emerald-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => router.push('/select-role')}
                    className="text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 rounded-full transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* ─── Mobile: Auth avatar or placeholder (right) ─── */}
            <div className="md:hidden flex items-center">
              {user ? (
                <Link href="/dashboard">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => router.push('/select-role')}
                  className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-full transition-colors"
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl md:hidden flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <Image
                    src="/logo/logo.png"
                    alt="HalalMe Logo"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                  <span className="text-lg font-black text-emerald-900" style={{ fontFamily: 'var(--font-logo)' }}>
                    HalalMe
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {/* Services section */}
                <p className="px-4 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Services</p>
                <div className="space-y-0.5 mb-5">
                  {serviceLinks.map((link, i) => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.03, duration: 0.25 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                            isActive
                              ? 'text-emerald-900 bg-emerald-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${link.color} shrink-0`} />
                          {link.label}
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Info section */}
                <p className="px-4 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Info</p>
                <div className="space-y-0.5">
                  {infoLinks.map((link, i) => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.03, duration: 0.25 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                            isActive
                              ? 'text-emerald-900 bg-emerald-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-800'
                          }`}
                        >
                          {link.label}
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Panel footer — auth */}
              <div className="px-4 py-5 border-t border-gray-100">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 text-center text-sm font-semibold text-emerald-700 py-2.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                          router.push('/');
                        }}
                        className="flex-1 text-center text-sm font-semibold text-red-600 py-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        router.push('/select-role');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 py-3 rounded-full transition-colors"
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => {
                        router.push('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-sm font-semibold text-gray-600 hover:text-emerald-800 py-3 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
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
