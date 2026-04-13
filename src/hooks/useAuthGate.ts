"use client";

import { useAuthGateContext } from "@/context/AuthGateContext";

export interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  message?: string;
}

/**
 * Exposes `requireAuth(action, message?)` from the global AuthGateProvider.
 *
 * Usage:
 *   const { requireAuth } = useAuthGate();
 *   <button onClick={() => requireAuth(() => doThing(), "Sign up to do this")} />
 *
 * The AuthModal is mounted once globally in LayoutContent — no local
 * <AuthModal> or modalProps needed in individual pages.
 */
export function useAuthGate() {
  const { requireAuth } = useAuthGateContext();
  return { requireAuth };
}
