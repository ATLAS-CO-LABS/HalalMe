"use client";

import { useState } from "react";
import { Building2, ExternalLink, FileCheck2, LayoutGrid, Store, Truck } from "lucide-react";
import { useVendor } from "@/components/vendor/VendorProvider";
import { BusinessForm, CategoriesForm, DeliveryForm, DocumentsPanel, StoreProfileForm } from "@/components/vendor/VendorForms";
import { ButtonLink, Callout, Card, PageBody, PageHeader, Tabs } from "@/components/vendor/ui";

type TabKey = "profile" | "categories" | "delivery" | "business" | "documents";

export default function VendorStorePage() {
  const vendor = useVendor();
  const [tab, setTab] = useState<TabKey>("profile");

  return (
    <>
      <PageHeader
        eyebrow="Store"
        title={vendor.store.name}
        description="How your store appears to customers, and the details behind it."
        actions={
          <ButtonLink href={`/marketplace/sellers/${vendor.handle}`} variant="secondary" icon={ExternalLink}>
            View store page
          </ButtonLink>
        }
      >
        <Tabs
          tabs={[
            { key: "profile", label: "Profile", icon: Store },
            { key: "categories", label: "Categories", icon: LayoutGrid },
            { key: "delivery", label: "Delivery & returns", icon: Truck },
            { key: "business", label: "Business details", icon: Building2 },
            { key: "documents", label: "Documents", icon: FileCheck2 },
          ]}
          value={tab}
          onChange={setTab}
        />
      </PageHeader>

      <PageBody narrow>
        {tab === "profile" && (
          <Card title="Store profile" subtitle="Shown on your store page and next to your products.">
            <StoreProfileForm />
          </Card>
        )}
        {tab === "categories" && (
          <Card title="Categories" subtitle="The categories you can list products in.">
            <CategoriesForm />
          </Card>
        )}
        {tab === "delivery" && (
          <Card title="Delivery and returns" subtitle="Applies to every order from your store.">
            <DeliveryForm />
          </Card>
        )}
        {tab === "business" && (
          <>
            <Callout tone="info" title="Changing legal details">
              If your legal name, company number or address changes, we may ask for updated documents.
            </Callout>
            <Card title="Business details">
              <BusinessForm />
            </Card>
          </>
        )}
        {tab === "documents" && (
          <Card title="Verification documents" subtitle="Approved documents are locked. Upload a new one if something expires.">
            <DocumentsPanel />
          </Card>
        )}
      </PageBody>
    </>
  );
}
