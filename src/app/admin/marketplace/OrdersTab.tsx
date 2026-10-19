"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, ShoppingCart } from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { money, OPEN_ORDER_STATUSES, ORDER_STATUS } from "@/lib/vendorOnboarding";
import type { AdminOrderRow } from "@/types/marketplaceVendor";
import {
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  DetailList,
  display,
  EmptyState,
  FilterPills,
  fmtDateTime,
  LoadError,
  Modal,
  Pagination,
  SearchInput,
  StatusBadge,
  TableSkeleton,
  ToastView,
  usePaged,
  useToast,
  type Column,
} from "@/components/vendor/ui";
import { marketplaceKey, useCanManageMarketplace, useMarketplaceMutation } from "./_shared";

const FILTERS: { key: string; label: string; match: (row: AdminOrderRow) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "open", label: "In progress", match: (r) => OPEN_ORDER_STATUSES.includes(r.order.status) },
  { key: "shipped", label: "Shipped", match: (r) => r.order.status === "shipped" },
  { key: "delivered", label: "Delivered", match: (r) => r.order.status === "delivered" },
  { key: "closed", label: "Cancelled & refunded", match: (r) => r.order.status === "cancelled" || r.order.status === "refunded" },
];

function OrderPanel({ row, canManage, onRefund }: { row: AdminOrderRow; canManage: boolean; onRefund: () => void }) {
  const { order } = row;
  const refundable = canManage && order.status !== "cancelled" && order.status !== "refunded";

  return (
    <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="order-panel-title" className={`${display.className} text-base font-bold uppercase tracking-tight text-[#102C26]`}>
            Order {order.number}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            <Link href={`/admin/marketplace/vendors/${order.vendorId}`} className="font-semibold text-[#102C26] underline">
              {row.vendorName}
            </Link>{" "}
            · placed {fmtDateTime(order.placedAt)}
          </p>
        </div>
        <StatusBadge status={order.status} map={ORDER_STATUS} />
      </div>

      <ul className="border border-[#102C26]/12 divide-y divide-[#102C26]/8">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.sku}`} className="flex justify-between gap-3 px-3 py-2.5 text-sm">
            <span className="text-gray-900">
              {item.quantity} × {item.title}
              {item.variantName && <span className="text-gray-500"> ({item.variantName})</span>}
            </span>
            <span className="tabular-nums text-gray-900">{money(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <DetailList
        rows={[
          { label: "Customer", value: `${order.customer.name}, ${order.shippingAddress.city}` },
          { label: "Customer paid", value: money(order.total) },
          { label: `Commission (${order.commissionRate}%)`, value: money(order.commissionAmount) },
          { label: "Vendor earns", value: money(order.vendorNet) },
          { label: "Tracking", value: order.tracking ? `${order.tracking.courier} ${order.tracking.number}` : "" },
          { label: "Payout", value: order.payoutId ? "Included in a payout" : order.status === "delivered" ? "Owed to vendor" : "Not yet due" },
        ]}
      />

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">History</p>
        <ol className="space-y-2">
          {[...order.timeline].reverse().map((event) => (
            <li key={`${event.status}-${event.at}`} className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">{ORDER_STATUS[event.status].label}</span> · {fmtDateTime(event.at)}
              {event.note && <span className="text-gray-500"> · {event.note}</span>}
            </li>
          ))}
        </ol>
      </div>

      {refundable && (
        <div className="flex justify-end pt-1">
          <Button variant="danger" icon={RotateCcw} onClick={onRefund}>
            Refund order
          </Button>
        </div>
      )}
    </div>
  );
}

export default function OrdersTab() {
  const canManage = useCanManageMarketplace();
  const { toast, flash } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("orders"),
    queryFn: () => marketplaceAdminService.listOrders(),
  });

  const refund = useMarketplaceMutation((reason: string) => marketplaceAdminService.refundOrder(openId!, reason), {
    onSuccess: () => {
      setRefunding(false);
      setOpenId(null);
      flash("ok", "Order refunded");
    },
    onError: setRefundError,
  });

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const term = search.trim().toLowerCase();
  const rows = (orders ?? []).filter(
    (row) =>
      active.match(row) &&
      (!term || [row.order.number, row.order.customer.name, row.vendorName].some((v) => v.toLowerCase().includes(term))),
  );
  const paged = usePaged(rows, 12);
  const open = orders?.find((row) => row.order.id === openId) ?? null;

  const columns: Column<AdminOrderRow>[] = [
    {
      key: "order",
      header: "Order",
      render: (row) => (
        <button onClick={() => setOpenId(row.order.id)} className="font-semibold text-gray-900 hover:text-[#B45309]">
          {row.order.number}
        </button>
      ),
    },
    { key: "placed", header: "Placed", className: "hidden lg:table-cell", render: (row) => <span className="text-gray-600 whitespace-nowrap">{fmtDateTime(row.order.placedAt)}</span> },
    { key: "vendor", header: "Vendor", render: (row) => <span className="block text-gray-900 truncate max-w-44">{row.vendorName}</span> },
    { key: "customer", header: "Customer", className: "hidden xl:table-cell", render: (row) => <span className="text-gray-600">{row.order.customer.name}</span> },
    { key: "total", header: "Total", align: "right", render: (row) => <span className="font-semibold text-gray-900">{money(row.order.total)}</span> },
    { key: "commission", header: "Commission", align: "right", className: "hidden lg:table-cell", render: (row) => <span className="text-gray-700">{money(row.order.commissionAmount)}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.order.status} map={ORDER_STATUS} /> },
  ];

  return (
    <>
      <ToastView toast={toast} />
      <Card flush>
        <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex flex-col xl:flex-row xl:items-center gap-3">
          <FilterPills
            options={FILTERS.map((f) => ({ key: f.key, label: orders ? `${f.label} (${orders.filter(f.match).length})` : f.label }))}
            value={filter}
            onChange={(key) => { setFilter(key); paged.setPage(0); }}
          />
          <div className="xl:ml-auto xl:w-72 flex">
            <SearchInput value={search} onChange={(v) => { setSearch(v); paged.setPage(0); }} placeholder="Search order, vendor or customer" />
          </div>
        </div>

        {isError ? (
          <LoadError message="Could not load orders." onRetry={() => void refetch()} compact />
        ) : isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders match" hint="Try a different filter or search term." />
        ) : (
          <>
            <DataTable
              rows={paged.slice}
              columns={columns}
              rowKey={(row) => row.order.id}
              mobile={(row) => (
                <button className="w-full text-left" onClick={() => setOpenId(row.order.id)}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-semibold text-gray-900">{row.order.number}</span>
                      <span className="block text-xs text-gray-600 truncate">{row.vendorName}</span>
                    </span>
                    <span className="text-right shrink-0">
                      <span className="block font-semibold text-gray-900 tabular-nums">{money(row.order.total)}</span>
                      <span className="block mt-1"><StatusBadge status={row.order.status} map={ORDER_STATUS} /></span>
                    </span>
                  </span>
                </button>
              )}
            />
            <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} noun="order" onPrev={paged.onPrev} onNext={paged.onNext} />
          </>
        )}
      </Card>

      <Modal open={open !== null && !refunding} onClose={() => setOpenId(null)} labelledBy="order-panel-title" maxWidth="max-w-xl">
        {open && <OrderPanel row={open} canManage={canManage} onRefund={() => { setRefundError(null); setRefunding(true); }} />}
      </Modal>

      <ConfirmDialog
        open={refunding}
        onClose={() => setRefunding(false)}
        onConfirm={(reason) => refund.mutate(reason)}
        busy={refund.isPending}
        danger
        title={`Refund order ${open?.order.number ?? ""}?`}
        body="The customer is refunded in full and the vendor is not paid for this order. This cannot be undone."
        confirmLabel="Refund order"
        noteLabel="Reason"
        notePlaceholder="e.g. Item arrived damaged"
        noteRequired
        error={refundError}
      />
    </>
  );
}
