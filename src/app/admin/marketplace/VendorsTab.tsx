"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Hourglass, Store } from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { categoryTitle, money, VENDOR_STATUS } from "@/lib/vendorOnboarding";
import type { AdminVendorRow, VendorStatus } from "@/types/marketplaceVendor";
import {
  Card,
  DataTable,
  EmptyState,
  FilterPills,
  fmtDate,
  LoadError,
  Pagination,
  SearchInput,
  StatCard,
  StatusBadge,
  TableSkeleton,
  usePaged,
  type Column,
} from "@/components/vendor/ui";
import { marketplaceKey } from "./_shared";

const FILTERS: { key: "all" | VendorStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Awaiting review" },
  { key: "changes_requested", label: "Changes requested" },
  { key: "draft", label: "Setting up" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

function ProgressBar({ percent }: { percent: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-16 h-1.5 bg-gray-100 overflow-hidden">
        <span className={`block h-full ${percent === 100 ? "bg-green-600" : "bg-[#F59E0B]"}`} style={{ width: `${percent}%` }} />
      </span>
      <span className="text-xs tabular-nums text-gray-600">{percent}%</span>
    </span>
  );
}

const columns: Column<AdminVendorRow>[] = [
  {
    key: "vendor",
    header: "Vendor",
    render: ({ vendor }) => (
      <Link href={`/admin/marketplace/vendors/${vendor.id}`} className="group block min-w-0">
        <span className="block font-semibold text-gray-900 group-hover:text-[#B45309] truncate max-w-56">{vendor.business.tradingName}</span>
        <span className="block text-xs text-gray-500 truncate max-w-56">{vendor.owner.name} · {vendor.owner.email}</span>
      </Link>
    ),
  },
  { key: "status", header: "Status", render: ({ vendor }) => <StatusBadge status={vendor.status} map={VENDOR_STATUS} /> },
  { key: "setup", header: "Setup", render: (row) => <ProgressBar percent={row.onboardingPercent} /> },
  {
    key: "categories",
    header: "Categories",
    className: "hidden xl:table-cell",
    render: ({ vendor }) => <span className="block text-gray-600 truncate max-w-48">{vendor.categories.map(categoryTitle).join(", ") || "—"}</span>,
  },
  {
    key: "products",
    header: "Products",
    align: "right",
    className: "hidden lg:table-cell",
    render: (row) => (
      <span className="text-gray-700">
        {row.liveProducts}
        {row.pendingProducts > 0 && <span className="text-[#B45309] font-semibold"> +{row.pendingProducts}</span>}
      </span>
    ),
  },
  { key: "sales", header: "Sales (30d)", align: "right", render: (row) => <span className="font-semibold text-gray-900">{row.sales30 > 0 ? money(row.sales30) : "—"}</span> },
  { key: "balance", header: "Owed", align: "right", className: "hidden lg:table-cell", render: (row) => <span className="text-gray-700">{row.balance > 0 ? money(row.balance) : "—"}</span> },
  { key: "joined", header: "Joined", className: "hidden xl:table-cell", render: ({ vendor }) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(vendor.createdAt)}</span> },
];

export default function VendorsTab() {
  const [filter, setFilter] = useState<"all" | VendorStatus>("all");
  const [search, setSearch] = useState("");
  const { data: vendors, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("vendors"),
    queryFn: () => marketplaceAdminService.listVendors(),
  });

  const count = (status: VendorStatus) => vendors?.filter((r) => r.vendor.status === status).length;
  const term = search.trim().toLowerCase();
  const rows = (vendors ?? []).filter(
    ({ vendor }) =>
      (filter === "all" || vendor.status === filter) &&
      (!term || [vendor.business.tradingName, vendor.owner.name, vendor.owner.email].some((v) => v.toLowerCase().includes(term))),
  );
  const paged = usePaged(rows, 10);
  const pick = (key: "all" | VendorStatus) => { setFilter(key); paged.setPage(0); };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="All vendors" value={vendors?.length ?? "—"} sub="Every stage" icon={Store} tone="brand" onClick={() => pick("all")} active={filter === "all"} />
        <StatCard label="Awaiting review" value={count("submitted") ?? "—"} sub="Applications to decide" icon={ClipboardList} tone="warning" onClick={() => pick("submitted")} active={filter === "submitted"} />
        <StatCard label="Setting up" value={count("draft") ?? "—"} sub="Onboarding not finished" icon={Hourglass} tone="accent" onClick={() => pick("draft")} active={filter === "draft"} />
        <StatCard label="Active" value={count("active") ?? "—"} sub="Approved and selling" icon={CheckCircle2} tone="success" onClick={() => pick("active")} active={filter === "active"} />
      </div>

      <Card flush>
        <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex flex-col xl:flex-row xl:items-center gap-3">
          <FilterPills options={FILTERS} value={filter} onChange={(key) => pick(key as "all" | VendorStatus)} />
          <div className="xl:ml-auto xl:w-72 flex">
            <SearchInput value={search} onChange={(v) => { setSearch(v); paged.setPage(0); }} placeholder="Search vendor, owner or email" />
          </div>
        </div>

        {isError ? (
          <LoadError message="Could not load vendors." onRetry={() => void refetch()} compact />
        ) : isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState icon={Store} title="No vendors match" hint="Try a different filter or search term." />
        ) : (
          <>
            <DataTable
              rows={paged.slice}
              columns={columns}
              rowKey={(row) => row.vendor.id}
              href={(row) => `/admin/marketplace/vendors/${row.vendor.id}`}
              mobile={(row) => (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{row.vendor.business.tradingName}</p>
                      <p className="text-xs text-gray-600 truncate">{row.vendor.owner.name}</p>
                    </div>
                    <StatusBadge status={row.vendor.status} map={VENDOR_STATUS} />
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <ProgressBar percent={row.onboardingPercent} />
                    <span className="text-xs text-gray-600">{row.sales30 > 0 ? `${money(row.sales30)} in 30 days` : `${row.liveProducts} live products`}</span>
                  </div>
                </>
              )}
            />
            <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} noun="vendor" onPrev={paged.onPrev} onNext={paged.onNext} />
          </>
        )}
      </Card>
    </div>
  );
}
