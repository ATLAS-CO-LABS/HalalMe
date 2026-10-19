"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { VENDOR_STATUS } from "@/lib/vendorOnboarding";
import { vendorKeys } from "@/components/vendor/VendorProvider";

/**
 * Strip shown across the vendor portal while it runs on sample data. It makes
 * clear that nothing is saved to a server, and lets a reviewer step into each
 * vendor's account to see every stage. Remove it with the mock store.
 */
export default function DemoBar({ currentVendorId }: { currentVendorId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: options = [] } = useQuery({
    queryKey: vendorKeys.resource("demo-options"),
    queryFn: async () => vendorService.demoVendorOptions(),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    router.push("/vendor");
  };

  return (
    <div className="bg-[#F59E0B]/15 border-b border-[#F59E0B]/40 px-4 sm:px-8 py-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#7C4A03]">
      <span className="flex items-center gap-2 font-semibold">
        <FlaskConical size={14} className="shrink-0" />
        Preview with sample data. Changes are saved in this browser only.
      </span>
      <span className="flex items-center gap-2 sm:ml-auto">
        <label htmlFor="demo-vendor" className="font-semibold whitespace-nowrap">
          Viewing as
        </label>
        <select
          id="demo-vendor"
          value={currentVendorId}
          onChange={(e) => {
            vendorService.demoSignInAs(e.target.value);
            void refresh();
          }}
          className="h-7 px-2 bg-white border border-[#F59E0B]/50 text-xs text-gray-900 max-w-56"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({VENDOR_STATUS[o.status].label})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            vendorService.demoReset();
            void refresh();
          }}
          className="h-7 px-2.5 font-bold uppercase tracking-wide border border-[#7C4A03]/30 hover:bg-[#F59E0B]/20 transition-colors"
        >
          Reset
        </button>
      </span>
    </div>
  );
}
