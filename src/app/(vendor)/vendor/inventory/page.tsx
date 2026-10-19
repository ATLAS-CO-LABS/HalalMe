"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, Check, Minus, PackageX, Plus } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { PRODUCT_STATUS } from "@/lib/vendorOnboarding";
import type { ProductVariant, VendorProduct } from "@/types/marketplaceVendor";
import { useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  FilterPills,
  LoadError,
  PageBody,
  PageHeader,
  Pagination,
  SearchInput,
  StatCard,
  StatusBadge,
  TableSkeleton,
  Thumb,
  usePaged,
  type Column,
} from "@/components/vendor/ui";

interface Row {
  product: VendorProduct;
  variant: ProductVariant;
}

const level = (row: Row) => (row.variant.stock === 0 ? "out" : row.variant.stock <= row.product.lowStockAt ? "low" : "ok");

/** Inline stock editor. Saves on blur, Enter, or a step button. */
function StockEditor({ row }: { row: Row }) {
  const [value, setValue] = useState(String(row.variant.stock));
  const [justSaved, setJustSaved] = useState(false);

  // Follow the saved stock when it changes underneath us (an order, another
  // tab). Adjusted during render rather than by remounting, which would also
  // throw away the "saved" tick.
  const [seenStock, setSeenStock] = useState(row.variant.stock);
  if (seenStock !== row.variant.stock) {
    setSeenStock(row.variant.stock);
    setValue(String(row.variant.stock));
  }
  const save = useVendorMutation((stock: number) => vendorService.setStock(row.product.id, row.variant.id, stock), {
    onSuccess: () => {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    },
  });

  const commit = (next: number) => {
    const stock = Math.max(0, Math.round(next) || 0);
    setValue(String(stock));
    if (stock !== row.variant.stock) save.mutate(stock);
  };
  const label = `${row.product.title}${row.product.variants.length > 1 ? `, ${row.variant.name}` : ""}`;
  const stepClass = "w-8 h-9 flex items-center justify-center text-gray-600 hover:bg-[#102C26]/[0.06] disabled:opacity-30";

  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center border border-[#102C26]/20 bg-white">
        <button type="button" className={stepClass} aria-label={`Decrease stock of ${label}`} disabled={Number(value) <= 0} onClick={() => commit(Number(value) - 1)}>
          <Minus size={13} />
        </button>
        <input
          type="number"
          min={0}
          value={value}
          aria-label={`Stock of ${label}`}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => commit(Number(value))}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className="w-14 h-9 text-center text-sm tabular-nums text-gray-900 border-x border-[#102C26]/20 focus:outline-none focus:bg-[#F59E0B]/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button type="button" className={stepClass} aria-label={`Increase stock of ${label}`} onClick={() => commit(Number(value) + 1)}>
          <Plus size={13} />
        </button>
      </span>
      <span className="w-4" aria-live="polite">
        {justSaved && <Check size={15} className="text-green-600" aria-label="Saved" />}
      </span>
    </span>
  );
}

function LevelBadge({ row }: { row: Row }) {
  const l = level(row);
  if (l === "out") return <Badge label="Out of stock" tone="red" />;
  if (l === "low") return <Badge label="Low" tone="amber" />;
  return <Badge label="In stock" tone="green" />;
}

export default function VendorInventoryPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("products"),
    queryFn: () => vendorService.listProducts(),
  });

  const all: Row[] = (products ?? []).flatMap((product) => product.variants.map((variant) => ({ product, variant })));
  const term = search.trim().toLowerCase();
  const rows = all.filter(
    (row) =>
      (filter === "all" || level(row) === filter) &&
      (!term || row.product.title.toLowerCase().includes(term) || row.variant.sku.toLowerCase().includes(term)),
  );
  const paged = usePaged(rows, 12);
  const units = all.reduce((sum, r) => sum + r.variant.stock, 0);

  const name = (row: Row) => (
    <span className="flex items-center gap-3 min-w-0">
      <Thumb src={row.product.images[0]} alt={row.product.title} />
      <span className="min-w-0">
        <Link href={`/vendor/products/${row.product.id}`} className="block font-semibold text-gray-900 hover:text-[#B45309] truncate max-w-60">
          {row.product.title}
        </Link>
        <span className="block text-xs text-gray-500">
          {row.product.variants.length > 1 ? row.variant.name : "Single option"}
        </span>
      </span>
    </span>
  );

  const columns: Column<Row>[] = [
    { key: "product", header: "Product", render: name },
    { key: "sku", header: "SKU", className: "hidden lg:table-cell", render: (r) => <span className="text-gray-600 font-mono text-xs">{r.variant.sku || "—"}</span> },
    { key: "listing", header: "Listing", className: "hidden xl:table-cell", render: (r) => <StatusBadge status={r.product.status} map={PRODUCT_STATUS} /> },
    { key: "level", header: "Level", render: (r) => <LevelBadge row={r} /> },
    { key: "alert", header: "Alert at", align: "right", className: "hidden lg:table-cell", render: (r) => <span className="text-gray-600">{r.product.lowStockAt}</span> },
    { key: "stock", header: "Stock", align: "right", render: (r) => <StockEditor row={r} /> },
  ];

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Inventory" description="Stock for every product and option. Changes save as you make them." />
      <PageBody>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Stock lines" value={products ? all.length : "—"} sub="Products and options" icon={Boxes} tone="brand" />
          <StatCard label="Units in stock" value={products ? units.toLocaleString() : "—"} sub="Across all lines" icon={Boxes} tone="success" />
          <StatCard label="Low stock" value={products ? all.filter((r) => level(r) === "low").length : "—"} sub="At or below alert level" icon={AlertTriangle} tone="warning" onClick={() => setFilter("low")} active={filter === "low"} />
          <StatCard label="Out of stock" value={products ? all.filter((r) => level(r) === "out").length : "—"} sub="Cannot be bought" icon={PackageX} tone="danger" onClick={() => setFilter("out")} active={filter === "out"} />
        </div>

        <Card flush>
          <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex flex-col lg:flex-row lg:items-center gap-3">
            <FilterPills
              options={[
                { key: "all", label: "All" },
                { key: "low", label: "Low stock" },
                { key: "out", label: "Out of stock" },
                { key: "ok", label: "In stock" },
              ]}
              value={filter}
              onChange={(key) => { setFilter(key); paged.setPage(0); }}
            />
            <div className="lg:ml-auto lg:w-72 flex">
              <SearchInput value={search} onChange={(v) => { setSearch(v); paged.setPage(0); }} placeholder="Search by name or SKU" />
            </div>
          </div>

          {isError ? (
            <LoadError message="We could not load your inventory." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title={all.length === 0 ? "Nothing to track yet" : "No stock lines match"}
              hint={all.length === 0 ? "Stock appears here once you add a product." : "Try a different filter or search term."}
            />
          ) : (
            <>
              <DataTable
                rows={paged.slice}
                columns={columns}
                rowKey={(r) => r.variant.id}
                mobile={(r) => (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      {name(r)}
                      <LevelBadge row={r} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500 font-mono">{r.variant.sku}</span>
                      <StockEditor row={r} />
                    </div>
                  </div>
                )}
              />
              <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} noun="line" onPrev={paged.onPrev} onNext={paged.onNext} />
            </>
          )}
        </Card>
      </PageBody>
    </>
  );
}
