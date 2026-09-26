"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AdminFetchError } from "./_fetch";

/**
 * Admin panel query client.
 *
 * Stage 2 of the work described in ADMIN_TANSTACK_MIGRATION.md. Stage 1 gave the
 * panel a network layer that cannot hang (`_fetch.ts`); this gives it a cache, so
 * pages stop hand-rolling `useState` + `useEffect` + polling for every list.
 *
 * Scope is the admin panel only. The public site (Kitchen, Social) stays on its
 * existing pattern until after launch.
 */

/** Query keys are domain-shaped: ['admin', module, view, params]. */
export const adminKeys = {
  all: ["admin"] as const,
  module: (module: string) => ["admin", module] as const,
  list: (module: string, params: Record<string, unknown>) => ["admin", module, "list", params] as const,
  detail: (module: string, id: string) => ["admin", module, "detail", id] as const,
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Admin data is operational, not second-critical. 30s means moving
        // between pages inside a session mostly reads cache instead of refetching.
        staleTime: 30_000,

        // `_fetch.ts` already enforces a 15s deadline and reports failures, so
        // one retry is enough. Never retry a 4xx: an expired session or a denied
        // permission is a real answer from the server, not a blip, and retrying
        // it just delays showing the admin what happened.
        retry: (failureCount, error) => {
          if (error instanceof AdminFetchError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 1;
        },

        // Coming back to the tab should show current data. This replaces the
        // hand-rolled `window.focus` and `visibilitychange` listeners that each
        // polling surface used to register for itself.
        refetchOnWindowFocus: true,

        // NOTE: `placeholderData: keepPreviousData` is deliberately NOT set here,
        // though ADMIN_TANSTACK_MIGRATION.md originally suggested it as a global
        // default. It is right for paginated lists (page changes should not flash
        // a skeleton) but wrong for detail queries: switching records via the
        // RecordNav stepper would briefly render the previous user's or merchant's
        // details under the new heading. Set it per-query on lists instead.
      },
    },
  });
}

export function AdminQueryProvider({ children }: { children: React.ReactNode }) {
  // Held in state, never constructed at module scope: a module-level client is
  // shared across requests on the server and would leak one admin's cached data
  // into another's render.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
