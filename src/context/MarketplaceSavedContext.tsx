"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface MarketplaceSavedContextType {
  /** Product handles the shopper has saved, newest first. */
  saved: string[];
  isReady: boolean;
  isSaved: (handle: string) => boolean;
  toggle: (handle: string) => void;
}

const MarketplaceSavedContext = createContext<MarketplaceSavedContextType | undefined>(undefined);

const SAVED_STORAGE_KEY = "halalme-marketplace-saved";

/** Saved-for-later list. Kept in the browser for now; it should move to the user's account with the backend. */
export function MarketplaceSavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Read after mount, not in a lazy initialiser - see CartContext for why.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = localStorage.getItem(SAVED_STORAGE_KEY);
    if (stored) {
      try {
        setSaved(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SAVED_STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isReady) localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(saved));
  }, [saved, isReady]);

  const isSaved = (handle: string) => saved.includes(handle);
  const toggle = (handle: string) =>
    setSaved((current) => (current.includes(handle) ? current.filter((h) => h !== handle) : [handle, ...current]));

  return (
    <MarketplaceSavedContext.Provider value={{ saved, isReady, isSaved, toggle }}>
      {children}
    </MarketplaceSavedContext.Provider>
  );
}

export function useMarketplaceSaved() {
  const context = useContext(MarketplaceSavedContext);
  if (context === undefined) {
    throw new Error("useMarketplaceSaved must be used within a MarketplaceSavedProvider");
  }
  return context;
}
