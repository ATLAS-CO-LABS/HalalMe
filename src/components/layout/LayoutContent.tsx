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
  "/complete-profile",
  "/dashboard",
  "/profile",
  "/messages",
  "/hub",
  "/select-role",
  "/help",
  "/contact",
  "/partner",
  "/about",
  "/fresh",
  "/delivery",
  "/travel",
  "/rewards",
  "/admin",
  "/merchant",
];

const hideHeaderPaths = [
  "/login",
  "/signup",
  "/forgot-password",
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
          {!shouldHideHeader && <Header />}
          <main>{children}</main>
          {!shouldHideFooter && <Footer />}
        </AuthGateProvider>
      </RewardsRealtimeProvider>
    </AppResumeProvider>
  );
}
