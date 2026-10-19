"use client";

import { useEffect, useState } from "react";
import { minDelay } from "@/lib/minDelay";

interface QueryState<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/**
 * Fetch-on-mount for Marketplace pages. Re-runs whenever `key` changes and
 * reports `loading` until the result for the current key has arrived, so a
 * stale result from a previous filter is never shown.
 */
export function useMarketplaceQuery<T>(key: string, fetcher: () => Promise<T>) {
  const [state, setState] = useState<QueryState<T> | null>(null);

  useEffect(() => {
    let cancelled = false;

    minDelay(fetcher()).then(
      (data) => {
        if (!cancelled) setState({ key, data, error: null });
      },
      (err: unknown) => {
        if (!cancelled) {
          setState({ key, data: null, error: err instanceof Error ? err.message : "Something went wrong" });
        }
      },
    );

    return () => {
      cancelled = true;
    };
    // `key` is the caller's statement of everything the fetcher depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const current = state?.key === key ? state : null;

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: current === null,
  };
}
