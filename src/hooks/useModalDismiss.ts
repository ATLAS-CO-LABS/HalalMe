"use client";

import { useEffect, useRef } from "react";

/**
 * Shared dismiss behaviour for the hand-rolled overlay modals (Social profile,
 * create post, edit post).
 *
 * Two things every one of them was missing:
 *   1. Escape to close.
 *   2. A body scroll lock. Without it the page behind keeps scrolling under the
 *      overlay, which on mobile is what drags a modal's close button off screen.
 *
 * Backdrop-click closing deliberately stays with each modal: the click surface
 * has to be the element that actually receives the click, and that differs per
 * layout.
 *
 * `enabled` lets a modal refuse dismissal while a submit is in flight.
 */
export function useModalDismiss(
  isOpen: boolean,
  onClose: () => void,
  enabled = true,
) {
  // Kept in refs so the listener effect depends on `isOpen` alone. If it re-ran
  // on every render it would capture its own "hidden" as the value to restore on
  // unmount and leave the page permanently unscrollable.
  const onCloseRef = useRef(onClose);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    onCloseRef.current = onClose;
    enabledRef.current = enabled;
  });

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && enabledRef.current) onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
}
