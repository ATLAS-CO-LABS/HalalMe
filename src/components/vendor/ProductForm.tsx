"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Copy, ImagePlus, Pause, Play, Plus, Send, Trash2, X } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { resizeImage } from "@/lib/resizeImage";
import { PRODUCT_STATUS, VENDOR_CATEGORIES } from "@/lib/vendorOnboarding";
import type { ProductInput, VendorProduct } from "@/types/marketplaceVendor";
import { useVendor, useVendorMutation } from "@/components/vendor/VendorProvider";
import {
  Button,
  ButtonLink,
  Callout,
  Card,
  ConfirmDialog,
  Field,
  Input,
  MoneyInput,
  PageBody,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
  ToastView,
  Toggle,
  useToast,
} from "@/components/vendor/ui";

const MAX_IMAGES = 5;

interface VariantDraft {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: string;
}

const blankVariant = (price = ""): VariantDraft => ({ id: "", name: "", sku: "", price, stock: "0" });

/** Create and edit screen for a product. Pass `product={null}` to create. */
export default function ProductForm({ product }: { product: VendorProduct | null }) {
  const router = useRouter();
  const vendor = useVendor();
  const { toast, flash } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? vendor.categories[0] ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [compareAt, setCompareAt] = useState(product?.compareAtPrice ? String(product.compareAtPrice) : "");
  const [weight, setWeight] = useState(String(product?.weightGrams ?? 250));
  const [lowStockAt, setLowStockAt] = useState(String(product?.lowStockAt ?? 5));
  const [hasOptions, setHasOptions] = useState((product?.variants.length ?? 1) > 1);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku, price: String(v.price), stock: String(v.stock) })) ?? [
      { ...blankVariant(), name: "Default" },
    ],
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [imageBusy, setImageBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = product?.status ?? "draft";
  const isPublished = status === "live" || status === "paused";
  const inReview = status === "pending_review";

  const setVariant = (index: number, patch: Partial<VariantDraft>) =>
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const toggleOptions = (on: boolean) => {
    setHasOptions(on);
    // Collapsing to a single option keeps the first row's SKU, price and stock.
    setVariants((rows) => (on ? rows.map((r, i) => (i === 0 && r.name === "Default" ? { ...r, name: "" } : r)) : [{ ...rows[0], name: "Default" }]));
  };

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    setImageBusy(true);
    try {
      const room = MAX_IMAGES - images.length;
      const added = await Promise.all([...files].slice(0, room).map((file) => resizeImage(file, 800, 800)));
      setImages((current) => [...current, ...added]);
    } catch {
      flash("err", "One of those images could not be read.");
    } finally {
      setImageBusy(false);
    }
  };

  /** Build the payload, or return the problems that stop it being saved. */
  const build = (forReview: boolean): { input: ProductInput } | { problems: string[] } => {
    const problems: string[] = [];
    if (!title.trim()) problems.push("Add a product name");
    if (!category) problems.push("Choose a category");
    if (variants.some((v) => !(Number(v.price) > 0))) problems.push("Every option needs a price above zero");
    if (hasOptions && variants.some((v) => !v.name.trim())) problems.push("Give every option a name, such as a size or colour");
    if (hasOptions && new Set(variants.map((v) => v.name.trim().toLowerCase())).size !== variants.length) problems.push("Option names must be different");
    if (forReview) {
      if (description.trim().length < 20) problems.push("Write a description of at least 20 characters");
      if (images.length === 0) problems.push("Add at least one photo");
      if (variants.some((v) => !v.sku.trim())) problems.push("Add a SKU for every option");
    }
    if (problems.length > 0) return { problems };

    return {
      input: {
        title: title.trim(),
        description: description.trim(),
        category,
        images,
        compareAtPrice: Number(compareAt) > 0 ? Number(compareAt) : null,
        weightGrams: Math.max(0, Math.round(Number(weight) || 0)),
        lowStockAt: Math.max(0, Math.round(Number(lowStockAt) || 0)),
        variants: variants.map((v) => ({
          id: v.id,
          name: hasOptions ? v.name.trim() : "Default",
          sku: v.sku.trim(),
          price: Math.round(Number(v.price) * 100) / 100,
          stock: Math.max(0, Math.round(Number(v.stock) || 0)),
        })),
      },
    };
  };

  const save = useVendorMutation(
    ({ input, submit }: { input: ProductInput; submit: boolean }) => vendorService.saveProduct(product?.id ?? null, input, submit),
    {
      onSuccess: (saved, { submit }) => {
        flash("ok", submit && !isPublished ? "Sent for review" : "Saved");
        if (!product) router.replace(`/vendor/products/${saved.id}`);
      },
      onError: (message) => flash("err", message),
    },
  );
  const pause = useVendorMutation((paused: boolean) => vendorService.setProductPaused(product!.id, paused), {
    onSuccess: (_r, paused) => flash("ok", paused ? "Product paused" : "Product is live again"),
    onError: (message) => flash("err", message),
  });
  const duplicate = useVendorMutation(() => vendorService.duplicateProduct(product!.id), {
    onSuccess: (copy) => router.push(`/vendor/products/${copy.id}`),
    onError: (message) => flash("err", message),
  });
  const remove = useVendorMutation(() => vendorService.deleteProduct(product!.id), {
    onSuccess: () => router.push("/vendor/products"),
    onError: (message) => flash("err", message),
  });

  const handleSave = (submit: boolean) => {
    // A published product is held to the full standard on every save.
    const result = build(submit || isPublished);
    if ("problems" in result) {
      setErrors(result.problems);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    save.mutate({ input: result.input, submit });
  };

  const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...VENDOR_CATEGORIES.filter((c) => vendor.categories.includes(c.handle) || c.handle === category).map((c) => ({ value: c.handle, label: c.title })),
  ];

  return (
    <>
      <ToastView toast={toast} />
      <PageHeader
        eyebrow="Products"
        title={product ? product.title : "New product"}
        actions={
          <ButtonLink href="/vendor/products" variant="ghost" icon={ArrowLeft}>
            All products
          </ButtonLink>
        }
      />

      <PageBody>
        {product?.reviewNote && (status === "changes_requested" || status === "rejected" || status === "unpublished") && (
          <Callout tone={status === "changes_requested" ? "warning" : "danger"} icon={AlertCircle} title={`${PRODUCT_STATUS[status].label} by the HalalMe team`}>
            {product.reviewNote}
          </Callout>
        )}
        {inReview && (
          <Callout tone="info" icon={AlertCircle} title="This product is being reviewed">
            You can still make changes. It will go live as soon as our team approves it.
          </Callout>
        )}
        {errors.length > 0 && (
          <Callout tone="danger" icon={AlertCircle} title="Please fix the following">
            <ul className="list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Callout>
        )}

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            <Card title="Details">
              <div className="space-y-4">
                <Field label="Product name">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder="e.g. Silk Blend Hijab" />
                </Field>
                <Field label="Description" hint="Materials, size, what is in the box, and anything a customer should know before buying.">
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={1500} />
                </Field>
                <Field
                  label="Category"
                  hint={vendor.categories.length === 0 ? "Add categories to your store first, under Store." : "Only the categories your store is approved for are shown."}
                >
                  <Select value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />
                </Field>
              </div>
            </Card>

            <Card title="Photos" subtitle={`Up to ${MAX_IMAGES}. The first photo is the one customers see in search.`}>
              <ul className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((src, i) => (
                  <li key={`${i}-${src.slice(-24)}`} className="relative aspect-square border border-[#102C26]/12 bg-gray-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URL or arbitrary host */}
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#102C26]/85 text-[#F7E7CE] text-[9px] font-bold uppercase tracking-wide text-center py-0.5">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => setImages((current) => current.filter((_, index) => index !== i))}
                      className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white/95 border border-[#102C26]/15 text-gray-700 hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
                {images.length < MAX_IMAGES && (
                  <li>
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      disabled={imageBusy}
                      className="w-full aspect-square flex flex-col items-center justify-center gap-1.5 border border-dashed border-[#102C26]/30 text-gray-500 hover:border-[#102C26] hover:text-[#102C26] transition-colors disabled:opacity-50"
                    >
                      <ImagePlus size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">{imageBusy ? "Adding" : "Add photo"}</span>
                    </button>
                  </li>
                )}
              </ul>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void addImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </Card>

            <Card title="Price and stock">
              <div className="border border-[#102C26]/12 px-4 mb-4">
                <Toggle
                  label="This product comes in options"
                  description="Turn on for sizes, colours or other choices that each have their own stock."
                  checked={hasOptions}
                  onChange={toggleOptions}
                />
              </div>

              {hasOptions ? (
                <div className="space-y-3">
                  <div className="hidden sm:grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr_auto] gap-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                    <span>Option</span>
                    <span>SKU</span>
                    <span>Price</span>
                    <span>Stock</span>
                    <span className="w-8" />
                  </div>
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.4fr_1.2fr_1fr_0.8fr_auto] gap-2 items-center pb-3 sm:pb-0 border-b sm:border-0 border-[#102C26]/8">
                      <Input aria-label={`Option ${i + 1} name`} placeholder="e.g. Medium" value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} />
                      <Input aria-label={`Option ${i + 1} SKU`} placeholder="SKU" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} />
                      <MoneyInput aria-label={`Option ${i + 1} price`} value={v.price} onChange={(value) => setVariant(i, { price: value })} />
                      <Input aria-label={`Option ${i + 1} stock`} type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} />
                      <button
                        type="button"
                        aria-label={`Remove option ${i + 1}`}
                        disabled={variants.length === 1}
                        onClick={() => setVariants((rows) => rows.filter((_, index) => index !== i))}
                        className="w-8 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <Button size="sm" variant="secondary" icon={Plus} onClick={() => setVariants((rows) => [...rows, blankVariant(rows[0]?.price)])}>
                    Add option
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Price">
                    <MoneyInput value={variants[0].price} onChange={(value) => setVariant(0, { price: value })} />
                  </Field>
                  <Field label="Stock">
                    <Input type="number" min={0} value={variants[0].stock} onChange={(e) => setVariant(0, { stock: e.target.value })} />
                  </Field>
                  <Field label="SKU" hint="Your own stock code.">
                    <Input value={variants[0].sku} onChange={(e) => setVariant(0, { sku: e.target.value })} />
                  </Field>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#102C26]/8">
                <Field label="Was price" optional hint="Shown crossed out if higher than the price.">
                  <MoneyInput value={compareAt} onChange={setCompareAt} />
                </Field>
                <Field label="Low stock alert" hint="Warn me at this many units.">
                  <Input type="number" min={0} value={lowStockAt} onChange={(e) => setLowStockAt(e.target.value)} />
                </Field>
                <Field label="Weight (grams)" hint="Packed weight, for delivery.">
                  <Input type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} />
                </Field>
              </div>
            </Card>
          </div>

          {/* Publish panel */}
          <div className="space-y-5 lg:sticky lg:top-5">
            <Card title="Status">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-sm text-gray-600">Current status</span>
                <StatusBadge status={status} map={PRODUCT_STATUS} />
              </div>
              <div className="space-y-2">
                {isPublished || inReview ? (
                  <Button block loading={save.isPending} onClick={() => handleSave(false)}>
                    Save changes
                  </Button>
                ) : (
                  <>
                    <Button block icon={Send} loading={save.isPending && save.variables?.submit} onClick={() => handleSave(true)}>
                      {status === "draft" ? "Submit for review" : "Resubmit for review"}
                    </Button>
                    <Button block variant="secondary" loading={save.isPending && !save.variables?.submit} onClick={() => handleSave(false)}>
                      Save as draft
                    </Button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {isPublished
                  ? "Changes to a live product show to customers straight away."
                  : "Our team checks every new product before it goes live, usually within 1 working day."}
              </p>
            </Card>

            {product && (
              <Card title="More actions">
                <div className="space-y-2">
                  {isPublished && (
                    <Button block variant="secondary" icon={status === "live" ? Pause : Play} loading={pause.isPending} onClick={() => pause.mutate(status === "live")}>
                      {status === "live" ? "Pause product" : "Put back on sale"}
                    </Button>
                  )}
                  <Button block variant="secondary" icon={Copy} loading={duplicate.isPending} onClick={() => duplicate.mutate(undefined)}>
                    Duplicate
                  </Button>
                  <Button block variant="ghost" icon={Trash2} onClick={() => setConfirmDelete(true)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Delete product
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </PageBody>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate(undefined)}
        busy={remove.isPending}
        danger
        title="Delete this product?"
        body="It will be removed from your store and cannot be recovered. Past orders are not affected."
        confirmLabel="Delete product"
      />
    </>
  );
}
