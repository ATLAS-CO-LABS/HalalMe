"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Banknote, CalendarClock, Hourglass, Landmark, Percent, Receipt, Wallet } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { money, PAYOUT_STATUS } from "@/lib/vendorOnboarding";
import type { Payout, Transaction } from "@/types/marketplaceVendor";
import { useVendor, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Badge,
  ButtonLink,
  Callout,
  Card,
  DataTable,
  DetailList,
  EmptyState,
  FilterPills,
  fmtDate,
  LoadError,
  PageBody,
  PageHeader,
  Pagination,
  StatCard,
  StatusBadge,
  TableSkeleton,
  Tabs,
  usePaged,
  type Column,
} from "@/components/vendor/ui";

type TabKey = "payouts" | "transactions";

const TX_LABEL: Record<Transaction["type"], { label: string; tone: "green" | "gray" | "red" | "blue" }> = {
  sale: { label: "Sale", tone: "green" },
  commission: { label: "Commission", tone: "gray" },
  refund: { label: "Refund", tone: "red" },
  payout: { label: "Payout", tone: "blue" },
};

const payoutColumns: Column<Payout>[] = [
  { key: "ref", header: "Reference", render: (p) => <span className="font-semibold text-gray-900 font-mono text-xs">{p.reference}</span> },
  { key: "period", header: "Period", render: (p) => <span className="text-gray-700 whitespace-nowrap">{fmtDate(p.periodStart)} to {fmtDate(p.periodEnd)}</span> },
  { key: "orders", header: "Orders", align: "right", className: "hidden lg:table-cell", render: (p) => <span className="text-gray-600">{p.orderCount}</span> },
  { key: "amount", header: "Amount", align: "right", render: (p) => <span className="font-semibold text-gray-900">{money(p.amount)}</span> },
  { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} map={PAYOUT_STATUS} /> },
  { key: "paid", header: "Paid on", className: "hidden lg:table-cell", render: (p) => <span className="text-gray-600 whitespace-nowrap">{p.paidAt ? fmtDate(p.paidAt) : "—"}</span> },
];

const txColumns: Column<Transaction>[] = [
  { key: "date", header: "Date", render: (t) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(t.at)}</span> },
  { key: "type", header: "Type", render: (t) => <Badge label={TX_LABEL[t.type].label} tone={TX_LABEL[t.type].tone} /> },
  { key: "desc", header: "Description", render: (t) => <span className="text-gray-900">{t.description}</span> },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (t) => <span className={`font-semibold ${t.amount < 0 ? "text-gray-700" : "text-green-700"}`}>{t.amount < 0 ? "−" : "+"}{money(Math.abs(t.amount))}</span>,
  },
];

export default function VendorEarningsPage() {
  const vendor = useVendor();
  const [tab, setTab] = useState<TabKey>("payouts");
  const [txType, setTxType] = useState("all");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("earnings"),
    queryFn: () => vendorService.getEarnings(),
  });

  const transactions = (data?.transactions ?? []).filter((t) => txType === "all" || t.type === txType);
  const txPaged = usePaged(transactions, 12);
  const payoutPaged = usePaged(data?.payouts ?? [], 10);
  const hasBank = vendor.payout.accountNumber.trim() !== "";

  return (
    <>
      <PageHeader eyebrow="Earnings" title="Earnings and payouts" description="What you have earned, what HalalMe has kept as commission, and what has been paid to you." />
      <PageBody>
        {!hasBank && (
          <Callout tone="warning" icon={AlertCircle} title="Add your bank details to get paid" action={<ButtonLink size="sm" href="/vendor/settings">Add details</ButtonLink>}>
            We cannot send payouts until you have added a UK bank account.
          </Callout>
        )}

        {isError ? (
          <Card>
            <LoadError message="We could not load your earnings." onRetry={() => void refetch()} compact />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Available balance" value={data ? money(data.available) : "—"} sub="Delivered, ready for payout" icon={Wallet} tone="success" />
              <StatCard label="Pending" value={data ? money(data.pending) : "—"} sub="Orders not yet delivered" icon={Hourglass} tone="warning" />
              <StatCard label="Paid to you" value={data ? money(data.lifetimePaid) : "—"} sub="All time" icon={Banknote} tone="brand" />
              <StatCard label="Commission paid" value={data ? money(data.lifetimeCommission) : "—"} sub={data ? `On ${money(data.lifetimeSales)} of sales` : "All time"} icon={Percent} tone="accent" />
            </div>

            <div className="grid lg:grid-cols-3 gap-5 items-start">
              <Card flush className="lg:col-span-2">
                <div className="px-4 sm:px-5 border-b border-[#102C26]/8">
                  <div className="-mt-4">
                    <Tabs
                      tabs={[
                        { key: "payouts", label: "Payouts", icon: Landmark },
                        { key: "transactions", label: "Transactions", icon: Receipt },
                      ]}
                      value={tab}
                      onChange={setTab}
                    />
                  </div>
                </div>

                {isLoading || !data ? (
                  <TableSkeleton />
                ) : tab === "payouts" ? (
                  data.payouts.length === 0 ? (
                    <EmptyState icon={Landmark} title="No payouts yet" hint="Your first payout is sent after your first delivered orders." />
                  ) : (
                    <>
                      <DataTable
                        rows={payoutPaged.slice}
                        columns={payoutColumns}
                        rowKey={(p) => p.id}
                        mobile={(p) => (
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900 tabular-nums">{money(p.amount)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{fmtDate(p.periodStart)} to {fmtDate(p.periodEnd)}</p>
                            </div>
                            <StatusBadge status={p.status} map={PAYOUT_STATUS} />
                          </div>
                        )}
                      />
                      <Pagination page={payoutPaged.page} pageSize={payoutPaged.pageSize} total={payoutPaged.total} noun="payout" onPrev={payoutPaged.onPrev} onNext={payoutPaged.onNext} />
                    </>
                  )
                ) : (
                  <>
                    <div className="px-4 sm:px-5 py-3 border-b border-[#102C26]/8">
                      <FilterPills
                        options={[
                          { key: "all", label: "All" },
                          { key: "sale", label: "Sales" },
                          { key: "commission", label: "Commission" },
                          { key: "refund", label: "Refunds" },
                          { key: "payout", label: "Payouts" },
                        ]}
                        value={txType}
                        onChange={(key) => { setTxType(key); txPaged.setPage(0); }}
                      />
                    </div>
                    {transactions.length === 0 ? (
                      <EmptyState icon={Receipt} title="No transactions" hint="Nothing of this type yet." />
                    ) : (
                      <>
                        <DataTable
                          rows={txPaged.slice}
                          columns={txColumns}
                          rowKey={(t) => t.id}
                          mobile={(t) => (
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm text-gray-900 truncate">{t.description}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{fmtDate(t.at)} · {TX_LABEL[t.type].label}</p>
                              </div>
                              <span className={`font-semibold tabular-nums shrink-0 ${t.amount < 0 ? "text-gray-700" : "text-green-700"}`}>
                                {t.amount < 0 ? "−" : "+"}{money(Math.abs(t.amount))}
                              </span>
                            </div>
                          )}
                        />
                        <Pagination page={txPaged.page} pageSize={txPaged.pageSize} total={txPaged.total} noun="transaction" onPrev={txPaged.onPrev} onNext={txPaged.onNext} />
                      </>
                    )}
                  </>
                )}
              </Card>

              <div className="space-y-5">
                <Card title="Next payout">
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarClock size={18} className="text-[#B45309] shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#102C26]">{data ? fmtDate(data.nextPayoutDate) : "—"}</p>
                      <p className="text-xs text-gray-500">Estimated {data ? money(data.available) : ""}</p>
                    </div>
                  </div>
                  <DetailList
                    rows={[
                      { label: "Commission rate", value: data ? `${data.commissionRate}%` : "—" },
                      { label: "Paid into", value: hasBank ? `Account ending ${vendor.payout.accountNumber.slice(-4)}` : "" },
                    ]}
                  />
                  <p className="text-xs text-gray-500 mt-4">
                    HalalMe keeps its commission on each sale and pays you the rest. Money for an order is released
                    once it is marked delivered.{" "}
                    <Link href="/vendor/support" className="font-semibold text-[#102C26] underline">
                      Ask a question
                    </Link>
                  </p>
                </Card>
              </div>
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
