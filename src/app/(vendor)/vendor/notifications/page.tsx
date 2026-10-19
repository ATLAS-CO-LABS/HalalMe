"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, Boxes, CheckCheck, Package, ShoppingCart, UserRound, Wallet } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import type { NotificationKind, VendorNotification } from "@/types/marketplaceVendor";
import { useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import { Button, Card, EmptyState, FilterPills, fmtDateTime, LoadError, PageBody, PageHeader, TableSkeleton } from "@/components/vendor/ui";

const KIND_ICON: Record<NotificationKind, React.ElementType> = {
  order: ShoppingCart,
  product: Package,
  payout: Wallet,
  account: UserRound,
  stock: Boxes,
};

export default function VendorNotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const { data: notifications, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("notifications"),
    queryFn: () => vendorService.listNotifications(),
  });
  const markRead = useVendorMutation((id: string | undefined) => vendorService.markNotificationsRead(id));

  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const rows = (notifications ?? []).filter((n) => filter === "all" || !n.read);

  const open = (n: VendorNotification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.href) router.push(n.href);
  };

  return (
    <>
      <PageHeader
        eyebrow="Notifications"
        title="Notifications"
        description="Orders, product decisions, stock alerts and payouts."
        actions={
          <Button variant="secondary" icon={CheckCheck} disabled={unread === 0} loading={markRead.isPending && markRead.variables === undefined} onClick={() => markRead.mutate(undefined)}>
            Mark all as read
          </Button>
        }
      />
      <PageBody narrow>
        <Card flush>
          <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8">
            <FilterPills
              options={[
                { key: "all", label: "All" },
                { key: "unread", label: `Unread (${unread})` },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          {isError ? (
            <LoadError message="We could not load your notifications." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState icon={Bell} title={filter === "unread" ? "Nothing unread" : "No notifications yet"} hint="We will let you know here when something needs your attention." />
          ) : (
            <ul className="divide-y divide-[#102C26]/8">
              {rows.map((n) => {
                const Icon = KIND_ICON[n.kind];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => open(n)}
                      className={`w-full flex items-start gap-3 px-4 sm:px-5 py-3.5 text-left transition-colors hover:bg-[#102C26]/[0.03] ${n.read ? "" : "bg-[#F59E0B]/[0.06]"}`}
                    >
                      <span className={`w-9 h-9 flex items-center justify-center shrink-0 ${n.read ? "bg-gray-100 text-gray-500" : "bg-[#F59E0B]/15 text-[#B45309]"}`}>
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm ${n.read ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}>{n.title}</span>
                        <span className="block text-sm text-gray-600 mt-0.5">{n.body}</span>
                        <span className="block text-xs text-gray-500 mt-1">{fmtDateTime(n.at)}</span>
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-2 shrink-0" aria-label="Unread" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </PageBody>
    </>
  );
}
