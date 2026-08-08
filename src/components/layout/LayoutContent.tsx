"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/common/ScrollToTop";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import { AuthGateProvider } from "@/context/AuthGateContext";
import { AppResumeProvider } from "@/context/AppResumeContext";
import { RewardsRealtimeProvider } from "@/context/RewardsRealtimeContext";

const hideFooterPaths = [
  "/kitchen",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/complete-profile",
  "/dashboard",
  "/profile",
  "/messages",
  "/social",
  "/select-role",
  "/help",
  "/contact",
  "/partner",
  "/about",
  "/fresh",
  "/delivery",
  "/travel",
  "/rewards",
  "/charity",
  "/admin",
  "/merchant",
];

const hideHeaderPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/complete-profile",
  "/dashboard",
  "/profile",
  "/messages",
  "/select-role",
  "/kitchen/ai-assistant",
  "/partner",
  "/admin",
  "/merchant",
];

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldHideFooter = hideFooterPaths.some((path) => pathname?.startsWith(path));
  const shouldHideHeader = hideHeaderPaths.some((path) => pathname?.startsWith(path));

  return (
    // AuthGateProvider wraps the entire app so any page can call requireAuth().
    // It also renders the single global <AuthModal> - no per-page modal needed.
    <AppResumeProvider>
      <RewardsRealtimeProvider>
        <AuthGateProvider>
          <RouteProgressBar />
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-300 focus:px-4 focus:py-2.5 focus:bg-[#F7E7CE] focus:text-[#102C26] focus:font-extrabold focus:uppercase focus:tracking-tighter focus:text-sm"
          >
            Skip to content
          </a>
          {!shouldHideHeader && <Header />}
          <main id="main-content">{children}</main>
          {!shouldHideFooter && <Footer />}
        </AuthGateProvider>
      </RewardsRealtimeProvider>
    </AppResumeProvider>
  );
}
