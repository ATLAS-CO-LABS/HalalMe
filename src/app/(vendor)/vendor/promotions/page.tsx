"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Pause, Pencil, Play, Plus, Tag, Trash2 } from "lucide-react";
import { vendorService } from "@/services/vendorService";
import { money, PROMOTION_STATE, promotionState } from "@/lib/vendorOnboarding";
import type { Promotion, PromotionInput, PromotionType } from "@/types/marketplaceVendor";
import { useVendorMutation, vendorKeys } from "@/components/vendor/VendorProvider";
import {
  Button,
  Callout,
  Card,
  ConfirmDialog,
  DataTable,
  display,
  EmptyState,
  Field,
  fmtDate,
  Input,
  LoadError,
  Modal,
  MoneyInput,
  PageBody,
  PageHeader,
  Select,
  StatusBadge,
  TableSkeleton,
  ToastView,
  useToast,
  type Column,
} from "@/components/vendor/ui";

const TYPES: { value: PromotionType; label: string }[] = [
  { value: "percent", label: "Percentage off" },
  { value: "fixed", label: "Fixed amount off" },
  { value: "free_shipping", label: "Free delivery" },
];

function describe(promo: Promotion) {
  if (promo.type === "percent") return `${promo.value}% off`;
  if (promo.type === "fixed") return `${money(promo.value)} off`;
  return "Free delivery";
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const today = () => new Date().toISOString().slice(0, 10);

function PromotionForm({ promo, onDone }: { promo: Promotion | null; onDone: (message: string) => void }) {
  const [code, setCode] = useState(promo?.code ?? "");
  const [type, setType] = useState<PromotionType>(promo?.type ?? "percent");
  const [value, setValue] = useState(promo ? String(promo.value) : "10");
  const [minSpend, setMinSpend] = useState(promo?.minSpend ? String(promo.minSpend) : "");
  const [startsAt, setStartsAt] = useState(toDateInput(promo?.startsAt ?? null) || today());
  const [endsAt, setEndsAt] = useState(toDateInput(promo?.endsAt ?? null));
  const [usageLimit, setUsageLimit] = useState(promo?.usageLimit ? String(promo.usageLimit) : "");
  const [error, setError] = useState<string | null>(null);

  const save = useVendorMutation((input: PromotionInput) => vendorService.savePromotion(promo?.id ?? null, input), {
    onSuccess: () => onDone(promo ? "Promotion updated" : "Promotion created"),
    onError: setError,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(value);
    if (!/^[A-Za-z0-9]{3,16}$/.test(code.trim())) return setError("Use 3 to 16 letters and numbers for the code, with no spaces.");
    if (type === "percent" && !(amount > 0 && amount <= 90)) return setError("Enter a percentage between 1 and 90.");
    if (type === "fixed" && !(amount > 0)) return setError("Enter an amount above zero.");
    if (endsAt && endsAt < startsAt) return setError("The end date is before the start date.");
    setError(null);
    save.mutate({
      code,
      type,
      value: type === "free_shipping" ? 0 : amount,
      minSpend: Number(minSpend) > 0 ? Number(minSpend) : null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
      usageLimit: Number(usageLimit) > 0 ? Math.round(Number(usageLimit)) : null,
    });
  };

  return (
    <form className="p-5 sm:p-6 space-y-4" onSubmit={submit}>
      <h2 id="promo-title" className={`${display.className} text-base font-bold uppercase tracking-tight text-[#102C26]`}>
        {promo ? "Edit promotion" : "New promotion"}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Discount code" hint="What customers type at checkout.">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="EID10" maxLength={16} className="uppercase font-mono" />
        </Field>
        <Field label="Type">
          <Select value={type} onChange={(e) => setType(e.target.value as PromotionType)} options={TYPES} />
        </Field>
        {type === "percent" && (
          <Field label="Percentage off">
            <Input type="number" min={1} max={90} value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
        )}
        {type === "fixed" && (
          <Field label="Amount off">
            <MoneyInput value={value} onChange={setValue} />
          </Field>
        )}
        <Field label="Minimum spend" optional>
          <MoneyInput value={minSpend} onChange={setMinSpend} />
        </Field>
        <Field label="Starts">
          <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </Field>
        <Field label="Ends" optional hint="Leave empty to run until you pause it.">
          <Input type="date" value={endsAt} min={startsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </Field>
        <Field label="Usage limit" optional hint="Total number of times it can be used.">
          <Input type="number" min={1} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
        </Field>
      </div>
      <p className="text-xs text-gray-500">Discounts apply to your own products only, and come out of your earnings.</p>
      {error && (
        <Callout tone="danger" icon={AlertCircle}>
          {error}
        </Callout>
      )}
      <div className="flex justify-end gap-2">
        <Button type="submit" loading={save.isPending}>
          {promo ? "Save changes" : "Create promotion"}
        </Button>
      </div>
    </form>
  );
}

export default function VendorPromotionsPage() {
  const { toast, flash } = useToast();
  const [editing, setEditing] = useState<Promotion | "new" | null>(null);
  const [deleting, setDeleting] = useState<Promotion | null>(null);
  const { data: promotions, isLoading, isError, refetch } = useQuery({
    queryKey: vendorKeys.resource("promotions"),
    queryFn: () => vendorService.listPromotions(),
  });

  const pause = useVendorMutation(({ id, paused }: { id: string; paused: boolean }) => vendorService.setPromotionPaused(id, paused), {
    onSuccess: (_r, { paused }) => flash("ok", paused ? "Promotion paused" : "Promotion resumed"),
  });
  const remove = useVendorMutation((id: string) => vendorService.deletePromotion(id), {
    onSuccess: () => {
      setDeleting(null);
      flash("ok", "Promotion deleted");
    },
  });

  const actions = (p: Promotion) => {
    const state = promotionState(p);
    const canToggle = state === "active" || state === "scheduled" || state === "paused";
    return (
      <span className="inline-flex items-center gap-1">
        {canToggle && (
          <Button size="sm" variant="ghost" icon={p.paused ? Play : Pause} onClick={() => pause.mutate({ id: p.id, paused: !p.paused })}>
            {p.paused ? "Resume" : "Pause"}
          </Button>
        )}
        <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(p)} aria-label={`Edit ${p.code}`}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleting(p)} aria-label={`Delete ${p.code}`} className="text-red-600 hover:text-red-700 hover:bg-red-50" />
      </span>
    );
  };

  const columns: Column<Promotion>[] = [
    { key: "code", header: "Code", render: (p) => <span className="font-mono font-bold text-gray-900">{p.code}</span> },
    {
      key: "offer",
      header: "Offer",
      render: (p) => (
        <>
          <span className="block text-gray-900">{describe(p)}</span>
          {p.minSpend !== null && <span className="block text-xs text-gray-500">On orders over {money(p.minSpend)}</span>}
        </>
      ),
    },
    {
      key: "window",
      header: "Runs",
      className: "hidden lg:table-cell",
      render: (p) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(p.startsAt)} {p.endsAt ? `to ${fmtDate(p.endsAt)}` : "onwards"}</span>,
    },
    { key: "used", header: "Used", align: "right", render: (p) => <span className="text-gray-700">{p.used}{p.usageLimit !== null && ` / ${p.usageLimit}`}</span> },
    { key: "state", header: "Status", render: (p) => <StatusBadge status={promotionState(p)} map={PROMOTION_STATE} /> },
    { key: "actions", header: "", align: "right", render: actions },
  ];

  return (
    <>
      <ToastView toast={toast} />
      <PageHeader
        eyebrow="Promotions"
        title="Promotions"
        description="Discount codes for your own products."
        actions={
          <Button icon={Plus} onClick={() => setEditing("new")}>
            New promotion
          </Button>
        }
      />
      <PageBody>
        <Card flush>
          {isError ? (
            <LoadError message="We could not load your promotions." onRetry={() => void refetch()} compact />
          ) : isLoading ? (
            <TableSkeleton />
          ) : promotions?.length === 0 ? (
            <div className="pb-8">
              <EmptyState icon={Tag} title="No promotions yet" hint="Create a discount code to share with your customers or on social media." />
              <div className="flex justify-center">
                <Button icon={Plus} onClick={() => setEditing("new")}>
                  New promotion
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              rows={promotions ?? []}
              columns={columns}
              rowKey={(p) => p.id}
              mobile={(p) => (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono font-bold text-gray-900">{p.code}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {describe(p)} · used {p.used}{p.usageLimit !== null && ` of ${p.usageLimit}`}
                      </p>
                    </div>
                    <StatusBadge status={promotionState(p)} map={PROMOTION_STATE} />
                  </div>
                  <div className="-ml-3">{actions(p)}</div>
                </div>
              )}
            />
          )}
        </Card>
      </PageBody>

      <Modal open={editing !== null} onClose={() => setEditing(null)} labelledBy="promo-title" maxWidth="max-w-xl">
        {editing !== null && (
          <PromotionForm
            promo={editing === "new" ? null : editing}
            onDone={(message) => {
              setEditing(null);
              flash("ok", message);
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        busy={remove.isPending}
        danger
        title={`Delete ${deleting?.code ?? "promotion"}?`}
        body="Customers will no longer be able to use this code. This cannot be undone."
        confirmLabel="Delete"
      />
    </>
  );
}
