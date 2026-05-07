"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";
import { AuthGateProvider } from "@/context/AuthGateContext";
import { AppResumeProvider } from "@/context/AppResumeContext";

const hideFooterPaths = [
  "/kitchen",
  "/login",
  "/signup",
  "/forgot-password",
  "/dashboard",
  "/profile",
  "/hub",
  "/select-role",
  "/help",
  "/contact",
  "/about",
  "/fresh",
  "/delivery",
  "/travel",
  "/rewards",
];

const hideHeaderPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/dashboard",
  "/profile",
  "/select-role",
  "/kitchen/ai-assistant",
];

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldHideFooter = hideFooterPaths.some((path) => pathname?.startsWith(path));
  const shouldHideHeader = hideHeaderPaths.some((path) => pathname?.startsWith(path));

  return (
    // AuthGateProvider wraps the entire app so any page can call requireAuth().
    // It also renders the single global <AuthModal> - no per-page modal needed.
    <AppResumeProvider>
      <AuthGateProvider>
        <ScrollToTop />
        {!shouldHideHeader && <Header />}
        <main>{children}</main>
        {!shouldHideFooter && <Footer />}
      </AuthGateProvider>
    </AppResumeProvider>
  );
}
