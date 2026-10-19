"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, EyeOff, PackageSearch, RotateCcw, XCircle } from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { categoryTitle, money, PRODUCT_STATUS } from "@/lib/vendorOnboarding";
import type { AdminProductRow, ProductDecision, ProductStatus } from "@/types/marketplaceVendor";
import {
  Button,
  Callout,
  Card,
  DataTable,
  display,
  EmptyState,
  Field,
  FilterPills,
  fmtDate,
  LoadError,
  Modal,
  Pagination,
  SearchInput,
  StatusBadge,
  TableSkeleton,
  Textarea,
  Thumb,
  ToastView,
  usePaged,
  useToast,
  type Column,
} from "@/components/vendor/ui";
import { marketplaceKey, useCanManageMarketplace, useMarketplaceMutation } from "./_shared";

const FILTERS: { key: string; label: string; statuses: ProductStatus[] | null }[] = [
  { key: "pending", label: "Awaiting approval", statuses: ["pending_review"] },
  { key: "live", label: "Live", statuses: ["live"] },
  { key: "changes", label: "Changes requested", statuses: ["changes_requested"] },
  { key: "rejected", label: "Rejected", statuses: ["rejected"] },
  { key: "hidden", label: "Hidden", statuses: ["paused", "unpublished"] },
  { key: "all", label: "All", statuses: null },
];

const DONE_MESSAGE: Record<ProductDecision, string> = {
  approve: "Product approved and live",
  request_changes: "Changes requested from the vendor",
  reject: "Product rejected",
  unpublish: "Product unpublished",
  republish: "Product is live again",
};

/** Full listing with the decisions available for its current status. */
function ReviewPanel({ row, canManage, onDone }: { row: AdminProductRow; canManage: boolean; onDone: (message: string) => void }) {
  const { product } = row;
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const decide = useMarketplaceMutation((decision: ProductDecision) => marketplaceAdminService.decideProduct(product.id, decision, note), {
    onSuccess: (_r, decision) => onDone(DONE_MESSAGE[decision]),
    onError: setError,
  });
  const busy = (d: ProductDecision) => decide.isPending && decide.variables === d;
  const reviewable = product.status === "pending_review" || product.status === "changes_requested" || product.status === "rejected";

  return (
    <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 id="product-review-title" className={`${display.className} text-base font-bold uppercase tracking-tight text-[#102C26]`}>
            {product.title}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            <Link href={`/admin/marketplace/vendors/${product.vendorId}`} className="font-semibold text-[#102C26] underline">
              {row.vendorName}
            </Link>{" "}
            · {categoryTitle(product.category)} · updated {fmtDate(product.updatedAt)}
          </p>
        </div>
        <StatusBadge status={product.status} map={PRODUCT_STATUS} />
      </div>

      {product.images.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto mb-4">
          {product.images.map((src, i) => (
            <li key={`${i}-${src.slice(-16)}`}>
              <Thumb src={src} alt={`Photo ${i + 1}`} size={96} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-4">
          <Callout tone="warning" icon={AlertCircle}>
            This listing has no photos.
          </Callout>
        </div>
      )}

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{product.description || <span className="text-gray-400">No description.</span>}</p>

      <table className="w-full text-sm border border-[#102C26]/12 mb-4">
        <thead>
          <tr className="bg-gray-50/60 border-b border-[#102C26]/12 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">
            <th scope="col" className="px-3 py-2 text-left">Option</th>
            <th scope="col" className="px-3 py-2 text-left">SKU</th>
            <th scope="col" className="px-3 py-2 text-right">Price</th>
            <th scope="col" className="px-3 py-2 text-right">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#102C26]/8">
          {product.variants.map((v) => (
            <tr key={v.id}>
              <td className="px-3 py-2 text-gray-900">{v.name}</td>
              <td className="px-3 py-2 text-gray-600 font-mono text-xs">{v.sku || "—"}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-900">{money(v.price)}</td>
              <td className="px-3 py-2 text-right tabular-nums text-gray-700">{v.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {product.reviewNote && (
        <div className="mb-4">
          <Callout tone="info" title="Last note to the vendor">
            {product.reviewNote}
          </Callout>
        </div>
      )}

      {canManage ? (
        <>
          {product.status !== "paused" && product.status !== "unpublished" && (
            <Field label="Note to the vendor" hint="Required when requesting changes, rejecting or unpublishing." optional>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Please add the fabric composition to the description." />
            </Field>
          )}
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2 mt-4">
            {reviewable && (
              <>
                <Button variant="ghost" icon={XCircle} loading={busy("reject")} onClick={() => decide.mutate("reject")} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Reject
                </Button>
                <Button variant="secondary" icon={RotateCcw} loading={busy("request_changes")} onClick={() => decide.mutate("request_changes")}>
                  Request changes
                </Button>
                <Button icon={CheckCircle2} loading={busy("approve")} onClick={() => decide.mutate("approve")}>
                  Approve
                </Button>
              </>
            )}
            {product.status === "live" && (
              <Button variant="danger" icon={EyeOff} loading={busy("unpublish")} onClick={() => decide.mutate("unpublish")}>
                Unpublish
              </Button>
            )}
            {product.status === "unpublished" && (
              <Button icon={CheckCircle2} loading={busy("republish")} onClick={() => decide.mutate("republish")}>
                Republish
              </Button>
            )}
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500">You have view-only access to the marketplace.</p>
      )}
    </div>
  );
}

export default function ProductsTab() {
  const canManage = useCanManageMarketplace();
  const { toast, flash } = useToast();
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("products"),
    queryFn: () => marketplaceAdminService.listProducts(),
  });

  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const inFilter = (row: AdminProductRow, statuses: ProductStatus[] | null) => !statuses || statuses.includes(row.product.status);
  const term = search.trim().toLowerCase();
  const rows = (products ?? []).filter(
    (row) => inFilter(row, active.statuses) && (!term || row.product.title.toLowerCase().includes(term) || row.vendorName.toLowerCase().includes(term)),
  );
  const paged = usePaged(rows, 10);
  // Read from the live list so the panel reflects a decision as soon as it lands.
  const reviewing = products?.find((row) => row.product.id === reviewingId) ?? null;

  const columns: Column<AdminProductRow>[] = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <span className="flex items-center gap-3 min-w-0">
          <Thumb src={row.product.images[0]} alt={row.product.title} />
          <span className="min-w-0">
            <span className="block font-semibold text-gray-900 truncate max-w-60">{row.product.title}</span>
            <span className="block text-xs text-gray-500 truncate max-w-60">{row.vendorName}</span>
          </span>
        </span>
      ),
    },
    { key: "category", header: "Category", className: "hidden lg:table-cell", render: (row) => <span className="text-gray-600">{categoryTitle(row.product.category)}</span> },
    { key: "price", header: "Price", align: "right", render: (row) => <span className="font-semibold text-gray-900">{money(row.price)}</span> },
    { key: "stock", header: "Stock", align: "right", className: "hidden lg:table-cell", render: (row) => <span className={row.totalStock === 0 ? "text-red-600 font-semibold" : "text-gray-700"}>{row.totalStock}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.product.status} map={PRODUCT_STATUS} /> },
    { key: "updated", header: "Updated", className: "hidden xl:table-cell", render: (row) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(row.product.updatedAt)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button size="sm" variant={row.product.status === "pending_review" ? "primary" : "secondary"} onClick={() => setReviewingId(row.product.id)}>
          {row.product.status === "pending_review" ? "Review" : "View"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <ToastView toast={toast} />
      <Card flush>
        <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex flex-col xl:flex-row xl:items-center gap-3">
          <FilterPills
            options={FILTERS.map((f) => ({ key: f.key, label: products ? `${f.label} (${products.filter((row) => inFilter(row, f.statuses)).length})` : f.label }))}
            value={filter}
            onChange={(key) => { setFilter(key); paged.setPage(0); }}
          />
          <div className="xl:ml-auto xl:w-72 flex">
            <SearchInput value={search} onChange={(v) => { setSearch(v); paged.setPage(0); }} placeholder="Search product or vendor" />
          </div>
        </div>

        {isError ? (
          <LoadError message="Could not load products." onRetry={() => void refetch()} compact />
        ) : isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={filter === "pending" && !term ? "The approval queue is empty" : "No products match"}
            hint={filter === "pending" && !term ? "New listings from vendors will appear here for review." : "Try a different filter or search term."}
          />
        ) : (
          <>
            <DataTable
              rows={paged.slice}
              columns={columns}
              rowKey={(row) => row.product.id}
              mobile={(row) => (
                <div className="flex items-center gap-3">
                  <Thumb src={row.product.images[0]} alt={row.product.title} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{row.product.title}</p>
                    <p className="text-xs text-gray-500 truncate">{row.vendorName} · {money(row.price)}</p>
                    <div className="mt-1.5"><StatusBadge status={row.product.status} map={PRODUCT_STATUS} /></div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setReviewingId(row.product.id)}>
                    {row.product.status === "pending_review" ? "Review" : "View"}
                  </Button>
                </div>
              )}
            />
            <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} noun="product" onPrev={paged.onPrev} onNext={paged.onNext} />
          </>
        )}
      </Card>

      <Modal open={reviewing !== null} onClose={() => setReviewingId(null)} labelledBy="product-review-title" maxWidth="max-w-2xl">
        {reviewing && (
          <ReviewPanel
            key={reviewing.product.id}
            row={reviewing}
            canManage={canManage}
            onDone={(message) => {
              setReviewingId(null);
              flash("ok", message);
            }}
          />
        )}
      </Modal>
    </>
  );
}
