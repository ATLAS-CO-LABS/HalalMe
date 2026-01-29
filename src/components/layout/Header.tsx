'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const { scrollY } = useScroll();

  // Track scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(17, 24, 39, 0.95)", "rgba(17, 24, 39, 0.98)"]
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 1px 3px 0 rgba(0, 0, 0, 0.3)", "0 4px 12px -2px rgba(0, 0, 0, 0.5)"]
  );

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-gray-800/50"
      style={{ backgroundColor: headerBg, boxShadow: headerShadow }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo/logo.png"
                alt="HalalMe Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <span
                className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 bg-clip-text text-transparent"
                style={{ fontFamily: 'var(--font-logo)' }}
              >
                HalalMe
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-gray-300">
            <motion.a
              href="/#delivery"
              whileHover={{ scale: 1.05, color: "#c084fc" }}
              className="transition-colors hover:text-purple-400"
            >
              Delivery
            </motion.a>
            <Link href="/kitchen">
              <motion.span
                whileHover={{ scale: 1.05, color: "#f9a8d4" }}
                className="transition-colors cursor-pointer hover:text-pink-400"
              >
                Kitchen
              </motion.span>
            </Link>
            <motion.a
              href="/#fresh"
              whileHover={{ scale: 1.05, color: "#6ee7b7" }}
              className="transition-colors hover:text-emerald-400"
            >
              Fresh
            </motion.a>
            <Link href="/hub">
              <motion.span
                whileHover={{ scale: 1.05, color: "#c084fc" }}
                className="transition-colors cursor-pointer hover:text-purple-400"
              >
                Hub
              </motion.span>
            </Link>
            <Link href="/travel">
              <motion.span
                whileHover={{ scale: 1.05, color: "#7dd3fc" }}
                className="transition-colors cursor-pointer hover:text-sky-400"
              >
                Travel
              </motion.span>
            </Link>
            <Link href="/rewards">
              <motion.span
                whileHover={{ scale: 1.05, color: "#5eead4" }}
                className="transition-colors cursor-pointer hover:text-teal-400"
              >
                Rewards
              </motion.span>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {/* User Menu Dropdown */}
                <div className="relative">
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.6)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="h-6 w-6 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="max-w-25 truncate">{user.name}</span>
                    <motion.svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ rotate: userMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-gray-800 shadow-2xl ring-1 ring-gray-700 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-white">
                          <p className="text-xs opacity-90">Signed in as</p>
                          <p className="text-sm font-semibold truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/profile">
                            <div className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
                              <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile Settings
                            </div>
                          </Link>
                          <Link href="/dashboard">
                            <div className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
                              <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                              </svg>
                              Dashboard
                            </div>
                          </Link>
                          <hr className="my-1 border-gray-700" />
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                              router.push('/');
                            }}
                            className="flex w-full items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                          >
                            <svg className="mr-3 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => router.push('/login')}
                  className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => router.push('/select-role')}
                  className="rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.6)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            {user && (
              <Link href="/dashboard">
                <motion.div
                  className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </motion.div>
              </Link>
            )}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-gray-800"
            >
              <div className="px-2 pt-2 pb-4 space-y-1">
                {/* Mobile Navigation Links */}
                <a href="/#delivery" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  Delivery
                </a>
                <Link href="/kitchen" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  Kitchen
                </Link>
                <a href="/#fresh" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  Fresh
                </a>
                <Link href="/hub" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  Hub
                </Link>
                <Link href="/travel" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  Travel
                </Link>
                <Link href="/rewards" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                  Rewards
                </Link>

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-gray-800 mt-2">
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-400 bg-gray-800 rounded-lg mb-2">
                        Signed in as <span className="font-medium text-gray-200 block mt-1">{user.email}</span>
                      </div>
                      <Link href="/dashboard" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/profile" className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                          router.push('/');
                        }}
                        className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:bg-red-900/20 transition-colors"
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
                        className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          router.push('/select-role');
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full mt-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-base font-medium text-white text-center shadow-lg"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
