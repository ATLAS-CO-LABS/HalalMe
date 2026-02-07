'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 1px 2px 0 rgba(0, 0, 0, 0.03)", "0 4px 12px -2px rgba(0, 0, 0, 0.08)"]
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const isScrollingDown = latest > previous;

    if (latest < 40) {
      setHidden(false);
      return;
    }

    if (isScrollingDown && latest > 120) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/help', label: 'Help' },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [userMenuOpen]);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-120%", opacity: 0.98 }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-6"
    >
      <motion.div
        className="mx-auto max-w-7xl rounded-2xl border border-emerald-200/70 bg-white/90 backdrop-blur-xl"
        style={{ boxShadow: headerShadow }}
      >
        <div className="flex items-center justify-between h-16 px-3 sm:px-6">
          {/* Logo - Left */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2.5 cursor-pointer"
              whileHover={{ opacity: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/logo/logo.png"
                alt="HalalMe Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <span
                className="text-xl font-black text-emerald-900 tracking-tight"
                style={{ fontFamily: 'var(--font-logo)' }}
              >
                HalalMe
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 bg-emerald-50/80 ring-1 ring-emerald-200 rounded-full px-3 py-2"
            >
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  variants={itemVariants}
                  style={{ transform: `translateY(${index % 2 === 0 ? '-2px' : '2px'})` }}
                  whileHover={{ y: -2 }}
                >
                  <Link href={link.href}>
                    <span
                      className={`px-3 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                        pathname?.startsWith(link.href)
                          ? 'text-emerald-950 bg-white ring-1 ring-emerald-300 shadow-sm'
                          : 'text-emerald-700 hover:text-emerald-900 bg-white/70 hover:bg-white'
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {user ? (
              <motion.div variants={itemVariants} className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-emerald-800 font-bold text-sm hover:text-emerald-900 transition-colors bg-emerald-50/70 border border-emerald-200 rounded-full pl-1.5 pr-3 py-1.5"
                >
                  <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="max-w-20 truncate">{user.name}</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-xl ring-1 ring-emerald-100 overflow-hidden"
                    >
                      <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                        <p className="text-xs text-emerald-600">Signed in as</p>
                        <p className="text-sm font-semibold text-emerald-800 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile">
                          <div className="flex items-center px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors">
                            Profile Settings
                          </div>
                        </Link>
                        <Link href="/dashboard">
                          <div className="flex items-center px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 cursor-pointer transition-colors">
                            Dashboard
                          </div>
                        </Link>
                        <hr className="my-1 border-emerald-100" />
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                            router.push('/');
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/login')}
                  className="text-emerald-800 font-bold text-sm hover:text-emerald-950 transition-colors px-3 py-2 rounded-lg border border-emerald-200 bg-white/80"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/select-role')}
                  className="bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-800/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-3 py-2 text-sm font-bold text-emerald-800 rounded-lg border border-emerald-200 bg-emerald-50/70"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/select-role')}
                  className="px-3 py-2 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-emerald-700 to-teal-700"
                >
                  Sign Up
                </button>
              </>
            )}
            {user && (
              <Link href="/dashboard">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t border-emerald-100 bg-white/95 backdrop-blur-sm"
            >
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="px-2 pt-3 pb-4 space-y-1"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.label} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-base font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Auth Section */}
                <motion.div variants={itemVariants} className="pt-3 border-t border-emerald-100 mt-2">
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg mb-2">
                        Signed in as <span className="font-semibold text-emerald-800 block mt-1">{user.email}</span>
                      </div>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-base font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                          router.push('/');
                        }}
                        className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          router.push('/login');
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          router.push('/select-role');
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-full text-base font-bold text-center transition-colors"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>
  );
}
