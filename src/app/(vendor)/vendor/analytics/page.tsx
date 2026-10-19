"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Package, PoundSterling, Receipt, RotateCcw, ShoppingCart } from "lucide-react";
import { BarList, BarSeries, CHART_COLORS, ChartCard, Donut, TimeSeries } from "@/app/admin/analytics/_charts";
import { vendorService } from "@/services/vendorService";
import { money } from "@/lib/vendorOnboarding";
import { vendorKeys } from "@/components/vendor/VendorProvider";
import { Button, Card, FilterPills, LoadError, PageBody, PageHeader, StatCard } from "@/components/vendor/ui";

const RANGES = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
];

const DONUT_COLORS = [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.blue, CHART_COLORS.magenta, "#6B7280", "#102C26"];

function ChartSkeleton() {
  return <div className="h-50 animate-pulse bg-gray-100" />;
}

export default function VendorAnalyticsPage() {
  const [range, setRange] = useState("30");
  // No keepPreviousData: a 7-day chart drawn under a "90 days" label would mislead.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("analytics", range),
    queryFn: () => vendorService.getAnalytics(Number(range)),
  });

  const exportCsv = () => {
    if (!data) return;
    const lines = ["Period,Sales (GBP),Orders", ...data.salesSeries.map((point, i) => `${point.label},${point.value.toFixed(2)},${data.ordersSeries[i]?.value ?? 0}`)];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-last-${range}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Sales reports"
        description="How your store is performing. Cancelled and refunded orders are left out of sales."
        actions={
          <>
            <FilterPills options={RANGES} value={range} onChange={setRange} />
            <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!data}>
              Export CSV
            </Button>
          </>
        }
      />
      <PageBody>
        {isError ? (
          <Card>
            <LoadError message="We could not load your reports." onRetry={() => void refetch()} compact />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard label="Sales" value={data ? money(data.sales) : "—"} sub="vs previous period" icon={PoundSterling} tone="brand" deltaPct={data?.salesDelta} />
              <StatCard label="Orders" value={data?.orders ?? "—"} sub="vs previous period" icon={ShoppingCart} tone="accent" deltaPct={data?.ordersDelta} />
              <StatCard label="Average order" value={data ? money(data.averageOrder) : "—"} sub="Per order" icon={Receipt} tone="success" />
              <StatCard label="Units sold" value={data?.unitsSold ?? "—"} sub="Items shipped or due" icon={Package} tone="brand" />
              <StatCard label="Refund rate" value={data ? `${data.refundRate}%` : "—"} sub="Of all orders" icon={RotateCcw} tone={data && data.refundRate > 5 ? "danger" : "success"} />
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <ChartCard title="Sales" subtitle={`Last ${range} days`}>
                {isLoading || !data ? <ChartSkeleton /> : <TimeSeries data={data.salesSeries} format={(n) => `£${Math.round(n)}`} />}
              </ChartCard>
              <ChartCard title="Orders" subtitle={`Last ${range} days`}>
                {isLoading || !data ? <ChartSkeleton /> : <BarSeries data={data.ordersSeries} color={CHART_COLORS.amber} />}
              </ChartCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-5 items-start">
              <div className="lg:col-span-2">
                <ChartCard title="Best sellers" subtitle="By sales value">
                  {isLoading || !data ? <ChartSkeleton /> : <BarList data={data.topProducts} format={(n) => money(n)} />}
                </ChartCard>
              </div>
              <div className="space-y-5">
                <ChartCard title="Sales by category">
                  {isLoading || !data ? (
                    <ChartSkeleton />
                  ) : (
                    <Donut
                      segments={data.byCategory.map((c, i) => ({ ...c, color: DONUT_COLORS[i % DONUT_COLORS.length] }))}
                      centerLabel="Sales"
                      centerValue={`£${Math.round(data.sales).toLocaleString()}`}
                    />
                  )}
                </ChartCard>
                <ChartCard title="Orders by status">
                  {isLoading || !data ? <ChartSkeleton /> : <BarList data={data.byStatus} color={CHART_COLORS.blue} />}
                </ChartCard>
              </div>
            </div>
          </>
        )}
      </PageBody>
    </>
  );
}
