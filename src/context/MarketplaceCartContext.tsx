"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { MarketplaceCartLine } from "@/types/marketplace";

interface MarketplaceCartContextType {
  lines: MarketplaceCartLine[];
  /** False until the stored basket has been read, so pages can show a skeleton instead of "empty". */
  isReady: boolean;
  addLine: (line: Omit<MarketplaceCartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
  /** Discount code entered at the basket, carried through to checkout. */
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
  totalQuantity: number;
  subtotal: number;
}

const MarketplaceCartContext = createContext<MarketplaceCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "halalme-marketplace-cart";
const PROMO_STORAGE_KEY = "halalme-marketplace-promo";

export function MarketplaceCartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<MarketplaceCartLine[]>([]);
  const [promoCode, setPromoCodeState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Read after mount, not in a lazy initialiser - see CartContext for why.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setLines(JSON.parse(stored));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setPromoCodeState(localStorage.getItem(PROMO_STORAGE_KEY));
    setIsReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    }
  }, [lines, isReady]);

  const addLine = (line: Omit<MarketplaceCartLine, "quantity">, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((l) => l.variantId === line.variantId);
      if (existing) {
        return current.map((l) =>
          l.variantId === line.variantId ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [...current, { ...line, quantity }];
    });
  };

  const removeLine = (variantId: string) => {
    setLines((current) => current.filter((l) => l.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeLine(variantId);
      return;
    }
    setLines((current) =>
      current.map((l) => (l.variantId === variantId ? { ...l, quantity } : l))
    );
  };

  const setPromoCode = (code: string | null) => {
    setPromoCodeState(code);
    if (code) localStorage.setItem(PROMO_STORAGE_KEY, code);
    else localStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const clear = () => {
    setLines([]);
    setPromoCode(null);
  };

  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <MarketplaceCartContext.Provider
      value={{ lines, isReady, addLine, updateQuantity, removeLine, clear, promoCode, setPromoCode, totalQuantity, subtotal }}
    >
      {children}
    </MarketplaceCartContext.Provider>
  );
}

export function useMarketplaceCart() {
  const context = useContext(MarketplaceCartContext);
  if (context === undefined) {
    throw new Error("useMarketplaceCart must be used within a MarketplaceCartProvider");
  }
  return context;
}
