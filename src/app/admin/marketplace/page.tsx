"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Banknote, LayoutDashboard, PackageSearch, Settings, ShoppingCart, Store } from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { PageHeader, Tabs } from "@/components/vendor/ui";
import { marketplaceKey, PreviewNote } from "./_shared";
import OverviewTab from "./OverviewTab";
import VendorsTab from "./VendorsTab";
import ProductsTab from "./ProductsTab";
import OrdersTab from "./OrdersTab";
import PayoutsTab from "./PayoutsTab";
import SettingsTab from "./SettingsTab";

const TAB_KEYS = ["overview", "vendors", "products", "orders", "payouts", "settings"] as const;
type TabKey = (typeof TAB_KEYS)[number];

function MarketplaceAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const requested = useSearchParams().get("tab");
  // The tab lives in the URL so links from elsewhere (the overview's attention
  // list, a vendor page) can open a specific one, and Back works as expected.
  const tab: TabKey = TAB_KEYS.includes(requested as TabKey) ? (requested as TabKey) : "overview";
  const setTab = (next: TabKey) => router.push(next === "overview" ? pathname : `${pathname}?tab=${next}`, { scroll: false });

  // Shares the overview's cache entry, so the badges cost no extra request.
  const { data: overview } = useQuery({ queryKey: marketplaceKey("overview"), queryFn: () => marketplaceAdminService.getOverview() });

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <PreviewNote />
      <PageHeader eyebrow="Marketplace" title="Marketplace" description="Vendors, product approvals, orders, payouts and commission.">
        <Tabs
          tabs={[
            { key: "overview", label: "Overview", icon: LayoutDashboard },
            { key: "vendors", label: "Vendors", icon: Store, count: overview?.applicationsWaiting },
            { key: "products", label: "Products", icon: PackageSearch, count: overview?.productsWaiting },
            { key: "orders", label: "Orders", icon: ShoppingCart },
            { key: "payouts", label: "Payouts", icon: Banknote },
            { key: "settings", label: "Settings", icon: Settings },
          ]}
          value={tab}
          onChange={setTab}
        />
      </PageHeader>

      <div className="px-4 sm:px-8 py-5">
        {tab === "overview" && <OverviewTab onOpenTab={setTab} />}
        {tab === "vendors" && <VendorsTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "payouts" && <PayoutsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

export default function AdminMarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceAdmin />
    </Suspense>
  );
}
