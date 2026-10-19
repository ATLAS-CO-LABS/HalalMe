"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Banknote,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Package,
  Percent,
  PoundSterling,
  RotateCcw,
  ShoppingCart,
  Store,
  X,
  XCircle,
} from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import {
  BUSINESS_TYPES,
  categoryTitle,
  docLabel,
  money,
  onboardingProgress,
  ORDER_STATUS,
  PAYOUT_STATUS,
  PRODUCT_STATUS,
  requiredDocsApproved,
  VENDOR_DOC_TYPES,
  VENDOR_STATUS,
} from "@/lib/vendorOnboarding";
import type { AdminVendorDetail, VendorDecision, VendorDocument, VendorOrder, VendorProduct, Payout } from "@/types/marketplaceVendor";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  ConfirmDialog,
  DataTable,
  DetailList,
  EmptyState,
  Field,
  fmtDate,
  Input,
  LoadError,
  PageHeader,
  StatCard,
  StatusBadge,
  TableSkeleton,
  Tabs,
  Thumb,
  ToastView,
  useToast,
  type Column,
} from "@/components/vendor/ui";
import { marketplaceKey, PreviewNote, useCanManageMarketplace, useMarketplaceMutation } from "../../_shared";

type TabKey = "application" | "products" | "orders" | "finance";

const DECISIONS: Record<VendorDecision, { title: string; body: string; confirm: string; danger: boolean; note: "required" | "none"; noteLabel: string; done: string }> = {
  approve: { title: "Approve this vendor?", body: "Their store becomes active and they can start listing products. They are notified straight away.", confirm: "Approve vendor", danger: false, note: "none", noteLabel: "", done: "Vendor approved" },
  request_changes: { title: "Request changes", body: "The application goes back to the vendor to fix and resubmit.", confirm: "Send back to vendor", danger: false, note: "required", noteLabel: "What needs to change", done: "Changes requested" },
  reject: { title: "Reject this application?", body: "The application is closed. The vendor sees your reason.", confirm: "Reject application", danger: true, note: "required", noteLabel: "Reason shown to the vendor", done: "Application rejected" },
  suspend: { title: "Suspend this vendor?", body: "Their live products are unpublished and they cannot take new orders. Existing orders still need fulfilling.", confirm: "Suspend vendor", danger: true, note: "required", noteLabel: "Reason shown to the vendor", done: "Vendor suspended" },
  reactivate: { title: "Reactivate this vendor?", body: "Their store becomes active again and unpublished products go back on sale.", confirm: "Reactivate vendor", danger: false, note: "none", noteLabel: "", done: "Vendor reactivated" },
};

export default function AdminVendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("vendor", { id }),
    queryFn: () => marketplaceAdminService.getVendor(id),
  });

  // Keyed so tab and draft state reset when stepping from one vendor to another.
  if (data) return <VendorDetail key={data.vendor.id} detail={data} />;

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <PageHeader eyebrow="Marketplace" title={isLoading ? "Loading vendor" : "Vendor not found"} />
      <div className="px-4 sm:px-8 py-5">
        <Card flush>
          {isError ? (
            <LoadError message="Could not load this vendor." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="pb-8">
              <EmptyState icon={Store} title="Vendor not found" hint="They may have been removed, or the link is wrong." />
              <div className="flex justify-center">
                <ButtonLink href="/admin/marketplace?tab=vendors">Back to vendors</ButtonLink>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function VendorDetail({ detail }: { detail: AdminVendorDetail }) {
  const { vendor } = detail;
  const canManage = useCanManageMarketplace();
  const { toast, flash } = useToast();
  const [tab, setTab] = useState<TabKey>("application");
  const [pending, setPending] = useState<VendorDecision | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const decide = useMarketplaceMutation(
    ({ decision, note }: { decision: VendorDecision; note: string }) => marketplaceAdminService.decideVendor(vendor.id, decision, note),
    {
      onSuccess: (_r, { decision }) => {
        setPending(null);
        flash("ok", DECISIONS[decision].done);
      },
      onError: setDecisionError,
    },
  );
  const ask = (decision: VendorDecision) => { setDecisionError(null); setPending(decision); };

  const docsApproved = requiredDocsApproved(vendor);
  const inReview = vendor.status === "submitted" || vendor.status === "changes_requested";
  const config = pending ? DECISIONS[pending] : null;

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <ToastView toast={toast} />
      <PreviewNote />
      <PageHeader
        eyebrow="Marketplace vendor"
        title={vendor.business.tradingName}
        description={`${vendor.owner.name} · ${vendor.business.city} · joined ${fmtDate(vendor.createdAt)}`}
        actions={
          <>
            <ButtonLink href="/admin/marketplace?tab=vendors" variant="ghost" icon={ArrowLeft}>
              Vendors
            </ButtonLink>
            <StatusBadge status={vendor.status} map={VENDOR_STATUS} />
            {canManage && inReview && (
              <>
                <Button variant="ghost" icon={XCircle} onClick={() => ask("reject")} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Reject
                </Button>
                <Button variant="secondary" icon={RotateCcw} onClick={() => ask("request_changes")}>
                  Request changes
                </Button>
                <Button icon={CheckCircle2} onClick={() => ask("approve")} disabled={!docsApproved} title={docsApproved ? undefined : "Approve every required document first"}>
                  Approve
                </Button>
              </>
            )}
            {canManage && vendor.status === "active" && (
              <Button variant="danger" icon={Ban} onClick={() => ask("suspend")}>
                Suspend
              </Button>
            )}
            {canManage && vendor.status === "suspended" && (
              <Button icon={CheckCircle2} onClick={() => ask("reactivate")}>
                Reactivate
              </Button>
            )}
          </>
        }
      >
        <Tabs
          tabs={[
            { key: "application", label: "Application", icon: ClipboardList },
            { key: "products", label: "Products", icon: Package, count: detail.pendingProducts },
            { key: "orders", label: "Orders", icon: ShoppingCart },
            { key: "finance", label: "Finance", icon: Banknote },
          ]}
          value={tab}
          onChange={setTab}
        />
      </PageHeader>

      <div className="px-4 sm:px-8 py-5 space-y-5">
        {vendor.reviewNote && (
          <Callout tone={vendor.status === "changes_requested" ? "warning" : "danger"} icon={AlertCircle} title="Note sent to the vendor">
            {vendor.reviewNote}
          </Callout>
        )}
        {inReview && !docsApproved && (
          <Callout tone="info" icon={FileText} title="Documents still to review">
            Approve every required document below before approving the vendor.
          </Callout>
        )}
        {vendor.status === "draft" && (
          <Callout tone="info" icon={ClipboardList} title="Still setting up">
            This vendor has not submitted their application yet. There is nothing to decide until they do.
          </Callout>
        )}

        {tab === "application" && <ApplicationTab detail={detail} canManage={canManage} onFlash={flash} />}
        {tab === "products" && <ProductsList products={detail.products} />}
        {tab === "orders" && <OrdersList orders={detail.orders} />}
        {tab === "finance" && <FinanceTab detail={detail} canManage={canManage} onFlash={flash} />}
      </div>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={(note) => pending && decide.mutate({ decision: pending, note })}
        busy={decide.isPending}
        danger={config?.danger}
        title={config?.title ?? ""}
        body={config?.body ?? ""}
        confirmLabel={config?.confirm ?? "Confirm"}
        noteLabel={config?.note === "required" ? config.noteLabel : undefined}
        noteRequired={config?.note === "required"}
        error={decisionError}
      />
    </div>
  );
}

// ── Application ──────────────────────────────────────────────────────────────

function DocumentRow({ vendorId, type, doc, canManage, onFlash }: {
  vendorId: string;
  type: VendorDocument["type"];
  doc: VendorDocument | undefined;
  canManage: boolean;
  onFlash: (kind: "ok" | "err", message: string) => void;
}) {
  const def = VENDOR_DOC_TYPES.find((d) => d.type === type)!;
  const [rejecting, setRejecting] = useState(false);
  const review = useMarketplaceMutation(
    ({ approve, reason }: { approve: boolean; reason: string }) => marketplaceAdminService.reviewDocument(vendorId, type, approve, reason),
    {
      onSuccess: (_r, { approve }) => {
        setRejecting(false);
        onFlash("ok", approve ? "Document approved" : "Document rejected");
      },
      onError: (message) => onFlash("err", message),
    },
  );

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {docLabel(type)}
            <span className={`text-[10px] font-bold uppercase ml-2 ${def.required ? "text-[#B45309]" : "text-gray-400"}`}>{def.required ? "Required" : "Optional"}</span>
          </p>
          <p className="text-xs text-gray-500 truncate">{doc ? `${doc.fileName} · uploaded ${fmtDate(doc.uploadedAt)}` : "Not uploaded"}</p>
        </div>
        <div className="flex items-center gap-2">
          {doc ? (
            <Badge label={doc.status === "approved" ? "Approved" : doc.status === "rejected" ? "Rejected" : "To review"} tone={doc.status === "approved" ? "green" : doc.status === "rejected" ? "red" : "amber"} />
          ) : (
            <Badge label="Missing" tone="gray" />
          )}
          {doc && canManage && doc.status !== "approved" && (
            <Button size="sm" icon={Check} loading={review.isPending && review.variables?.approve} onClick={() => review.mutate({ approve: true, reason: "" })}>
              Approve
            </Button>
          )}
          {doc && canManage && doc.status !== "rejected" && (
            <Button size="sm" variant="secondary" icon={X} onClick={() => setRejecting(true)}>
              Reject
            </Button>
          )}
        </div>
      </div>
      {doc?.status === "rejected" && doc.rejectionReason && <p className="text-xs text-red-700 mt-1.5">Reason: {doc.rejectionReason}</p>}

      <ConfirmDialog
        open={rejecting}
        onClose={() => setRejecting(false)}
        onConfirm={(reason) => review.mutate({ approve: false, reason })}
        busy={review.isPending}
        danger
        title={`Reject ${docLabel(type).toLowerCase()}?`}
        body="The vendor is told why and asked to upload a replacement."
        confirmLabel="Reject document"
        noteLabel="Reason shown to the vendor"
        notePlaceholder="e.g. The document is older than 3 months"
        noteRequired
      />
    </li>
  );
}

function ApplicationTab({ detail, canManage, onFlash }: { detail: AdminVendorDetail; canManage: boolean; onFlash: (kind: "ok" | "err", message: string) => void }) {
  const { vendor } = detail;
  const progress = onboardingProgress(vendor);

  return (
    <div className="grid lg:grid-cols-3 gap-5 items-start">
      <div className="lg:col-span-2 space-y-5">
        <Card title="Verification documents" subtitle="Each document is decided on its own. Files open from secure storage once the backend is connected.">
          <ul className="divide-y divide-[#102C26]/8">
            {VENDOR_DOC_TYPES.map((def) => (
              <DocumentRow key={def.type} vendorId={vendor.id} type={def.type} doc={vendor.documents.find((d) => d.type === def.type)} canManage={canManage} onFlash={onFlash} />
            ))}
          </ul>
        </Card>

        <Card title="Business">
          <DetailList
            rows={[
              { label: "Legal name", value: vendor.business.legalName },
              { label: "Trading name", value: vendor.business.tradingName },
              { label: "Type", value: BUSINESS_TYPES.find((t) => t.value === vendor.business.type)?.label },
              { label: "Company number", value: vendor.business.companyNumber },
              { label: "VAT number", value: vendor.business.vatNumber },
              { label: "Address", value: [vendor.business.address, vendor.business.city, vendor.business.postCode].filter(Boolean).join(", ") },
            ]}
          />
        </Card>

        <Card title="Store profile">
          <div className="flex items-start gap-4 mb-4">
            <Thumb src={vendor.store.logo} alt={vendor.store.name || vendor.business.tradingName} size={56} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#102C26]">{vendor.store.name || <span className="text-gray-400 font-normal">No store name yet</span>}</p>
              {vendor.store.tagline && <p className="text-xs text-gray-600">{vendor.store.tagline}</p>}
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{vendor.store.description || <span className="text-gray-400">No description yet.</span>}</p>
            </div>
          </div>
          <DetailList
            rows={[
              { label: "Categories", value: vendor.categories.map(categoryTitle).join(", ") },
              { label: "Support email", value: vendor.store.supportEmail },
              { label: "Couriers", value: vendor.delivery.couriers.join(", ") },
              { label: "Delivery charge", value: vendor.delivery.couriers.length ? `${money(vendor.delivery.ukRate)}${vendor.delivery.freeOver !== null ? `, free over ${money(vendor.delivery.freeOver)}` : ""}` : "" },
              { label: "Dispatch", value: vendor.delivery.dispatchDays ? `${vendor.delivery.dispatchDays} working day${vendor.delivery.dispatchDays === 1 ? "" : "s"}` : "" },
              { label: "Returns", value: vendor.delivery.returnsAddress ? `${vendor.delivery.returnsDays} days, to ${vendor.delivery.returnsAddress}` : "" },
            ]}
          />
        </Card>
      </div>

      <div className="space-y-5">
        <Card title="Onboarding" subtitle={`${progress.done} of ${progress.total} sections complete`}>
          <div className="h-1.5 bg-gray-100 overflow-hidden mb-4">
            <div className={`h-full ${progress.percent === 100 ? "bg-green-600" : "bg-[#F59E0B]"}`} style={{ width: `${progress.percent}%` }} />
          </div>
          <ul className="space-y-3">
            {progress.steps.map(({ step, missing }) => (
              <li key={step.key} className="flex items-start gap-2.5">
                {missing.length === 0 ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                  {missing.length > 0 && <p className="text-xs text-gray-500">Missing: {missing.join(", ")}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Owner">
          <DetailList
            rows={[
              { label: "Name", value: vendor.owner.name },
              { label: "Email", value: vendor.owner.email },
              { label: "Phone", value: vendor.owner.phone },
            ]}
          />
        </Card>

        <Card title="Timeline">
          <DetailList
            rows={[
              { label: "Signed up", value: fmtDate(vendor.createdAt) },
              { label: "Submitted", value: vendor.submittedAt ? fmtDate(vendor.submittedAt) : "" },
              { label: "Approved", value: vendor.approvedAt ? fmtDate(vendor.approvedAt) : "" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

// ── Products and orders ──────────────────────────────────────────────────────

const productColumns: Column<VendorProduct>[] = [
  {
    key: "product",
    header: "Product",
    render: (p) => (
      <span className="flex items-center gap-3 min-w-0">
        <Thumb src={p.images[0]} alt={p.title} />
        <span className="min-w-0">
          <span className="block font-semibold text-gray-900 truncate max-w-64">{p.title}</span>
          <span className="block text-xs text-gray-500">{categoryTitle(p.category)}</span>
        </span>
      </span>
    ),
  },
  { key: "price", header: "Price", align: "right", render: (p) => <span className="font-semibold text-gray-900">{money(Math.min(...p.variants.map((v) => v.price)))}</span> },
  { key: "stock", header: "Stock", align: "right", render: (p) => <span className="text-gray-700">{p.variants.reduce((sum, v) => sum + v.stock, 0)}</span> },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} map={PRODUCT_STATUS} /> },
  { key: "updated", header: "Updated", className: "hidden lg:table-cell", render: (p) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(p.updatedAt)}</span> },
];

function ProductsList({ products }: { products: VendorProduct[] }) {
  return (
    <Card
      title="Products"
      subtitle="Review and approve listings from the Products tab of the marketplace."
      flush
      action={
        <Link href="/admin/marketplace?tab=products" className="text-xs font-bold uppercase tracking-wide text-[#102C26] hover:text-[#B45309] whitespace-nowrap">
          Approval queue
        </Link>
      }
    >
      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" hint="This vendor has not added any products." />
      ) : (
        <DataTable
          rows={products}
          columns={productColumns}
          rowKey={(p) => p.id}
          mobile={(p) => (
            <div className="flex items-center gap-3">
              <Thumb src={p.images[0]} alt={p.title} />
              <p className="flex-1 min-w-0 font-semibold text-gray-900 truncate">{p.title}</p>
              <StatusBadge status={p.status} map={PRODUCT_STATUS} />
            </div>
          )}
        />
      )}
    </Card>
  );
}

const orderColumns: Column<VendorOrder>[] = [
  { key: "order", header: "Order", render: (o) => <span className="font-semibold text-gray-900">{o.number}</span> },
  { key: "placed", header: "Placed", render: (o) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(o.placedAt)}</span> },
  { key: "customer", header: "Customer", className: "hidden lg:table-cell", render: (o) => <span className="text-gray-700">{o.customer.name}</span> },
  { key: "total", header: "Total", align: "right", render: (o) => <span className="font-semibold text-gray-900">{money(o.total)}</span> },
  { key: "commission", header: "Commission", align: "right", className: "hidden lg:table-cell", render: (o) => <span className="text-gray-700">{money(o.commissionAmount)}</span> },
  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} map={ORDER_STATUS} /> },
];

function OrdersList({ orders }: { orders: VendorOrder[] }) {
  // The full, searchable ledger is on the marketplace Orders tab; this is the recent picture.
  const recent = orders.slice(0, 15);
  return (
    <Card title="Recent orders" subtitle={orders.length > recent.length ? `Showing the latest ${recent.length} of ${orders.length}.` : undefined} flush>
      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders yet" hint="Orders appear here once customers buy from this vendor." />
      ) : (
        <DataTable
          rows={recent}
          columns={orderColumns}
          rowKey={(o) => o.id}
          mobile={(o) => (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{o.number}</p>
                <p className="text-xs text-gray-600">{fmtDate(o.placedAt)} · {money(o.total)}</p>
              </div>
              <StatusBadge status={o.status} map={ORDER_STATUS} />
            </div>
          )}
        />
      )}
    </Card>
  );
}

// ── Finance ──────────────────────────────────────────────────────────────────

const payoutColumns: Column<Payout>[] = [
  { key: "ref", header: "Reference", render: (p) => <span className="font-mono text-xs font-semibold text-gray-900">{p.reference}</span> },
  { key: "period", header: "Period", className: "hidden lg:table-cell", render: (p) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(p.periodStart)} to {fmtDate(p.periodEnd)}</span> },
  { key: "amount", header: "Amount", align: "right", render: (p) => <span className="font-semibold text-gray-900">{money(p.amount)}</span> },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} map={PAYOUT_STATUS} /> },
];

function FinanceTab({ detail, canManage, onFlash }: { detail: AdminVendorDetail; canManage: boolean; onFlash: (kind: "ok" | "err", message: string) => void }) {
  const { vendor } = detail;
  // Editable draft, seeded once: the page is remounted per vendor by the route.
  const [rate, setRate] = useState(vendor.commissionRate === null ? "" : String(vendor.commissionRate));
  const save = useMarketplaceMutation((next: number | null) => marketplaceAdminService.setVendorCommission(vendor.id, next), {
    onSuccess: (_r, next) => onFlash("ok", next === null ? "Using the marketplace rate" : `Commission set to ${next}%`),
    onError: (message) => onFlash("err", message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rate.trim() === "") return save.mutate(null);
    const value = Number(rate);
    if (!(value >= 0 && value <= 50)) return onFlash("err", "Enter a rate between 0 and 50 percent.");
    save.mutate(value);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Lifetime sales" value={money(detail.lifetimeSales)} sub="All time" icon={PoundSterling} tone="brand" />
        <StatCard label="Commission earned" value={money(detail.lifetimeCommission)} sub="HalalMe's share" icon={Percent} tone="accent" />
        <StatCard label="Sales" value={money(detail.sales30)} sub="Last 30 days" icon={ShoppingCart} tone="brand" />
        <StatCard label="Owed to vendor" value={money(detail.balance)} sub="Delivered, not paid out" icon={Banknote} tone={detail.balance > 0 ? "warning" : "success"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <Card title="Payouts" flush className="lg:col-span-2">
          {detail.payouts.length === 0 ? (
            <EmptyState icon={Banknote} title="No payouts yet" hint="Create one from the marketplace Payouts tab once money is owed." />
          ) : (
            <DataTable
              rows={detail.payouts}
              columns={payoutColumns}
              rowKey={(p) => p.id}
              mobile={(p) => (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 tabular-nums">{money(p.amount)}</p>
                    <p className="text-xs text-gray-600">{fmtDate(p.periodEnd)}</p>
                  </div>
                  <StatusBadge status={p.status} map={PAYOUT_STATUS} />
                </div>
              )}
            />
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Commission" subtitle={`Currently paying ${detail.effectiveCommissionRate}%`}>
            <form onSubmit={submit} className="space-y-3">
              <Field label="Vendor rate (%)" hint="Leave empty to use the marketplace or category rate." optional>
                <Input type="number" min={0} max={50} step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} disabled={!canManage} placeholder="Marketplace rate" />
              </Field>
              {canManage && (
                <Button type="submit" variant="secondary" loading={save.isPending}>
                  Save rate
                </Button>
              )}
            </form>
          </Card>

          <Card title="Bank account" subtitle="Where payouts are sent.">
            <DetailList
              rows={[
                { label: "Account name", value: vendor.payout.accountName },
                { label: "Sort code", value: vendor.payout.sortCode },
                { label: "Account", value: vendor.payout.accountNumber ? `Ending ${vendor.payout.accountNumber.slice(-4)}` : "" },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
