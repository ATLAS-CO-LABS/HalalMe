"use client";

// Stage one of the vendor portal. Shown at every /vendor URL until the vendor
// is approved; the operational dashboard (VendorShell) takes over after that.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, LifeBuoy, LogOut, Mail, Pencil, Send, ShieldCheck, XCircle } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import {
  BUSINESS_TYPES,
  categoryTitle,
  docLabel,
  money,
  onboardingProgress,
  ONBOARDING_STEPS,
  VENDOR_DOC_TYPES,
  type OnboardingStepKey,
} from "@/lib/vendorOnboarding";
import type { Vendor } from "@/types/marketplaceVendor";
import { useVendor, useVendorMutation } from "@/components/vendor/VendorProvider";
import { useVendorSignOut } from "@/components/vendor/VendorShell";
import { BusinessForm, CategoriesForm, DeliveryForm, DocumentsPanel, PayoutForm, StoreProfileForm } from "@/components/vendor/VendorForms";
import { Badge, Button, ButtonLink, Callout, Card, DetailList, display, fmtDate } from "@/components/vendor/ui";

export default function OnboardingStage({ banner }: { banner?: React.ReactNode }) {
  const vendor = useVendor();
  const signOut = useVendorSignOut();

  return (
    <div className="min-h-dvh bg-[#F3E9D6] flex flex-col">
      <header className="bg-[#0e2420] border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="relative inline-flex w-7 h-7 shrink-0">
              <span className="absolute inset-0 bg-white/90 rounded-full" />
              <Image src="/logo/logo.png" alt="" width={28} height={28} className="object-contain relative z-10 p-0.5" />
            </span>
            <span className="text-[#F7E7CE] font-black text-base" style={{ fontFamily: "var(--font-logo)" }}>
              HalalMe
            </span>
            <span className="text-[#F59E0B] text-[9px] font-bold tracking-[0.2em] uppercase border border-[#F59E0B]/30 px-1.5 py-0.5">
              Vendor
            </span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/55 hover:text-white hover:bg-white/8 transition-colors"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {banner}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {vendor.status === "submitted" && <SubmittedScreen vendor={vendor} />}
        {vendor.status === "rejected" && <ClosedScreen vendor={vendor} kind="rejected" />}
        {vendor.status === "suspended" && <ClosedScreen vendor={vendor} kind="suspended" />}
        {(vendor.status === "draft" || vendor.status === "changes_requested") && <Wizard vendor={vendor} />}
      </main>
    </div>
  );
}

function Heading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-5 h-px bg-[#F59E0B]" />
        <span className="text-[#B45309] text-[9px] font-bold uppercase tracking-[0.3em]">{eyebrow}</span>
      </div>
      <h1 className={`${display.className} text-2xl sm:text-3xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>{title}</h1>
      <p className="text-sm text-gray-600 mt-2 max-w-2xl">{description}</p>
    </div>
  );
}

// ── Wizard (draft and changes requested) ─────────────────────────────────────

function Wizard({ vendor }: { vendor: Vendor }) {
  const progress = onboardingProgress(vendor);
  const firstIncomplete = progress.steps.find((s) => s.missing.length > 0)?.step.key ?? "review";
  const [active, setActive] = useState<OnboardingStepKey>(firstIncomplete);

  const index = ONBOARDING_STEPS.findIndex((s) => s.key === active);
  const step = ONBOARDING_STEPS[index];
  const goNext = () => setActive(ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)].key);
  const isDone = (key: OnboardingStepKey) =>
    key === "review" ? false : progress.steps.find((s) => s.step.key === key)?.missing.length === 0;

  return (
    <>
      <Heading
        eyebrow="Vendor application"
        title={`Set up ${vendor.business.tradingName}`}
        description="Complete each section to apply to sell on HalalMe Marketplace. Your progress is saved as you go, so you can come back at any time."
      />

      {vendor.status === "changes_requested" && vendor.reviewNote && (
        <div className="mb-5">
          <Callout tone="warning" icon={AlertCircle} title="We need a few changes before we can approve you">
            {vendor.reviewNote}
          </Callout>
        </div>
      )}

      <div className="grid lg:grid-cols-[17rem_1fr] gap-5 items-start">
        {/* Step list */}
        <nav aria-label="Application steps" className="bg-white border border-[#102C26]/12 lg:sticky lg:top-6">
          <div className="px-4 py-3.5 border-b border-[#102C26]/8">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
              <span>
                {progress.done} of {progress.total} sections complete
              </span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 overflow-hidden" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-[#F59E0B] transition-all duration-500" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
          <ol className="flex lg:block overflow-x-auto">
            {ONBOARDING_STEPS.map((s, i) => {
              const current = s.key === active;
              const done = isDone(s.key);
              return (
                <li key={s.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(s.key)}
                    aria-current={current ? "step" : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b-2 lg:border-b-0 lg:border-l-2 transition-colors ${
                      current ? "border-[#F59E0B] bg-[#F59E0B]/[0.07]" : "border-transparent hover:bg-[#102C26]/[0.03]"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border ${
                        done
                          ? "bg-green-600 border-green-600 text-white"
                          : current
                            ? "border-[#F59E0B] text-[#B45309]"
                            : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {done ? <Check size={13} /> : i + 1}
                    </span>
                    <span className={`text-sm font-semibold whitespace-nowrap lg:whitespace-normal ${current ? "text-[#102C26]" : "text-gray-600"}`}>
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Active step. Keyed so each step starts from the saved values. */}
        <Card title={step.label} subtitle={step.description} key={step.key}>
          {step.key === "business" && <BusinessForm submitLabel="Save and continue" onSaved={goNext} />}
          {step.key === "verification" && (
            <div className="space-y-4">
              <DocumentsPanel />
              <Button onClick={goNext} icon={ArrowRight}>
                Continue
              </Button>
            </div>
          )}
          {step.key === "store" && <StoreProfileForm submitLabel="Save and continue" onSaved={goNext} />}
          {step.key === "categories" && <CategoriesForm submitLabel="Save and continue" onSaved={goNext} />}
          {step.key === "delivery" && <DeliveryForm submitLabel="Save and continue" onSaved={goNext} />}
          {step.key === "payout" && <PayoutForm submitLabel="Save and continue" onSaved={goNext} />}
          {step.key === "review" && <ReviewStep vendor={vendor} onEdit={setActive} />}
        </Card>
      </div>
    </>
  );
}

function ReviewStep({ vendor, onEdit }: { vendor: Vendor; onEdit: (step: OnboardingStepKey) => void }) {
  const progress = onboardingProgress(vendor);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = useVendorMutation(() => vendorService.submitApplication(), { onError: setError });

  return (
    <div className="space-y-5">
      <ul className="divide-y divide-[#102C26]/8 border border-[#102C26]/12">
        {progress.steps.map(({ step, missing }) => (
          <li key={step.key} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="flex items-start gap-3 min-w-0">
              {missing.length === 0 ? (
                <CheckCircle2 size={17} className="text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={17} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {missing.length === 0 ? "Complete" : `Still needed: ${missing.join(", ")}`}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => onEdit(step.key)}>
              Edit
            </Button>
          </li>
        ))}
      </ul>

      <ApplicationSummary vendor={vendor} />

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 accent-[#102C26]" />
        <span className="text-sm text-gray-700">
          I confirm these details are accurate, that I am authorised to act for this business, and that every product
          I list will meet the HalalMe Marketplace seller standards.
        </span>
      </label>

      {error && (
        <Callout tone="danger" icon={AlertCircle}>
          {error}
        </Callout>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button icon={Send} loading={submit.isPending} disabled={!progress.readyToSubmit || !agreed} onClick={() => submit.mutate(undefined)}>
          {vendor.status === "changes_requested" ? "Resubmit application" : "Submit application"}
        </Button>
        {!progress.readyToSubmit && <p className="text-xs text-gray-500">Complete every section above to submit.</p>}
      </div>
    </div>
  );
}

function ApplicationSummary({ vendor }: { vendor: Vendor }) {
  return (
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Business</p>
        <DetailList
          rows={[
            { label: "Trading name", value: vendor.business.tradingName },
            { label: "Type", value: BUSINESS_TYPES.find((t) => t.value === vendor.business.type)?.label },
            { label: "Address", value: [vendor.business.address, vendor.business.city, vendor.business.postCode].filter(Boolean).join(", ") },
            { label: "Owner", value: vendor.owner.name },
          ]}
        />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Store</p>
        <DetailList
          rows={[
            { label: "Store name", value: vendor.store.name },
            { label: "Categories", value: vendor.categories.map(categoryTitle).join(", ") },
            { label: "Delivery", value: vendor.delivery.couriers.length ? `${money(vendor.delivery.ukRate)} via ${vendor.delivery.couriers.join(", ")}` : "" },
            { label: "Returns", value: vendor.delivery.returnsAddress ? `${vendor.delivery.returnsDays} days` : "" },
          ]}
        />
      </div>
    </div>
  );
}

// ── Submitted ────────────────────────────────────────────────────────────────

function SubmittedScreen({ vendor }: { vendor: Vendor }) {
  const stages = [
    { label: "Application sent", detail: vendor.submittedAt ? fmtDate(vendor.submittedAt) : "", state: "done" as const },
    { label: "Under review", detail: "Our team is checking your details and documents", state: "current" as const },
    { label: "Decision", detail: "We will email you either way", state: "todo" as const },
  ];

  return (
    <>
      <Heading
        eyebrow="Application status"
        title="We have your application"
        description={`Thanks, ${vendor.owner.name.split(" ")[0]}. There is nothing more you need to do right now.`}
      />

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <ol className="grid sm:grid-cols-3 gap-4">
              {stages.map((stage) => (
                <li key={stage.label} className="flex sm:flex-col gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      stage.state === "done"
                        ? "bg-green-600 border-green-600 text-white"
                        : stage.state === "current"
                          ? "border-[#F59E0B] text-[#B45309] bg-[#F59E0B]/10"
                          : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {stage.state === "done" ? <Check size={15} /> : stage.state === "current" ? <Clock size={15} /> : <ShieldCheck size={15} />}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${stage.state === "todo" ? "text-gray-500" : "text-[#102C26]"}`}>{stage.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stage.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Your documents" subtitle="Each document is checked separately. This updates as we review them.">
            <ul className="divide-y divide-[#102C26]/8">
              {VENDOR_DOC_TYPES.filter((def) => vendor.documents.some((d) => d.type === def.type)).map((def) => {
                const doc = vendor.documents.find((d) => d.type === def.type)!;
                return (
                  <li key={def.type} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{docLabel(def.type)}</p>
                      <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                    </div>
                    <Badge
                      label={doc.status === "approved" ? "Approved" : doc.status === "rejected" ? "Needs replacing" : "Under review"}
                      tone={doc.status === "approved" ? "green" : doc.status === "rejected" ? "red" : "amber"}
                    />
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="What you sent us">
            <ApplicationSummary vendor={vendor} />
          </Card>
        </div>

        <Card title="What happens next">
          <ul className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <Clock size={16} className="text-[#B45309] shrink-0 mt-0.5" />
              Reviews usually take 2 working days.
            </li>
            <li className="flex gap-3">
              <Mail size={16} className="text-[#B45309] shrink-0 mt-0.5" />
              We will email {vendor.owner.email} when there is a decision, or if we need anything changed.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 size={16} className="text-[#B45309] shrink-0 mt-0.5" />
              Once approved, this page becomes your dashboard and you can start adding products.
            </li>
          </ul>
          <div className="mt-5 pt-4 border-t border-[#102C26]/8">
            <ButtonLink href="/contact" variant="secondary" icon={LifeBuoy} block>
              Contact support
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  );
}

// ── Rejected and suspended ───────────────────────────────────────────────────

function ClosedScreen({ vendor, kind }: { vendor: Vendor; kind: "rejected" | "suspended" }) {
  const rejected = kind === "rejected";
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center py-4">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-red-50 border border-red-100">
            <XCircle size={24} className="text-red-500" />
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26]`}>
            {rejected ? "Application not approved" : "Your store is suspended"}
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
            {rejected
              ? `We reviewed the application for ${vendor.business.tradingName} and are not able to approve it at the moment.`
              : `${vendor.business.tradingName} is paused. Your products are hidden from customers and you cannot take new orders.`}
          </p>
        </div>

        {vendor.reviewNote && (
          <Callout tone="danger" icon={AlertCircle} title={rejected ? "Reason" : "Why this happened"}>
            {vendor.reviewNote}
          </Callout>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-5">
          <ButtonLink href="/contact" icon={LifeBuoy}>
            Contact support
          </ButtonLink>
          <ButtonLink href="/marketplace" variant="secondary" icon={ArrowLeft}>
            Back to Marketplace
          </ButtonLink>
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          {rejected
            ? "If your circumstances change, get in touch and we can reopen your application."
            : "Orders placed before the suspension still need to be fulfilled. Our team will be in touch about next steps."}
        </p>
      </Card>
    </div>
  );
}
