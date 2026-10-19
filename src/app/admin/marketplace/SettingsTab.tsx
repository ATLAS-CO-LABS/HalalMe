"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { marketplaceAdminService } from "@/services/marketplaceAdminService";
import { VENDOR_CATEGORIES } from "@/lib/vendorOnboarding";
import type { MarketplaceSettings } from "@/types/marketplaceVendor";
import { Button, Callout, Card, Field, Input, LoadError, MoneyInput, Select, TableSkeleton, Toggle } from "@/components/vendor/ui";
import { marketplaceKey, useCanManageMarketplace, useMarketplaceMutation } from "./_shared";

const validRate = (value: string) => value.trim() !== "" && Number(value) >= 0 && Number(value) <= 50;

function SettingsForm({ settings, canManage }: { settings: MarketplaceSettings; canManage: boolean }) {
  // An editable draft seeded once from the server, so a background refetch
  // (window focus, another tab) never wipes a half-finished edit.
  const [draft, setDraft] = useState(settings);
  const [defaultRate, setDefaultRate] = useState(String(settings.defaultCommissionRate));
  const [categoryRates, setCategoryRates] = useState<Record<string, string>>(
    Object.fromEntries(VENDOR_CATEGORIES.map((c) => [c.handle, settings.categoryRates[c.handle] !== undefined ? String(settings.categoryRates[c.handle]) : ""])),
  );
  const [minimumPayout, setMinimumPayout] = useState(String(settings.minimumPayout));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = useMarketplaceMutation((next: MarketplaceSettings) => marketplaceAdminService.saveSettings(next), {
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: setError,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const overrides = Object.entries(categoryRates).filter(([, value]) => value.trim() !== "");
    if (!validRate(defaultRate) || overrides.some(([, value]) => !validRate(value))) {
      return setError("Commission rates must be between 0 and 50 percent.");
    }
    setError(null);
    save.mutate({
      ...draft,
      defaultCommissionRate: Number(defaultRate),
      categoryRates: Object.fromEntries(overrides.map(([handle, value]) => [handle, Number(value)])),
      minimumPayout: Math.max(0, Number(minimumPayout) || 0),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-4xl">
      <fieldset disabled={!canManage} className="space-y-5 disabled:opacity-70">
        <Card title="Commission" subtitle="What HalalMe keeps from each sale. A vendor-specific rate, set on the vendor's page, overrides both of these.">
          <div className="max-w-48">
            <Field label="Default rate (%)">
              <Input type="number" min={0} max={50} step="0.5" value={defaultRate} onChange={(e) => setDefaultRate(e.target.value)} />
            </Field>
          </div>
          <div className="mt-5 pt-4 border-t border-[#102C26]/8">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">Rate by category</p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">Leave a category empty to use the default rate.</p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {VENDOR_CATEGORIES.map((category) => (
                <label key={category.handle} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-800">{category.title}</span>
                  <span className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      step="0.5"
                      placeholder={defaultRate}
                      value={categoryRates[category.handle]}
                      onChange={(e) => setCategoryRates((rates) => ({ ...rates, [category.handle]: e.target.value }))}
                      className="w-20 text-right"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-1 border-t border-[#102C26]/8">
            <Toggle
              label="Charge commission on delivery"
              description="When off, commission applies to the price of items only."
              checked={draft.commissionOnShipping}
              onChange={(on) => setDraft((d) => ({ ...d, commissionOnShipping: on }))}
            />
          </div>
        </Card>

        <Card title="Payouts" subtitle="How and when vendors are paid.">
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
            <Field label="Schedule">
              <Select
                value={draft.payoutSchedule}
                onChange={(e) => setDraft((d) => ({ ...d, payoutSchedule: e.target.value as MarketplaceSettings["payoutSchedule"] }))}
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "fortnightly", label: "Every two weeks" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            </Field>
            <Field label="Minimum payout" hint="Smaller balances roll over.">
              <MoneyInput value={minimumPayout} onChange={setMinimumPayout} />
            </Field>
          </div>
        </Card>

        <Card title="Listings and standards">
          <div className="divide-y divide-[#102C26]/8 -my-3">
            <Toggle
              label="Review products before they go live"
              description="When off, a product goes live the moment a vendor submits it."
              checked={draft.productApprovalRequired}
              onChange={(on) => setDraft((d) => ({ ...d, productApprovalRequired: on }))}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mt-5 pt-4 border-t border-[#102C26]/8">
            <Field label="Default low stock alert" hint="Applied to new products.">
              <Input type="number" min={0} value={draft.defaultLowStockAt} onChange={(e) => setDraft((d) => ({ ...d, defaultLowStockAt: Math.max(0, Number(e.target.value) || 0) }))} />
            </Field>
            <Field label="Minimum returns window (days)" hint="The legal minimum is 14.">
              <Input type="number" min={14} value={draft.minimumReturnsDays} onChange={(e) => setDraft((d) => ({ ...d, minimumReturnsDays: Math.max(14, Number(e.target.value) || 14) }))} />
            </Field>
          </div>
        </Card>
      </fieldset>

      {error && (
        <Callout tone="danger" icon={AlertCircle}>
          {error}
        </Callout>
      )}

      {canManage ? (
        <div className="flex items-center gap-3">
          <Button type="submit" loading={save.isPending}>
            Save settings
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700" role="status">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
          <span className="text-xs text-gray-500">Rate changes apply to new orders only.</span>
        </div>
      ) : (
        <p className="text-xs text-gray-500">You have view-only access to the marketplace.</p>
      )}
    </form>
  );
}

export default function SettingsTab() {
  const canManage = useCanManageMarketplace();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: marketplaceKey("settings"),
    queryFn: () => marketplaceAdminService.getSettings(),
  });

  if (isError) {
    return (
      <Card>
        <LoadError message="Could not load marketplace settings." onRetry={() => void refetch()} compact />
      </Card>
    );
  }
  if (isLoading || !data) {
    return (
      <Card flush>
        <TableSkeleton />
      </Card>
    );
  }
  return <SettingsForm settings={data} canManage={canManage} />;
}
