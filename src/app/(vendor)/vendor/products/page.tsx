"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Package, PackagePlus, Pause, Play } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { categoryTitle, money, PRODUCT_STATUS } from "@/lib/vendorOnboarding";
import type { VendorProduct } from "@/types/marketplaceVendor";
import { useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Button,
  ButtonLink,
  Card,
  DataTable,
  EmptyState,
  FilterPills,
  fmtDate,
  LoadError,
  PageBody,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
  TableSkeleton,
  Thumb,
  ToastView,
  usePaged,
  useToast,
  type Column,
} from "@/components/vendor/ui";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "review", label: "In review" },
  { key: "action", label: "Needs action" },
  { key: "draft", label: "Drafts" },
  { key: "hidden", label: "Hidden" },
];

function matchesFilter(product: VendorProduct, filter: string) {
  switch (filter) {
    case "live": return product.status === "live";
    case "review": return product.status === "pending_review";
    case "action": return product.status === "changes_requested" || product.status === "rejected";
    case "draft": return product.status === "draft";
    case "hidden": return product.status === "paused" || product.status === "unpublished";
    default: return true;
  }
}

const totalStock = (p: VendorProduct) => p.variants.reduce((sum, v) => sum + v.stock, 0);
const fromPrice = (p: VendorProduct) => Math.min(...p.variants.map((v) => v.price));

export default function VendorProductsPage() {
  const { toast, flash } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("products"),
    queryFn: () => vendorService.listProducts(),
  });

  const togglePause = useVendorMutation(
    ({ id, paused }: { id: string; paused: boolean }) => vendorService.setProductPaused(id, paused),
    {
      onSuccess: (_r, { paused }) => flash("ok", paused ? "Product paused" : "Product is live again"),
      onError: (message) => flash("err", message),
    },
  );

  const term = search.trim().toLowerCase();
  const rows = (products ?? []).filter(
    (p) => matchesFilter(p, filter) && (!term || p.title.toLowerCase().includes(term) || p.variants.some((v) => v.sku.toLowerCase().includes(term))),
  );
  const paged = usePaged(rows, 10);
  const counts = FILTERS.map((f) => ({ ...f, label: products ? `${f.label} (${products.filter((p) => matchesFilter(p, f.key)).length})` : f.label }));

  const pauseButton = (p: VendorProduct) =>
    p.status === "live" || p.status === "paused" ? (
      <Button
        size="sm"
        variant="ghost"
        icon={p.status === "live" ? Pause : Play}
        loading={togglePause.isPending && togglePause.variables?.id === p.id}
        onClick={() => togglePause.mutate({ id: p.id, paused: p.status === "live" })}
      >
        {p.status === "live" ? "Pause" : "Resume"}
      </Button>
    ) : null;

  const columns: Column<VendorProduct>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <Link href={`/vendor/products/${p.id}`} className="flex items-center gap-3 group min-w-0">
          <Thumb src={p.images[0]} alt={p.title} />
          <span className="min-w-0">
            <span className="block font-semibold text-gray-900 group-hover:text-[#B45309] truncate max-w-64">{p.title}</span>
            <span className="block text-xs text-gray-500">{categoryTitle(p.category)}</span>
          </span>
        </Link>
      ),
    },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} map={PRODUCT_STATUS} /> },
    { key: "price", header: "Price", align: "right", render: (p) => <span className="font-semibold text-gray-900">{money(fromPrice(p))}</span> },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      render: (p) => {
        const stock = totalStock(p);
        return <span className={stock === 0 ? "text-red-600 font-semibold" : "text-gray-700"}>{stock === 0 ? "Out of stock" : stock}</span>;
      },
    },
    { key: "variants", header: "Options", align: "right", className: "hidden lg:table-cell", render: (p) => <span className="text-gray-600">{p.variants.length > 1 ? p.variants.length : "—"}</span> },
    { key: "updated", header: "Updated", className: "hidden xl:table-cell", render: (p) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(p.updatedAt)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <span className="inline-flex items-center gap-1">
          {pauseButton(p)}
          <ButtonLink size="sm" variant="secondary" href={`/vendor/products/${p.id}`}>
            Edit
          </ButtonLink>
        </span>
      ),
    },
  ];

  return (
    <>
      <ToastView toast={toast} />
      <PageHeader
        eyebrow="Products"
        title="Products"
        description="Everything you sell. New products are checked by our team before they go live."
        actions={
          <ButtonLink href="/vendor/products/new" icon={PackagePlus}>
            Add product
          </ButtonLink>
        }
      />
      <PageBody>
        <Card flush>
          <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8 flex flex-col lg:flex-row lg:items-center gap-3">
            <FilterPills options={counts} value={filter} onChange={(key) => { setFilter(key); paged.setPage(0); }} />
            <div className="lg:ml-auto lg:w-72 flex">
              <SearchInput value={search} onChange={(v) => { setSearch(v); paged.setPage(0); }} placeholder="Search by name or SKU" />
            </div>
          </div>

          {isError ? (
            <LoadError message="We could not load your products." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : products?.length === 0 ? (
            <div className="pb-8">
              <EmptyState icon={Package} title="No products yet" hint="Add your first product. It takes a couple of minutes." />
              <div className="flex justify-center">
                <ButtonLink href="/vendor/products/new" icon={PackagePlus}>
                  Add product
                </ButtonLink>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <EmptyState icon={Package} title="No products match" hint="Try a different filter or search term." />
          ) : (
            <>
              <DataTable
                rows={paged.slice}
                columns={columns}
                rowKey={(p) => p.id}
                href={(p) => `/vendor/products/${p.id}`}
                mobile={(p) => (
                  <div className="flex items-center gap-3">
                    <Thumb src={p.images[0]} alt={p.title} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {money(fromPrice(p))} · {totalStock(p) === 0 ? "Out of stock" : `${totalStock(p)} in stock`}
                      </p>
                    </div>
                    <StatusBadge status={p.status} map={PRODUCT_STATUS} />
                  </div>
                )}
              />
              <Pagination page={paged.page} pageSize={paged.pageSize} total={paged.total} noun="product" onPrev={paged.onPrev} onNext={paged.onNext} />
            </>
          )}
        </Card>
      </PageBody>
    </>
  );
}
