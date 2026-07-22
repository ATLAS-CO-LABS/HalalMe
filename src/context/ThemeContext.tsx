"use client";

/**
 * ThemeContext
 *
 * HalalMe is dark-only everywhere except Social (/hub) and Kitchen
 * (/kitchen), where the user can switch to a light theme. The chosen
 * theme is remembered (localStorage), but it is only ever painted while
 * browsing a themed route - everywhere else stays the platform's usual
 * dark forest look regardless of the stored preference.
 *
 * The active theme is exposed as `data-hm-theme="light"|"dark"` on
 * <html>, which the CSS tokens in globals.css (--hm-bg, --hm-text, etc.)
 * key off. An inline script in the root layout sets that attribute
 * synchronously before paint to avoid a flash of the wrong theme.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type Theme = "light" | "dark";

const STORAGE_KEY = "hm-theme";
const THEMED_PREFIXES = ["/hub", "/kitchen"];

function isThemedRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return THEMED_PREFIXES.some((p) => pathname.startsWith(p));
}

interface ThemeContextValue {
  /** The user's stored preference. */
  theme: Theme;
  /** Whether the current route actually renders in `theme` (vs forced dark). */
  isThemedRoute: boolean;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Always starts as "dark" - matching the server-rendered pass exactly - and
  // only picks up the real stored preference after mount. Reading
  // localStorage in a lazy initializer instead would make the client's first
  // render diverge from the server's (which has no localStorage), causing a
  // hydration mismatch on every element that reads `theme`.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration sync from localStorage, see comment above
    if (stored === "light" || stored === "dark") setThemeState(stored);
  }, []);

  const onThemedRoute = isThemedRoute(pathname);

  useEffect(() => {
    const effective: Theme = onThemedRoute ? theme : "dark";
    document.documentElement.setAttribute("data-hm-theme", effective);
  }, [theme, onThemedRoute]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, isThemedRoute: onThemedRoute, setTheme, toggleTheme }),
    [theme, onThemedRoute, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
