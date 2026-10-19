"use client";

import { useState } from "react";
import { Bell, Landmark, UserRound } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { VENDOR_STATUS } from "@/lib/vendorOnboarding";
import type { VendorNotificationPrefs } from "@/types/marketplaceVendor";
import { useVendor, useVendorMutation } from "@/components/vendor/VendorProvider";
import { useVendorSignOut } from "@/components/vendor/VendorShell";
import { PayoutForm } from "@/components/vendor/VendorForms";
import { Button, ButtonLink, Card, DetailList, fmtDate, PageBody, PageHeader, StatusBadge, Tabs, Toggle } from "@/components/vendor/ui";

type TabKey = "payout" | "notifications" | "account";

const PREFS: { key: keyof VendorNotificationPrefs; label: string; description: string }[] = [
  { key: "newOrder", label: "New orders", description: "Email me as soon as a customer places an order." },
  { key: "lowStock", label: "Low stock", description: "Email me when a product reaches its alert level." },
  { key: "productReview", label: "Product reviews", description: "Email me when a product is approved or needs changes." },
  { key: "payouts", label: "Payouts", description: "Email me when a payout is sent." },
  { key: "marketing", label: "Seller tips and news", description: "Occasional advice on selling more. No more than twice a month." },
];

export default function VendorSettingsPage() {
  const vendor = useVendor();
  const signOut = useVendorSignOut();
  const [tab, setTab] = useState<TabKey>("payout");
  const savePrefs = useVendorMutation((notificationPrefs: VendorNotificationPrefs) => vendorService.updateVendor({ notificationPrefs }));

  return (
    <>
      <PageHeader eyebrow="Settings" title="Settings" description="Payout details, email preferences and your account.">
        <Tabs
          tabs={[
            { key: "payout", label: "Payout details", icon: Landmark },
            { key: "notifications", label: "Email preferences", icon: Bell },
            { key: "account", label: "Account", icon: UserRound },
          ]}
          value={tab}
          onChange={setTab}
        />
      </PageHeader>

      <PageBody narrow>
        {tab === "payout" && (
          <Card title="Bank account" subtitle="Where your payouts are sent.">
            <PayoutForm />
          </Card>
        )}

        {tab === "notifications" && (
          <Card title="Email preferences" subtitle={`Sent to ${vendor.owner.email}. Changes save straight away.`}>
            <div className="divide-y divide-[#102C26]/8 -my-3">
              {PREFS.map((pref) => (
                <Toggle
                  key={pref.key}
                  label={pref.label}
                  description={pref.description}
                  checked={vendor.notificationPrefs[pref.key]}
                  disabled={savePrefs.isPending}
                  onChange={(on) => savePrefs.mutate({ ...vendor.notificationPrefs, [pref.key]: on })}
                />
              ))}
            </div>
          </Card>
        )}

        {tab === "account" && (
          <>
            <Card title="Account">
              <DetailList
                rows={[
                  { label: "Store", value: vendor.store.name },
                  { label: "Status", value: <StatusBadge status={vendor.status} map={VENDOR_STATUS} /> },
                  { label: "Sign-in email", value: vendor.owner.email },
                  { label: "Account holder", value: vendor.owner.name },
                  { label: "Selling since", value: vendor.approvedAt ? fmtDate(vendor.approvedAt) : "" },
                ]}
              />
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[#102C26]/8">
                <ButtonLink href="/vendor/store" variant="secondary">
                  Edit business details
                </ButtonLink>
                <Button variant="ghost" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            </Card>
            <Card title="Close your store" subtitle="Stop selling on HalalMe Marketplace.">
              <p className="text-sm text-gray-600">
                Closing your store hides your products and stops new orders. Open orders still need to be fulfilled, and
                your final payout is sent once they are delivered. Our team handles closures so nothing is lost.
              </p>
              <div className="mt-4">
                <ButtonLink href="/vendor/support" variant="secondary">
                  Ask to close my store
                </ButtonLink>
              </div>
            </Card>
          </>
        )}
      </PageBody>
    </>
  );
}
