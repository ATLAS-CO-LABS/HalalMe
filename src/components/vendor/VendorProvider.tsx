"use client";

import { createContext, useContext, useState } from "react";
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Vendor } from "@/types/marketplaceVendor";

/** Query keys for the vendor portal: ['vendor', resource, params?]. */
export const vendorKeys = {
  all: ["vendor"] as const,
  me: ["vendor", "me"] as const,
  resource: (name: string, params?: unknown) => (params === undefined ? ["vendor", name] : ["vendor", name, params]) as readonly unknown[],
};

export function VendorQueryProvider({ children }: { children: React.ReactNode }) {
  // Held in state, not module scope, so one visitor's cache is never shared
  // with another's server render. Same reasoning as the admin client.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: true },
        },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const VendorContext = createContext<Vendor | null>(null);

export function VendorContextProvider({ vendor, children }: { vendor: Vendor; children: React.ReactNode }) {
  return <VendorContext.Provider value={vendor}>{children}</VendorContext.Provider>;
}

/** The signed-in vendor. Only usable below the portal layout, which guarantees one exists. */
export function useVendor(): Vendor {
  const vendor = useContext(VendorContext);
  if (!vendor) throw new Error("useVendor must be used inside the vendor portal layout");
  return vendor;
}

/**
 * A write to the vendor's data. Any successful change refreshes every vendor
 * query: the data set is small and one action often touches several screens
 * (shipping an order changes the order, the overview and the earnings).
 */
export function useVendorMutation<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  options: { onSuccess?: (result: TResult, args: TArgs) => void; onError?: (message: string) => void } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: async (result, args) => {
      await queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      options.onSuccess?.(result, args);
    },
    onError: (error) => {
      options.onError?.(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    },
  });
}
