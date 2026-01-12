"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login with the current path as redirect parameter
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render children (will redirect in useEffect)
  if (!user) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
