'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages where footer should be hidden
  const hideFooterPaths = [
    '/kitchen',
    '/login',
    '/signup',
    '/forgot-password',
    '/dashboard',
    '/profile',
    '/hub',
  ];

  // Pages where header should be hidden
  const hideHeaderPaths = [
    '/hub',
  ];

  const shouldHideFooter = hideFooterPaths.some(path => pathname?.startsWith(path));
  const shouldHideHeader = hideHeaderPaths.some(path => pathname?.startsWith(path));

  return (
    <>
      {!shouldHideHeader && <Header />}
      <main>{children}</main>
      {!shouldHideFooter && <Footer />}
    </>
  );
}
