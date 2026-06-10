"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { merchantService } from "@/services/merchantService";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Not signed in → send to login, preserving the destination.
    if (!user) {
      router.replace("/login?redirect=/merchant");
      return;
    }

    let active = true;
    (async () => {
      try {
        const merchant = await merchantService.getMyMerchant();
        if (!active) return;
        if (!merchant) {
          // Signed in but not a merchant → offer the partner path.
          router.replace("/select-role");
          return;
        }
        setAllowed(true);
      } catch {
        if (active) router.replace("/select-role");
      } finally {
        if (active) setChecking(false);
      }
    })();

    return () => { active = false; };
  }, [user, isLoading, router]);

  if (isLoading || checking || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#102C26]">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  return <>{children}</>;
}
