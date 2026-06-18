"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  Users,
  ChefHat,
  MessageSquare,
  Gift,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  ScrollText,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isStaffRole } from "@/lib/adminRoles";

type Access = "none" | "view" | "manage";
type Module = "merchants" | "users" | "kitchen" | "hub" | "rewards" | "analytics";
type Permissions = Record<Module, Access>;

type NavItem = {
  label: string;
  href: string;
  icon: typeof Store;
  module?: Module; // ties the item to an admin_permissions key (the 6 gated modules)
  soon?: boolean;
};

// Grouped navigation (per OPERATIONS_WORKSPACES_PLAN.md). Operations workspaces
// are Phase 2 and intentionally not listed yet. Items with no `module` are always
// shown to any staff role; `soon` items aren't built yet.
const NAV_GROUPS: { heading?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, soon: true },
    ],
  },
  {
    heading: "Domains",
    items: [
      { label: "Merchants",         href: "/admin/merchants", icon: Store,         module: "merchants" },
      { label: "Users",             href: "/admin/users",     icon: Users,         module: "users" },
      { label: "Rewards & Charity", href: "/admin/rewards",   icon: Gift,          module: "rewards" },
      { label: "Kitchen",           href: "/admin/kitchen",   icon: ChefHat,       module: "kitchen",   soon: true },
      { label: "Hub",               href: "/admin/hub",       icon: MessageSquare, module: "hub",       soon: true },
      { label: "Support",           href: "/admin/support",   icon: LifeBuoy,                           soon: true },
    ],
  },
  {
    heading: "Intelligence",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, module: "analytics", soon: true },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Permissions", href: "/admin/users",     icon: ShieldCheck, soon: true },
      { label: "Audit",       href: "/admin/audit",     icon: ScrollText,  soon: true },
      { label: "Settings",    href: "/admin/settings",  icon: Settings,    soon: true },
    ],
  },
];

function Sidebar({
  pathname,
  user,
  permissions,
  onClose,
}: {
  pathname: string;
  user: { email?: string; full_name?: string };
  permissions: Permissions | null;
  onClose?: () => void;
}) {
  const initials = (user.full_name ?? user.email ?? "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Hide modules the current admin has no access to (empty groups drop out).
  // While permissions are still loading (null) show everything to avoid a flash.
  const visibleGroups = NAV_GROUPS
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) => !item.module || !permissions || permissions[item.module] !== "none",
      ),
    }))
    .filter((g) => g.items.length > 0);

  function renderItem({ label, href, icon: Icon, soon }: NavItem) {
    const active = pathname.startsWith(href) && href !== "/admin";
    if (soon) {
      return (
        <div
          key={label}
          className="flex items-center gap-3 px-3 py-2.5 rounded-none cursor-not-allowed select-none"
        >
          <Icon size={15} className="text-white/20 shrink-0" />
          <span className="text-sm text-white/25 flex-1 font-medium">{label}</span>
          <span className="text-[9px] font-bold tracking-wide uppercase bg-white/6 text-white/20 px-2 py-0.5 rounded-full">
            Soon
          </span>
        </div>
      );
    }
    return (
      <Link
        key={label}
        href={href}
        onClick={onClose}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-[#F7E7CE]/12 text-[#F7E7CE] border border-[#F7E7CE]/12"
            : "text-white/55 hover:bg-white/[0.07] hover:text-white border border-transparent"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#F03E9E]" />
        )}
        <Icon size={15} className={`shrink-0 ${active ? "text-[#F7E7CE]" : ""}`} />
        {label}
        {active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F03E9E] shrink-0" />
        )}
      </Link>
    );
  }

  return (
    <aside className="w-64 md:w-56 bg-[#0e2420] flex flex-col h-full relative">
      {/* Subtle texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,231,206,0.04),transparent_60%)] pointer-events-none" />

      {/* Brand */}
      <div className="relative px-5 pt-5 pb-4 border-b border-white/8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex w-8 h-8 shrink-0">
            <span className="absolute inset-0 bg-white/90 rounded-full" />
            <Image src="/logo/logo.png" alt="HalalMe" width={32} height={32} className="object-contain relative z-10 p-0.5" />
          </span>
          <div>
            <p
              className="text-[#F7E7CE] font-black text-lg leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-logo)" }}
            >
              HalalMe
            </p>
            <p className="text-[#F59E0B] text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">
              Admin Panel
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-none text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-3 overflow-y-auto">
        {visibleGroups.map((group, gi) => (
          <div key={group.heading ?? `grp-${gi}`} className={gi > 0 ? "mt-4" : "mt-1"}>
            {group.heading && (
              <p className="text-[9px] font-bold text-white/20 tracking-[0.15em] uppercase px-3 mb-2">
                {group.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative px-3 py-3 border-t border-white/8 space-y-1">
        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-none">
          <div className="w-7 h-7 rounded-full bg-[#F7E7CE]/15 border border-[#F7E7CE]/20 flex items-center justify-center shrink-0">
            <span className="text-[#F7E7CE] text-xs font-bold leading-none">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium truncate">
              {user.full_name ?? "Admin"}
            </p>
            <p className="text-white/30 text-[10px] truncate">{user.email}</p>
          </div>
        </div>

        {/* Back to app */}
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-none text-white/35 hover:text-white/70 hover:bg-white/6 text-sm transition-all group"
        >
          <ExternalLink size={14} className="shrink-0" />
          <span className="font-medium">Back to HalalMe</span>
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Load the current admin's per-module access for sidebar filtering.
  useEffect(() => {
    if (isLoading || !user || !isStaffRole(user.role)) return;
    let active = true;
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.permissions) setPermissions(data.permissions);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e2420]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-[#F7E7CE]/10 flex items-center justify-center">
            <span className="text-[#F7E7CE] font-bold text-base">H</span>
          </div>
          <div className="w-5 h-5 border-2 border-[#F7E7CE]/30 border-t-[#F7E7CE] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user || !isStaffRole(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3E9D6]">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-none flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            You need admin permissions to access this area. Contact your administrator.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-[#102C26] font-semibold hover:underline"
          >
            <ArrowLeft size={14} />
            Back to HalalMe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F3E9D6]">

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar: fixed full-height, slides in on mobile ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          pathname={pathname}
          user={user}
          permissions={permissions}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Content column — offset to clear the fixed sidebar on desktop ── */}
      <div className="md:pl-56 min-h-dvh flex flex-col">

        {/* Mobile top bar — sticky so nav stays reachable while scrolling */}
        <div className="md:hidden sticky top-0 z-30 bg-[#0e2420] border-b border-white/8 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-none text-white/60 hover:text-white hover:bg-white/10 transition-colors -ml-1"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex w-6 h-6 shrink-0">
              <span className="absolute inset-0 bg-white/90 rounded-full" />
              <Image src="/logo/logo.png" alt="HalalMe" width={24} height={24} className="object-contain relative z-10 p-0.5" />
            </span>
            <span className="text-[#F7E7CE] font-black text-sm" style={{ fontFamily: "var(--font-logo)" }}>HalalMe</span>
            <span className="text-[#F59E0B] text-[9px] font-bold tracking-widest uppercase">Admin</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Page content — the document is the single scroll container */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
