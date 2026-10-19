"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { VendorContextProvider, VendorQueryProvider, vendorKeys } from "@/components/vendor/VendorProvider";
import VendorShell from "@/components/vendor/VendorShell";
import OnboardingStage from "@/components/vendor/OnboardingStage";
import DemoBar from "@/components/vendor/DemoBar";
import { LoadError } from "@/components/vendor/ui";

// One portal, two stages. Until a vendor is approved every /vendor URL shows
// onboarding; once they are active the same URLs show the dashboard.
//
// PREVIEW: the "signed-in vendor" comes from the browser-only mock session.
// When the backend lands this gate should mirror (merchant)/merchant/layout:
// require a Supabase session, then look up the vendor row for that user.
function VendorGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: vendor, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.me,
    queryFn: () => vendorService.getMyVendor(),
  });

  const notAVendor = !isLoading && !isError && vendor === null;
  useEffect(() => {
    if (notAVendor) router.replace("/partner/vendor");
  }, [notAVendor, router]);

  if (isError) {
    return (
      <div className="min-h-dvh bg-[#F3E9D6] flex items-center justify-center">
        <LoadError message="We could not load your vendor account." onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0e2420]">
        <Loader2 className="h-6 w-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  const banner = <DemoBar currentVendorId={vendor.id} />;

  return (
    // Keyed by vendor so forms and filters reset when the sample account is switched.
    <VendorContextProvider vendor={vendor} key={vendor.id}>
      {vendor.status === "active" ? <VendorShell banner={banner}>{children}</VendorShell> : <OnboardingStage banner={banner} />}
    </VendorContextProvider>
  );
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <VendorQueryProvider>
      <VendorGate>{children}</VendorGate>
    </VendorQueryProvider>
  );
}
