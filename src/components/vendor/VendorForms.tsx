"use client";

// The vendor's editable profile sections. Each form is used twice: as a step
// in onboarding ("Save and continue") and later on the Store and Settings
// pages ("Save changes"), so a field only ever has one definition.

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, FileText, ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { resizeImage } from "@/lib/resizeImage";
import {
  BUSINESS_TYPES,
  COURIERS,
  ONBOARDING_STEPS,
  VENDOR_CATEGORIES,
  VENDOR_DOC_TYPES,
  type OnboardingStepKey,
} from "@/lib/vendorOnboarding";
import type { Vendor, VendorDocument, VendorPatch } from "@/types/marketplaceVendor";
import { useVendor, useVendorMutation } from "@/components/vendor/VendorProvider";
import { Badge, Button, Callout, ChipSelect, Field, Input, MoneyInput, Select, Textarea, Toggle } from "@/components/vendor/ui";

interface SectionFormProps {
  submitLabel?: string;
  onSaved?: () => void;
}

/**
 * Shared save behaviour: check the section against the onboarding rules, save
 * it, and report what is still missing instead of saving half a section.
 */
function useSectionSave(step: OnboardingStepKey, onSaved?: () => void) {
  const vendor = useVendor();
  const [missing, setMissing] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const mutation = useVendorMutation((patch: VendorPatch) => vendorService.updateVendor(patch), {
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved?.();
    },
  });

  const save = (patch: VendorPatch) => {
    const preview: Vendor = { ...vendor, ...patch };
    const stillMissing = ONBOARDING_STEPS.find((s) => s.key === step)?.missing(preview) ?? [];
    setMissing(stillMissing);
    if (stillMissing.length === 0) mutation.mutate(patch);
  };

  return { save, missing, saved, saving: mutation.isPending, error: mutation.error };
}

function SectionFooter({
  state,
  submitLabel = "Save changes",
}: {
  state: ReturnType<typeof useSectionSave>;
  submitLabel?: string;
}) {
  return (
    <div className="space-y-3 pt-2">
      {state.missing.length > 0 && (
        <Callout tone="danger" icon={AlertCircle} title="Please complete the following">
          {state.missing.join(", ")}
        </Callout>
      )}
      {state.error && (
        <Callout tone="danger" icon={AlertCircle}>
          {state.error instanceof Error ? state.error.message : "Could not save. Please try again."}
        </Callout>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={state.saving}>
          {submitLabel}
        </Button>
        {state.saved && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700" role="status">
            <CheckCircle2 size={14} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

// ── Business details ─────────────────────────────────────────────────────────

export function BusinessForm({ submitLabel, onSaved }: SectionFormProps) {
  const vendor = useVendor();
  const [business, setBusiness] = useState(vendor.business);
  const [owner, setOwner] = useState(vendor.owner);
  const state = useSectionSave("business", onSaved);
  const setB = <K extends keyof Vendor["business"]>(key: K, value: Vendor["business"][K]) =>
    setBusiness((b) => ({ ...b, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        state.save({ business, owner });
      }}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Legal business name" hint="As registered with HMRC or Companies House.">
          <Input value={business.legalName} onChange={(e) => setB("legalName", e.target.value)} autoComplete="organization" />
        </Field>
        <Field label="Trading name" hint="The name customers know you by.">
          <Input value={business.tradingName} onChange={(e) => setB("tradingName", e.target.value)} />
        </Field>
        <Field label="Business type">
          <Select value={business.type} onChange={(e) => setB("type", e.target.value as Vendor["business"]["type"])} options={BUSINESS_TYPES} />
        </Field>
        {business.type === "limited_company" ? (
          <Field label="Company number">
            <Input value={business.companyNumber} onChange={(e) => setB("companyNumber", e.target.value)} inputMode="numeric" />
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field label="VAT number" optional>
          <Input value={business.vatNumber} onChange={(e) => setB("vatNumber", e.target.value)} placeholder="GB123456789" />
        </Field>
      </div>

      <Field label="Business address">
        <Input value={business.address} onChange={(e) => setB("address", e.target.value)} autoComplete="street-address" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Town or city">
          <Input value={business.city} onChange={(e) => setB("city", e.target.value)} autoComplete="address-level2" />
        </Field>
        <Field label="Postcode">
          <Input value={business.postCode} onChange={(e) => setB("postCode", e.target.value)} autoComplete="postal-code" />
        </Field>
      </div>

      <div className="pt-3 border-t border-[#102C26]/8">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-3">Business owner</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Full name">
            <Input value={owner.name} onChange={(e) => setOwner((o) => ({ ...o, name: e.target.value }))} autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input type="email" value={owner.email} onChange={(e) => setOwner((o) => ({ ...o, email: e.target.value }))} autoComplete="email" />
          </Field>
          <Field label="Phone">
            <Input type="tel" value={owner.phone} onChange={(e) => setOwner((o) => ({ ...o, phone: e.target.value }))} autoComplete="tel" />
          </Field>
        </div>
      </div>

      <SectionFooter state={state} submitLabel={submitLabel} />
    </form>
  );
}

// ── Verification documents ───────────────────────────────────────────────────

function DocBadge({ doc }: { doc: VendorDocument | undefined }) {
  if (!doc) return <Badge label="Not uploaded" tone="gray" />;
  if (doc.status === "approved") return <Badge label="Approved" tone="green" />;
  if (doc.status === "rejected") return <Badge label="Needs replacing" tone="red" />;
  return <Badge label="Under review" tone="amber" />;
}

/**
 * Upload list for verification documents. Each file is submitted the moment it
 * uploads. Only the file name is kept in this preview; real uploads will go to
 * private storage the same way restaurant documents do.
 */
export function DocumentsPanel({ readOnly = false }: { readOnly?: boolean }) {
  const vendor = useVendor();
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [error, setError] = useState<string | null>(null);
  const upload = useVendorMutation(
    ({ type, fileName }: { type: VendorDocument["type"]; fileName: string }) => vendorService.uploadDocument(type, fileName),
    { onError: setError },
  );
  const remove = useVendorMutation((type: VendorDocument["type"]) => vendorService.removeDocument(type), { onError: setError });

  const handleFile = (type: VendorDocument["type"], file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > 10 * 1024 * 1024) {
      setError("That file is larger than 10 MB. Please upload a smaller one.");
      return;
    }
    upload.mutate({ type, fileName: file.name });
  };

  return (
    <div className="space-y-3">
      {error && (
        <Callout tone="danger" icon={AlertCircle}>
          {error}
        </Callout>
      )}
      <ul className="space-y-2">
        {VENDOR_DOC_TYPES.map((def) => {
          const doc = vendor.documents.find((d) => d.type === def.type);
          const uploading = upload.isPending && upload.variables?.type === def.type;
          const locked = readOnly || doc?.status === "approved";
          return (
            <li key={def.type} className="border border-[#102C26]/12 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <FileText size={16} className="text-gray-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {def.label}{" "}
                      <span className={`text-[10px] font-bold uppercase ml-1 ${def.required ? "text-[#B45309]" : "text-gray-400"}`}>
                        {def.required ? "Required" : "Optional"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{def.hint}</p>
                    {doc && <p className="text-xs text-gray-700 mt-1.5 truncate">{doc.fileName}</p>}
                  </div>
                </div>
                <DocBadge doc={doc} />
              </div>

              {doc?.status === "rejected" && doc.rejectionReason && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 px-3 py-2 mt-3">
                  <strong>Reason:</strong> {doc.rejectionReason}
                </p>
              )}

              {!locked && (
                <div className="flex items-center gap-2 mt-3">
                  <input
                    ref={(el) => { inputs.current[def.type] = el; }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      handleFile(def.type, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    size="sm"
                    variant={doc ? "secondary" : "primary"}
                    icon={doc ? RotateCcw : Upload}
                    loading={uploading}
                    onClick={() => inputs.current[def.type]?.click()}
                  >
                    {doc ? "Replace file" : "Upload"}
                  </Button>
                  {doc && (
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove.mutate(def.type)}>
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="flex items-start gap-2 text-xs text-gray-500">
        <Clock size={13} className="shrink-0 mt-0.5" />
        PDF, JPG, PNG or WEBP, up to 10 MB each. Documents are checked by our team, usually within 2 working days.
      </p>
    </div>
  );
}

// ── Store profile ────────────────────────────────────────────────────────────

function ImagePicker({
  label,
  hint,
  value,
  onChange,
  maxWidth,
  maxHeight,
  shape,
}: {
  label: string;
  hint: string;
  value: string | null;
  onChange: (value: string | null) => void;
  maxWidth: number;
  maxHeight: number;
  shape: "square" | "wide";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await resizeImage(file, maxWidth, maxHeight));
    } catch {
      setError("That image could not be read. Try a JPG or PNG.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1.5">{label}</p>
      <div className="flex items-center gap-4">
        <div
          className={`shrink-0 bg-gray-100 border border-dashed border-[#102C26]/25 flex items-center justify-center overflow-hidden ${
            shape === "square" ? "w-20 h-20" : "w-44 h-20"
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL preview
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-gray-400" />
          )}
        </div>
        <div className="space-y-1.5">
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" loading={busy} onClick={() => input.current?.click()}>
              {value ? "Change" : "Upload"}
            </Button>
            {value && (
              <Button size="sm" variant="ghost" onClick={() => onChange(null)}>
                Remove
              </Button>
            )}
          </div>
          <p className={`text-xs ${error ? "text-red-600" : "text-gray-500"}`}>{error ?? hint}</p>
        </div>
      </div>
    </div>
  );
}

export function StoreProfileForm({ submitLabel, onSaved }: SectionFormProps) {
  const vendor = useVendor();
  const [store, setStore] = useState(vendor.store);
  const state = useSectionSave("store", onSaved);
  const set = <K extends keyof Vendor["store"]>(key: K, value: Vendor["store"][K]) => setStore((s) => ({ ...s, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        state.save({ store });
      }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <ImagePicker label="Logo" hint="Square, at least 200px." value={store.logo} onChange={(v) => set("logo", v)} maxWidth={240} maxHeight={240} shape="square" />
        <ImagePicker label="Banner" hint="Wide, shown at the top of your store page." value={store.banner} onChange={(v) => set("banner", v)} maxWidth={1000} maxHeight={360} shape="wide" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Store name">
          <Input value={store.name} onChange={(e) => set("name", e.target.value)} maxLength={50} />
        </Field>
        <Field label="Tagline" optional hint="One short line under your store name.">
          <Input value={store.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={70} />
        </Field>
      </div>
      <Field label="About your store" hint={`${store.description.trim().length} characters. Aim for 2 or 3 sentences about what you make and why.`}>
        <Textarea value={store.description} onChange={(e) => set("description", e.target.value)} maxLength={600} />
      </Field>
      <Field label="Customer support email" hint="Shown to customers who have ordered from you.">
        <Input type="email" value={store.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
      </Field>
      <SectionFooter state={state} submitLabel={submitLabel} />
    </form>
  );
}

// ── Categories ───────────────────────────────────────────────────────────────

const REGULATED = ["food-pantry", "beauty-skincare"];

export function CategoriesForm({ submitLabel, onSaved }: SectionFormProps) {
  const vendor = useVendor();
  const [categories, setCategories] = useState(vendor.categories);
  const state = useSectionSave("categories", onSaved);
  const needsCertificate = categories.some((c) => REGULATED.includes(c));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        state.save({ categories });
      }}
    >
      <p className="text-sm text-gray-600">Choose every category you plan to list products in. You can change this later.</p>
      <ChipSelect
        options={VENDOR_CATEGORIES.map((c) => ({ value: c.handle, label: c.title }))}
        value={categories}
        onChange={setCategories}
      />
      {needsCertificate && (
        <Callout tone="warning" icon={AlertCircle} title="Extra checks apply">
          Food and beauty products need a halal certificate and full ingredient lists. Upload your certificate under
          Verification.
        </Callout>
      )}
      <SectionFooter state={state} submitLabel={submitLabel} />
    </form>
  );
}

// ── Delivery and returns ─────────────────────────────────────────────────────

export function DeliveryForm({ submitLabel, onSaved }: SectionFormProps) {
  const vendor = useVendor();
  const [delivery, setDelivery] = useState(vendor.delivery);
  const [rate, setRate] = useState(String(vendor.delivery.ukRate));
  const [freeOver, setFreeOver] = useState(vendor.delivery.freeOver === null ? "" : String(vendor.delivery.freeOver));
  const state = useSectionSave("delivery", onSaved);
  const set = <K extends keyof Vendor["delivery"]>(key: K, value: Vendor["delivery"][K]) =>
    setDelivery((d) => ({ ...d, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        state.save({
          delivery: {
            ...delivery,
            ukRate: Math.max(0, Number(rate) || 0),
            freeOver: delivery.freeOver === null ? null : Math.max(0, Number(freeOver) || 0),
          },
        });
      }}
    >
      <Field label="Couriers you use" hint="You post orders yourself. Customers see these on your store page.">
        <ChipSelect options={COURIERS.map((c) => ({ value: c, label: c }))} value={delivery.couriers} onChange={(v) => set("couriers", v)} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Dispatch time" hint="How long before an order leaves you.">
          <Select
            value={String(delivery.dispatchDays)}
            onChange={(e) => set("dispatchDays", Number(e.target.value))}
            options={[
              { value: "0", label: "Choose" },
              { value: "1", label: "Next working day" },
              { value: "2", label: "Within 2 working days" },
              { value: "3", label: "Within 3 working days" },
              { value: "5", label: "Within 5 working days" },
            ]}
          />
        </Field>
        <Field label="UK delivery charge" hint="One flat rate per order from your store.">
          <MoneyInput value={rate} onChange={setRate} />
        </Field>
      </div>
      <div className="border border-[#102C26]/12 px-4">
        <Toggle
          label="Free delivery over a set amount"
          description="Customers pay nothing for delivery once their order from you reaches this total."
          checked={delivery.freeOver !== null}
          onChange={(on) => {
            set("freeOver", on ? Number(freeOver) || 40 : null);
            if (on && !freeOver) setFreeOver("40");
          }}
        />
        {delivery.freeOver !== null && (
          <div className="pb-4 max-w-40">
            <MoneyInput value={freeOver} onChange={setFreeOver} aria-label="Free delivery threshold" />
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Returns window" hint="Days after delivery. The legal minimum is 14.">
          <Input type="number" min={14} max={90} value={delivery.returnsDays} onChange={(e) => set("returnsDays", Math.max(14, Number(e.target.value) || 14))} />
        </Field>
        <Field label="Returns address">
          <Input value={delivery.returnsAddress} onChange={(e) => set("returnsAddress", e.target.value)} />
        </Field>
      </div>
      <Field label="Returns policy" optional hint="Anything customers should know, such as who pays return postage.">
        <Textarea value={delivery.returnsPolicy} onChange={(e) => set("returnsPolicy", e.target.value)} rows={3} />
      </Field>
      <SectionFooter state={state} submitLabel={submitLabel} />
    </form>
  );
}

// ── Payout details ───────────────────────────────────────────────────────────

export function PayoutForm({ submitLabel, onSaved }: SectionFormProps) {
  const vendor = useVendor();
  const [payout, setPayout] = useState(vendor.payout);
  const state = useSectionSave("payout", onSaved);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        state.save({ payout });
      }}
    >
      <p className="text-sm text-gray-600">
        We pay your earnings into a UK bank account in your business name. HalalMe keeps its commission and sends you
        the rest.
      </p>
      <Field label="Account name" hint="Must match your legal business name or the owner's name.">
        <Input value={payout.accountName} onChange={(e) => setPayout((p) => ({ ...p, accountName: e.target.value }))} autoComplete="off" />
      </Field>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Field label="Sort code">
          <Input value={payout.sortCode} onChange={(e) => setPayout((p) => ({ ...p, sortCode: e.target.value }))} placeholder="12-34-56" inputMode="numeric" autoComplete="off" />
        </Field>
        <Field label="Account number">
          <Input value={payout.accountNumber} onChange={(e) => setPayout((p) => ({ ...p, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 8) }))} placeholder="8 digits" inputMode="numeric" autoComplete="off" />
        </Field>
      </div>
      <SectionFooter state={state} submitLabel={submitLabel} />
    </form>
  );
}
