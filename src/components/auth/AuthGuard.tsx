"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Enforce profile completion — username is required
    if (!user.username && pathname !== "/complete-profile") {
      router.push("/complete-profile");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1C19]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F59E0B] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[#F7E7CE]/50">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Temporarily render nothing while redirecting to complete-profile
  if (!user.username && pathname !== "/complete-profile") return null;

  return <>{children}</>;
}
