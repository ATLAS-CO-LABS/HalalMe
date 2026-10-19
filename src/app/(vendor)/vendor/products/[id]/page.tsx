"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { vendorKeys } from "@/components/vendor/VendorProvider";
import ProductForm from "@/components/vendor/ProductForm";
import { ButtonLink, Card, EmptyState, LoadError, PageBody, PageHeader, TableSkeleton } from "@/components/vendor/ui";

export default function VendorEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("product", id),
    queryFn: () => vendorService.getProduct(id),
  });

  if (product) {
    // Keyed on status so the form picks up a decision made elsewhere (an admin
    // approving it, for example) but a background refetch never wipes edits.
    return <ProductForm key={`${product.id}-${product.status}`} product={product} />;
  }

  return (
    <>
      <PageHeader eyebrow="Products" title={isLoading ? "Loading product" : "Product not found"} />
      <PageBody>
        <Card flush>
          {isError ? (
            <LoadError message="We could not load this product." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="pb-8">
              <EmptyState icon={Package} title="Product not found" hint="It may have been deleted, or the link is wrong." />
              <div className="flex justify-center">
                <ButtonLink href="/vendor/products">Back to products</ButtonLink>
              </div>
            </div>
          )}
        </Card>
      </PageBody>
    </>
  );
}
