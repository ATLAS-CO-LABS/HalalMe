"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { adminKeys } from "../_query";
import { useAdmin } from "../AdminProvider";

/** Query key for a Marketplace admin view: ['admin', 'marketplace', 'list', { view, ...params }]. */
export const marketplaceKey = (view: string, params: Record<string, unknown> = {}) =>
  adminKeys.list("marketplace", { view, ...params });

/**
 * A Marketplace admin write. Every decision can change several views at once
 * (approving a vendor moves the overview counts, the vendor list and the
 * vendor's own page), so a success refreshes the whole module.
 */
export function useMarketplaceMutation<TArgs, TResult>(
  action: (args: TArgs) => Promise<TResult>,
  options: { onSuccess?: (result: TResult, args: TArgs) => void; onError?: (message: string) => void } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: async (result, args) => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.module("marketplace") });
      options.onSuccess?.(result, args);
    },
    onError: (error) => {
      options.onError?.(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    },
  });
}

/**
 * Whether the signed-in admin may change Marketplace data.
 *
 * PREVIEW: there is no `marketplace` permission module yet (it needs a
 * migration alongside the other admin_permissions keys), so this borrows the
 * Merchants permission, the closest existing one. Swap to
 * `can("marketplace", "manage")` when the module is added.
 */
export function useCanManageMarketplace(): boolean {
  const { can, isSuper } = useAdmin();
  return isSuper || can("merchants", "manage");
}

/** Strip making it plain that these screens run on sample data for now. */
export function PreviewNote() {
  return (
    <div className="bg-[#F59E0B]/15 border-b border-[#F59E0B]/40 px-4 sm:px-8 py-2 flex items-center gap-2 text-xs font-semibold text-[#7C4A03]">
      <FlaskConical size={14} className="shrink-0" />
      Preview with sample data. Decisions made here are saved in this browser only and are not written to the audit log.
    </div>
  );
}
