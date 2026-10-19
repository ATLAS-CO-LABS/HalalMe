"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, ShoppingCart } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { money, OPEN_ORDER_STATUSES, ORDER_STATUS } from "@/lib/vendorOnboarding";
import type { VendorOrder } from "@/types/marketplaceVendor";
import { useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  FilterPills,
  fmtDateTime,
  LoadError,
  PageBody,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
  TableSkeleton,
  ToastView,
  usePaged,
  useToast,
  type Column,
} from "@/components/vendor/ui";

const FILTERS: { key: string; label: string; match: (o: VendorOrder) => boolean }[] = [
  { key: "open", label: "To fulfil", match: (o) => OPEN_ORDER_STATUSES.includes(o.status) },
  { key: "shipped", label: "Shipped", match: (o) => o.status === "shipped" },
  { key: "delivered", label: "Delivered", match: (o) => o.status === "delivered" },
  { key: "closed", label: "Cancelled & refunded", match: (o) => o.status === "cancelled" || o.status === "refunded" },
  { key: "all", label: "All", match: () => true },
];

const itemSummary = (o: VendorOrder) => o.items.map((i) => `${i.quantity} × ${i.title}`).join(", ");

export default function VendorOrdersPage() {
  const router = useRouter();
  const { toast, flash } = useToast();
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("orders"),
    queryFn: () => vendorService.listOrders(),
  });

  const testOrder = useVendorMutation(() => vendorService.demoPlaceOrder(), {
    onSuccess: (order) => router.push(`/vendor/orders/${order.id}`),
    onError: (message) => flash("err", message),
  });

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const term = search.trim().toLowerCase();
  const rows = (orders ?? []).filter(
    (o) => active.match(o) && (!term || o.number.toLowerCase().includes(term) || o.customer.name.toLowerCase().includes(term)),
  );
  const paged = usePaged(rows, 10);

  const columns: Column<VendorOrder>[] = [
    {
      key: "order",
      header: "Order",
      render: (o) => (
        <Link href={`/vendor/orders/${o.id}`} className="font-semibold text-gray-900 hover:text-[#B45309]">
          {o.number}
        </Link>
      ),
    },
    { key: "placed", header: "Placed", className: "hidden lg:table-cell", render: (o) => <span className="text-gray-600 whitespace-nowrap">{fmtDateTime(o.placedAt)}</span> },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <>
          <span className="block text-gray-900">{o.customer.name}</span>
          <span className="block text-xs text-gray-500">{o.shippingAddress.city}</span>
        </>
      ),
    },
    { key: "items", header: "Items", className: "hidden xl:table-cell", render: (o) => <span className="block text-gray-600 truncate max-w-72">{itemSummary(o)}</span> },
    { key: "total", header: "Total", align: "right", render: (o) => <span className="font-semibold text-gray-900">{money(o.total)}</span> },
    { key: "net", header: "You earn", align: "right", className: "hidden lg:table-cell", render: (o) => <span className="text-gray-700">{money(o.vendorNet)}</span> },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} map={ORDER_STATUS} /> },
  ];

  return (
    <>
      <ToastView toast={toast} />
      <PageHeader
        eyebrow="Orders"
        title="Orders"
        description="Accept, pack and ship. Customers are emailed at each step."
        actions={
          <Button variant="secondary" icon={FlaskConical} loading={testOrder.isPending} onClick={() => testOrder.mutate(undefined)}>
            Place a test order
          </Button>
        }
      />
      <PageBody>
        <Card flush>
          <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex flex-col lg:flex-row lg:items-center gap-3">
            <FilterPills
              options={FILTERS.map((f) => ({ key: f.key, label: orders ? `${f.label} (${orders.filter(f.match).length})` : f.label }))}
              value={filter}
              onChange={(key) => { setFilter(key); paged.setPage(0); }}
            />
            <div className="lg:ml-auto lg:w-72 flex">
              <SearchInput value={search} onChange={(v) => { setSearch(v); paged.setPage(0); }} placeholder="Search order number or customer" />
            </div>
          </div>

          {isError ? (
            <LoadError message="We could not load your orders." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title={filter === "open" && !term ? "Nothing to fulfil" : "No orders match"}
              hint={filter === "open" && !term ? "You are all caught up. New orders will appear here." : "Try a different filter or search term."}
            />
          ) : (
            <>
              <DataTable
                rows={paged.slice}
                columns={columns}
                rowKey={(o) => o.id}
                href={(o) => `/vendor/orders/${o.id}`}
                mobile={(o) => (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{o.number}</p>
                        <p className="text-xs text-gray-600">{o.customer.name} · {o.shippingAddress.city}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-gray-900 tabular-nums">{money(o.total)}</p>
                        <div className="mt-1"><StatusBadge status={o.status} map={ORDER_STATUS} /></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{itemSummary(o)}</p>
                  </>
                )}
              />
              <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} noun="order" onPrev={paged.onPrev} onNext={paged.onNext} />
            </>
          )}
        </Card>
      </PageBody>
    </>
  );
}
