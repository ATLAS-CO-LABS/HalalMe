"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Heart, MessageCircle, UserPlus, CornerDownRight, X } from "lucide-react";
import Link from "next/link";
import type { Notification, NotificationType } from "@/types";
import { hubService } from "@/services/hubService";
import { formatRelativeTime } from "@/lib/relativeTime";
import { withTimeout } from "@/lib/withTimeout";
import { useResumeKey } from "@/context/AppResumeContext";
import Avatar from "./Avatar";

interface NotificationPanelProps {
  userId: string;
}

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "like_post":
    case "like_comment":
      return <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />;
    case "comment":
      return <MessageCircle className="w-3.5 h-3.5 text-(--hm-amber)" />;
    case "reply":
      return <CornerDownRight className="w-3.5 h-3.5 text-(--hm-amber)" />;
    case "follow":
      return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
  }
}

function notificationText(n: Notification): string {
  const name = n.actor?.full_name ?? n.actor?.username ?? "Someone";
  switch (n.type) {
    case "like_post":     return `${name} liked your post`;
    case "like_comment":  return `${name} liked your comment`;
    case "comment":       return `${name} commented on your post`;
    case "reply":         return `${name} replied to your comment`;
    case "follow":        return `${name} started following you`;
    default:              return `${name} interacted with you`;
  }
}

function notificationHref(n: Notification): string {
  if (n.post_id) return `/hub/post/${n.post_id}`;
  return "/hub/feed";
}

export default function NotificationPanel({ userId }: NotificationPanelProps) {
  const [isOpen, setIsOpen]               = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isLoading, setIsLoading]         = useState(false);
  const panelRef                          = useRef<HTMLDivElement>(null);
  const resumeKey                         = useResumeKey();

  // Monotonic counter so only the latest handleOpen fetch updates state.
  const loadRequestIdRef = useRef(0);

  // Load unread count on mount + realtime updates.
  // Wrapped in withTimeout so a stalled network can never leave state hanging.
  // resumeKey ensures the channel is torn down and re-created after every
  // app-resume reconnect - Phoenix channels silently die during tab suspension.
  useEffect(() => {
    withTimeout(hubService.getUnreadNotificationCount(userId), 10_000)
      .then(setUnreadCount)
      .catch(() => {}); // unread count is non-critical

    const unsub = hubService.subscribeToNotifications(userId, () => {
      setUnreadCount((prev) => prev + 1);
    });
    return unsub;
  }, [userId, resumeKey]);

  // On resume: if the panel is already open, re-fetch the notifications list
  // so the user does not see stale data from before the tab was suspended.
  useEffect(() => {
    if (resumeKey === 0 || !isOpen) return;
    const requestId = ++loadRequestIdRef.current;
    withTimeout(hubService.getNotifications(userId), 10_000)
      .then((data) => { if (requestId === loadRequestIdRef.current) setNotifications(data); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeKey]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      const requestId = ++loadRequestIdRef.current;
      setIsLoading(true);
      try {
        const data = await withTimeout(hubService.getNotifications(userId), 10_000);
        // Guard: only the latest open-request writes state
        if (requestId !== loadRequestIdRef.current) return;
        setNotifications(data);
      } catch {
        // non-critical - panel stays open with empty list
      } finally {
        if (requestId === loadRequestIdRef.current) setIsLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await hubService.markAllNotificationsRead(userId).catch(() => {});
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.is_read) {
      setNotifications((prev) =>
        prev.map((item) => item.id === n.id ? { ...item, is_read: true } : item)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await hubService.markNotificationRead(n.id).catch(() => {});
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <motion.button
        onClick={handleOpen}
        className="relative p-2 rounded-full text-[color:color-mix(in_oklab,var(--hub-fg)_40%,var(--hm-lm-anchor))] hover:text-(--hub-fg) hover:bg-(--hub-fg)/10 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-(--hm-amber) text-[#0B0D0F] text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ type: "tween", duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-(--hub-bg2) border border-(--hub-fg)/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--hub-fg)/10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-(--hm-amber)" />
                <h3
                  className="text-xs font-bold uppercase tracking-[0.2em] text-(--hm-amber)"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Notifications
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[color:color-mix(in_oklab,var(--hub-fg)_40%,var(--hm-lm-anchor))] hover:text-(--hub-fg) transition-colors font-semibold flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </motion.button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[color:color-mix(in_oklab,var(--hub-fg)_40%,var(--hm-lm-anchor))] hover:text-(--hub-fg) transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-(--hm-amber) border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="w-10 h-10 text-[color:color-mix(in_oklab,var(--hub-fg)_20%,var(--hm-lm-anchor))] mb-3" />
                  <p
                    className="text-[color:color-mix(in_oklab,var(--hub-fg)_40%,var(--hm-lm-anchor))] text-sm font-normal"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-(--hub-fg)/10">
                  {notifications.map((n, index) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link href={notificationHref(n)} onClick={() => handleClickNotification(n)}>
                        <div
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-(--hub-fg)/8 transition-colors cursor-pointer ${
                            !n.is_read ? "bg-amber-500/5" : ""
                          }`}
                        >
                          {/* Unread dot */}
                          <div className="mt-1.5 shrink-0">
                            {!n.is_read
                              ? <div className="w-2 h-2 rounded-full bg-(--hm-amber)" />
                              : <div className="w-2 h-2 rounded-full bg-transparent" />
                            }
                          </div>

                          {/* Avatar + icon badge */}
                          <div className="relative shrink-0">
                            <Avatar
                              src={n.actor?.avatar_url ?? undefined}
                              alt={n.actor?.username ?? "User"}
                              size="sm"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-(--hub-bg2) rounded-full p-0.5">
                              {notificationIcon(n.type as NotificationType)}
                            </div>
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm text-[color:color-mix(in_oklab,var(--hub-fg)_85%,var(--hm-lm-anchor))] font-normal leading-snug"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {notificationText(n)}
                            </p>
                            <p
                              className="text-xs text-[color:color-mix(in_oklab,var(--hub-fg)_40%,var(--hm-lm-anchor))] mt-0.5 font-normal"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {formatRelativeTime(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
