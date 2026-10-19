"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { OPEN_ORDER_STATUSES } from "@/lib/vendorOnboarding";
import { useVendor, vendorKeys } from "@/components/vendor/VendorProvider";

type NavItem = { label: string; href: string; icon: React.ElementType; badge?: "orders" | "notifications" };

const NAV_GROUPS: { heading?: string; items: NavItem[] }[] = [
  { items: [{ label: "Overview", href: "/vendor", icon: LayoutDashboard }] },
  {
    heading: "Selling",
    items: [
      { label: "Orders", href: "/vendor/orders", icon: ShoppingCart, badge: "orders" },
      { label: "Products", href: "/vendor/products", icon: Package },
      { label: "Inventory", href: "/vendor/inventory", icon: Boxes },
      { label: "Promotions", href: "/vendor/promotions", icon: Tag },
    ],
  },
  {
    heading: "Performance",
    items: [
      { label: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
      { label: "Earnings", href: "/vendor/earnings", icon: Wallet },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Store", href: "/vendor/store", icon: Store },
      { label: "Notifications", href: "/vendor/notifications", icon: Bell, badge: "notifications" },
      { label: "Support", href: "/vendor/support", icon: LifeBuoy },
      { label: "Settings", href: "/vendor/settings", icon: Settings },
    ],
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/vendor" className="flex items-center gap-2.5 min-w-0">
      <span className={`relative inline-flex shrink-0 ${compact ? "w-6 h-6" : "w-8 h-8"}`}>
        <span className="absolute inset-0 bg-white/90 rounded-full" />
        <Image src="/logo/logo.png" alt="" width={32} height={32} className="object-contain relative z-10 p-0.5" />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[#F7E7CE] font-black leading-tight tracking-tight ${compact ? "text-sm" : "text-lg"}`}
          style={{ fontFamily: "var(--font-logo)" }}
        >
          HalalMe
        </span>
        {!compact && (
          <span className="block text-[#F59E0B] text-[9px] font-bold tracking-[0.2em] uppercase mt-0.5">Vendor Portal</span>
        )}
      </span>
    </Link>
  );
}

/** Sign out of the sample session and return to the signup page. */
export function useVendorSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    vendorService.demoSignInAs(null);
    queryClient.removeQueries({ queryKey: vendorKeys.all });
    router.push("/partner/vendor");
  };
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const vendor = useVendor();
  const signOut = useVendorSignOut();

  const { data: orders } = useQuery({ queryKey: vendorKeys.resource("orders"), queryFn: () => vendorService.listOrders() });
  const { data: notifications } = useQuery({
    queryKey: vendorKeys.resource("notifications"),
    queryFn: () => vendorService.listNotifications(),
  });
  const badges = {
    orders: orders?.filter((o) => OPEN_ORDER_STATUSES.includes(o.status)).length ?? 0,
    notifications: notifications?.filter((n) => !n.read).length ?? 0,
  };

  return (
    <aside className="w-60 h-full bg-[#0e2420] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(247,231,206,0.04),transparent_60%)] pointer-events-none" />

      <div className="relative px-4 pt-5 pb-4 border-b border-white/8 flex items-center justify-between">
        <Brand />
        {onNavigate && (
          <button
            onClick={onNavigate}
            aria-label="Close menu"
            className="lg:hidden p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav aria-label="Vendor portal" className="relative flex-1 px-3 py-3 overflow-y-auto scrollbar-hide">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.heading ?? gi} className={gi > 0 ? "mt-4" : ""}>
            {group.heading && (
              <p className="text-[9px] font-bold text-white/30 tracking-[0.15em] uppercase px-3 mb-2">{group.heading}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const active = href === "/vendor" ? pathname === "/vendor" : pathname.startsWith(href);
                const count = badge ? badges[badge] : 0;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium border transition-colors ${
                        active
                          ? "bg-[#F7E7CE]/12 text-[#F7E7CE] border-[#F7E7CE]/12"
                          : "text-white/60 hover:bg-white/[0.07] hover:text-white border-transparent"
                      }`}
                    >
                      {active && <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#F59E0B]" />}
                      <Icon size={15} className="shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {count > 0 && (
                        <span className="min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-[#F59E0B] text-white text-[10px] font-bold leading-none">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative px-3 py-3 border-t border-white/8 space-y-0.5">
        <div className="px-3 py-2">
          <p className="text-white/80 text-xs font-semibold truncate">{vendor.store.name || vendor.business.tradingName}</p>
          <p className="text-white/40 text-[10px] truncate">{vendor.owner.email}</p>
        </div>
        <Link
          href={`/marketplace/sellers/${vendor.handle}`}
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 text-white/45 hover:text-white/80 hover:bg-white/6 text-sm transition-colors"
        >
          <ExternalLink size={14} className="shrink-0" />
          <span className="font-medium">View my store</span>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-white/45 hover:text-red-300 hover:bg-white/6 text-sm transition-colors"
        >
          <LogOut size={14} className="shrink-0" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

/** Operational layout for an approved vendor: fixed sidebar, drawer on mobile. */
export default function VendorShell({ banner, children }: { banner?: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation, adjusted during render so it never paints open on the new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="min-h-dvh bg-[#F3E9D6]">
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <div className="lg:pl-60 min-h-dvh flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 bg-[#0e2420] border-b border-white/8 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Brand compact />
          <Link
            href="/vendor/notifications"
            aria-label="Notifications"
            className="p-2 -mr-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Bell size={18} />
          </Link>
        </div>

        {banner}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
