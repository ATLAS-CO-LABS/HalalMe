"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Plus, Check, AlertTriangle, Store } from "lucide-react";

interface Category { _id: string; name: string }

const ORDER_TYPES = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
];

const inputCls =
  "w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-none px-3.5 py-2.5 " +
  "focus:outline-none focus:ring-2 focus:ring-[#102C26]/20 focus:border-[#102C26] " +
  "placeholder:text-gray-400 transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{children}</label>;
}

export default function AddMerchantModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState({
    name: "", owner_name: "", email: "", phone: "",
    address: "", city: "", post_code: "",
  });
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [orderTypes, setOrderTypes] = useState<string[]>(["delivery"]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hyperzod/merchant-categories")
      .then((r) => r.json())
      .then((json) => setCategories((json?.data ?? json?.categories ?? []) as Category[]))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    setError(null);
  }
  function toggleCat(id: string) {
    setCategoryIds((p) => (p.includes(id) ? p.filter((c) => c !== id) : [...p, id]));
  }
  function toggleType(v: string) {
    setOrderTypes((p) => (p.includes(v) ? p.filter((t) => t !== v) : [...p, v]));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Restaurant name, email and phone are required.");
      return;
    }
    if (!form.address.trim() || !form.city.trim() || !form.post_code.trim()) {
      setError("Address, city and postcode are required.");
      return;
    }
    if (categoryIds.length === 0) { setError("Select at least one category."); return; }
    if (orderTypes.length === 0) { setError("Select at least one order type."); return; }

    setSaving(true);
    setError(null);
    try {
      const fullPhone = `+44${form.phone.replace(/\D/g, "").replace(/^0+/, "")}`;
      const res = await fetch("/api/admin/merchants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          owner_name: form.owner_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: fullPhone,
          address: form.address.trim(),
          city: form.city.trim(),
          state: "",
          post_code: form.post_code.trim(),
          country: "United Kingdom",
          country_code: "GB",
          merchant_category_ids: categoryIds,
          accepted_order_types: orderTypes,
        }),
      });
      const json = await res.json() as { merchant_id?: string; error?: string };
      if (!res.ok) {
        setError(
          json.error === "email_already_registered"
            ? "A merchant with this email already exists."
            : "Could not create the merchant. Please try again."
        );
        return;
      }
      if (json.merchant_id) onCreated(json.merchant_id);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={() => !saving && onClose()}
    >
      <div
        className="bg-white rounded-none shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#102C26] px-6 py-5 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-none bg-[#F7E7CE]/15 flex items-center justify-center shrink-0">
            <Store size={17} className="text-[#F7E7CE]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base">Add Merchant</h3>
            <p className="text-white/60 text-xs mt-0.5">Creates a lead in HalalMe &amp; Hyperzod (status: pending)</p>
          </div>
          <button onClick={onClose} disabled={saving} className="text-white/50 hover:text-white transition-colors disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 overflow-y-auto overscroll-contain space-y-4">
          <div>
            <Label>Restaurant name *</Label>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Muz & Sam's" />
          </div>
          <div>
            <Label>Owner name</Label>
            <input className={inputCls} value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} placeholder="e.g. Muazam Khan" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="owner@restaurant.com" />
            </div>
            <div>
              <Label>Phone *</Label>
              <div className="flex items-stretch border border-gray-300 rounded-none overflow-hidden focus-within:ring-2 focus-within:ring-[#102C26]/20 focus-within:border-[#102C26] bg-white">
                <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-gray-500">+44</span>
                <input className="flex-1 text-sm text-gray-900 bg-transparent px-3 py-2.5 focus:outline-none placeholder:text-gray-400"
                  value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="7784 093793" />
              </div>
            </div>
          </div>
          <div>
            <Label>Address *</Label>
            <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="12 High Street" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="London" />
            </div>
            <div>
              <Label>Postcode *</Label>
              <input className={inputCls} value={form.post_code} onChange={(e) => set("post_code", e.target.value)} placeholder="SW1A 1AA" />
            </div>
          </div>

          {/* Order types */}
          <div>
            <Label>Order types *</Label>
            <div className="flex gap-2">
              {ORDER_TYPES.map((t) => {
                const on = orderTypes.includes(t.value);
                return (
                  <button key={t.value} type="button" onClick={() => toggleType(t.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-none text-sm font-medium border transition-colors ${
                      on ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}>
                    {on && <Check size={14} />} {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label>Categories *</Label>
            {catLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 size={14} className="animate-spin" /> Loading categories…
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-amber-600">Couldn&apos;t load categories from Hyperzod. Try again shortly.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {categories.map((c) => {
                  const on = categoryIds.includes(c._id);
                  return (
                    <button key={c._id} type="button" onClick={() => toggleCat(c._id)}
                      className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-colors ${
                        on ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-none bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#102C26] text-[#F7E7CE] rounded-none text-sm font-semibold hover:bg-[#102C26]/90 transition-colors disabled:opacity-60">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><Plus size={14} /> Add Merchant</>}
          </button>
        </div>
      </div>
    </div>
  );
}
