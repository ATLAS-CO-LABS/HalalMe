"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Banknote, CheckCircle2, Hourglass, Landmark, Send } from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { money, PAYOUT_STATUS } from "@/lib/vendorOnboarding";
import type { AdminPayoutDue, AdminPayoutsData } from "@/types/marketplaceVendor";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  fmtDate,
  LoadError,
  Pagination,
  StatCard,
  StatusBadge,
  TableSkeleton,
  ToastView,
  usePaged,
  useToast,
  type Column,
} from "@/components/vendor/ui";
import { marketplaceKey, useCanManageMarketplace, useMarketplaceMutation } from "./_shared";

type HistoryRow = AdminPayoutsData["history"][number];

export default function PayoutsTab() {
  const canManage = useCanManageMarketplace();
  const { toast, flash } = useToast();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("payouts"),
    queryFn: () => marketplaceAdminService.getPayouts(),
  });

  const create = useMarketplaceMutation((vendorId: string) => marketplaceAdminService.createPayout(vendorId), {
    onSuccess: (payout) => flash("ok", `Payout of ${money(payout.amount)} created`),
    onError: (message) => flash("err", message),
  });
  const markPaid = useMarketplaceMutation((payoutId: string) => marketplaceAdminService.markPayoutPaid(payoutId), {
    onSuccess: () => flash("ok", "Payout marked as paid"),
    onError: (message) => flash("err", message),
  });

  const history = usePaged(data?.history ?? [], 10);
  const processing = data?.history.filter((p) => p.status === "processing") ?? [];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const paidThisMonth = (data?.history ?? [])
    .filter((p) => p.status === "paid" && p.paidAt && new Date(p.paidAt) >= monthStart)
    .reduce((sum, p) => sum + p.amount, 0);

  /** Why a vendor cannot be paid yet, or null when they can. */
  const blocker = (row: AdminPayoutDue) =>
    !row.hasBankDetails ? "No bank details" : data && row.amount < data.minimumPayout ? `Below ${money(data.minimumPayout)} minimum` : null;

  const payButton = (row: AdminPayoutDue) =>
    blocker(row) ? (
      <Badge label={blocker(row)!} tone="gray" />
    ) : canManage ? (
      <Button size="sm" icon={Send} loading={create.isPending && create.variables === row.vendorId} onClick={() => create.mutate(row.vendorId)}>
        Create payout
      </Button>
    ) : null;

  const paidButton = (row: HistoryRow) =>
    row.status === "processing" && canManage ? (
      <Button size="sm" variant="secondary" icon={CheckCircle2} loading={markPaid.isPending && markPaid.variables === row.id} onClick={() => markPaid.mutate(row.id)}>
        Mark as paid
      </Button>
    ) : null;

  const vendorLink = (id: string, name: string) => (
    <Link href={`/admin/marketplace/vendors/${id}`} className="font-semibold text-gray-900 hover:text-[#B45309]">
      {name}
    </Link>
  );

  const dueColumns: Column<AdminPayoutDue>[] = [
    { key: "vendor", header: "Vendor", render: (row) => vendorLink(row.vendorId, row.vendorName) },
    { key: "orders", header: "Delivered orders", align: "right", render: (row) => <span className="text-gray-700">{row.orderCount}</span> },
    { key: "amount", header: "Owed", align: "right", render: (row) => <span className="font-semibold text-gray-900">{money(row.amount)}</span> },
    { key: "action", header: "", align: "right", render: payButton },
  ];

  const historyColumns: Column<HistoryRow>[] = [
    { key: "ref", header: "Reference", render: (row) => <span className="font-mono text-xs font-semibold text-gray-900">{row.reference}</span> },
    { key: "vendor", header: "Vendor", render: (row) => vendorLink(row.vendorId, row.vendorName) },
    { key: "period", header: "Period", className: "hidden lg:table-cell", render: (row) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(row.periodStart)} to {fmtDate(row.periodEnd)}</span> },
    { key: "amount", header: "Amount", align: "right", render: (row) => <span className="font-semibold text-gray-900">{money(row.amount)}</span> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} map={PAYOUT_STATUS} /> },
    { key: "paid", header: "Paid on", className: "hidden xl:table-cell", render: (row) => <span className="text-gray-600 whitespace-nowrap">{row.paidAt ? fmtDate(row.paidAt) : "—"}</span> },
    { key: "action", header: "", align: "right", render: paidButton },
  ];

  if (isError) {
    return (
      <Card>
        <LoadError message="Could not load payouts." onRetry={() => void refetch()} compact />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <ToastView toast={toast} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Owed to vendors" value={data ? money(data.due.reduce((sum, r) => sum + r.amount, 0)) : "—"} sub={data ? `${data.due.length} vendor${data.due.length === 1 ? "" : "s"}` : "Delivered, not yet paid"} icon={Banknote} tone="warning" />
        <StatCard label="Processing" value={data ? money(processing.reduce((sum, p) => sum + p.amount, 0)) : "—"} sub={`${processing.length} transfer${processing.length === 1 ? "" : "s"} in progress`} icon={Hourglass} tone="accent" />
        <StatCard label="Paid this month" value={data ? money(paidThisMonth) : "—"} sub="Sent to vendors" icon={CheckCircle2} tone="success" />
      </div>

      <Card title="Ready to pay" subtitle="Money from delivered orders that has not been included in a payout yet." flush>
        {isLoading || !data ? (
          <TableSkeleton />
        ) : data.due.length === 0 ? (
          <EmptyState icon={Banknote} title="Nothing owed" hint="Every delivered order has been included in a payout." />
        ) : (
          <DataTable
            rows={data.due}
            columns={dueColumns}
            rowKey={(row) => row.vendorId}
            mobile={(row) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{row.vendorName}</p>
                  <p className="text-xs text-gray-600">{money(row.amount)} from {row.orderCount} order{row.orderCount === 1 ? "" : "s"}</p>
                </div>
                {payButton(row)}
              </div>
            )}
          />
        )}
      </Card>

      <Card title="Payout history" subtitle="Mark a payout as paid once the bank transfer has been sent." flush>
        {isLoading || !data ? (
          <TableSkeleton />
        ) : data.history.length === 0 ? (
          <EmptyState icon={Landmark} title="No payouts yet" hint="Payouts you create will be listed here." />
        ) : (
          <>
            <DataTable
              rows={history.slice}
              columns={historyColumns}
              rowKey={(row) => row.id}
              mobile={(row) => (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{row.vendorName}</p>
                      <p className="text-xs text-gray-600">{money(row.amount)} · {fmtDate(row.periodEnd)}</p>
                    </div>
                    <StatusBadge status={row.status} map={PAYOUT_STATUS} />
                  </div>
                  {paidButton(row)}
                </div>
              )}
            />
            <Pagination page={history.page} pageSize={history.pageSize} total={history.total} noun="payout" onPrev={history.onPrev} onNext={history.onNext} />
          </>
        )}
      </Card>
    </div>
  );
}
