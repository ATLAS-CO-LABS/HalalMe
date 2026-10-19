"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, Lock, Truck } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplaceCart } from "@/context/MarketplaceCartContext";
import { CartTotals, useCartQuote } from "@/components/marketplace/CartSummary";
import { darkInputClass, Notice, PageHeader, Panel, TextField } from "@/components/marketplace/shared";
import { BG, BG2, BLUE, CREAM, DEEP, formatPrice } from "@/components/marketplace/theme";

// PREVIEW checkout. With Shopify connected, the basket's Checkout button
// redirects to Shopify's hosted checkout instead and this page is removed.
// It exists so the whole journey, from basket to a vendor's dashboard, can be
// walked through before that integration is built.

type Errors = Partial<Record<"name" | "email" | "phone" | "line1" | "city" | "postCode", string>>;

export default function MarketplaceCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, isReady, promoCode, totalQuantity, clear } = useMarketplaceCart();
  const { quote } = useCartQuote();

  // Null means "not typed in yet", so a signed-in customer's details can fill
  // the field without an effect copying them into state.
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postCode, setPostCode] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  /** Update a field and drop its error, so a message never lingers after it has been fixed. */
  const edit = (key: keyof Errors, set: (value: string) => void) => (value: string) => {
    set(value);
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const nameValue = name ?? user?.full_name ?? "";
  const emailValue = email ?? user?.email ?? "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (nameValue.trim().length < 2) found.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(emailValue.trim())) found.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 10) found.phone = "Enter a phone number the courier can reach you on.";
    if (!line1.trim()) found.line1 = "Enter the first line of your address.";
    if (!city.trim()) found.city = "Enter your town or city.";
    if (!/^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/.test(postCode.trim())) found.postCode = "Enter a valid UK postcode.";
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setPlacing(true);
    setFailure(null);
    try {
      const orderId = await marketplaceService.placeOrder({
        contact: { name: nameValue.trim(), email: emailValue.trim(), phone: phone.trim() },
        address: { line1: line1.trim(), city: city.trim(), postCode: postCode.trim().toUpperCase() },
        note,
        lines,
        promoCode: quote?.promo ? promoCode : null,
      });
      router.push(`/marketplace/orders/${orderId}?placed=1`);
      clear();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "We could not place your order. Please try again.");
      setPlacing(false);
    }
  };

  if (isReady && lines.length === 0 && !placing) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Checkout" />
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-12">
          <Notice title="Your Basket Is Empty" message="Add something to your basket before checking out." actionHref="/marketplace/shop" actionLabel="Start Shopping" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Checkout" />

      <section className="py-10 md:py-14" style={{ backgroundColor: BG }}>
        <form onSubmit={submit} noValidate className="max-w-[95vw] mx-auto px-6 md:px-10 grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/marketplace/cart" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-white" style={{ color: `${CREAM}B3` }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to basket
            </Link>

            <Panel title="Your details">
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField label="Full name" value={nameValue} onChange={edit("name", setName)} error={errors.name} autoComplete="name" />
                <TextField label="Phone" type="tel" value={phone} onChange={edit("phone", setPhone)} error={errors.phone} autoComplete="tel" />
                <div className="sm:col-span-2">
                  <TextField label="Email" type="email" value={emailValue} onChange={edit("email", setEmail)} error={errors.email} autoComplete="email" />
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: `${CREAM}80` }}>
                We send your order confirmation and tracking updates here.
              </p>
            </Panel>

            <Panel title="Delivery address">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <TextField label="Address" value={line1} onChange={edit("line1", setLine1)} error={errors.line1} autoComplete="street-address" />
                </div>
                <TextField label="Town or city" value={city} onChange={edit("city", setCity)} error={errors.city} autoComplete="address-level2" />
                <TextField label="Postcode" value={postCode} onChange={edit("postCode", setPostCode)} error={errors.postCode} autoComplete="postal-code" />
              </div>
              <label className="block mt-4">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${CREAM}CC` }}>
                  Note for the seller (optional)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="e.g. Leave with a neighbour if I am out"
                  className={`${darkInputClass} h-auto py-3 resize-y`}
                  style={{ backgroundColor: BG2, color: CREAM, border: `1px solid ${BLUE}50` }}
                />
              </label>
              <p className="text-xs mt-3" style={{ color: `${CREAM}80` }}>
                Marketplace sellers deliver to UK addresses.
              </p>
            </Panel>

            <Panel title="Delivery">
              {quote ? (
                <ul className="space-y-4">
                  {quote.groups.map((group, i) => (
                    <li key={group.vendor.handle} className="flex items-start gap-3">
                      <Truck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BLUE }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: CREAM }}>
                          Parcel {i + 1}: {group.vendor.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: `${CREAM}B3` }}>
                          {group.lines.map((l) => `${l.quantity} × ${l.title}`).join(", ")}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: `${CREAM}B3` }}>
                          {group.dispatch}, with tracking.
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: CREAM }}>
                        {group.delivery === 0 ? "Free" : formatPrice(group.delivery)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-12 animate-pulse" style={{ backgroundColor: BG }} />
              )}
            </Panel>

            <Panel title="Payment">
              <div className="flex items-start gap-3 px-4 py-3 text-xs leading-relaxed" style={{ border: "1px solid #FBBF2460", color: "#FBBF24" }}>
                <FlaskConical className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Preview checkout. No payment is taken and no real order is sent. On the live site you will pay by
                  card on a secure hosted checkout at this step.
                </p>
              </div>
            </Panel>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-32" aria-label="Order summary">
            <Panel title="Order summary">
              <CartTotals quote={quote} itemCount={totalQuantity} />

              {failure && (
                <p role="alert" className="mt-5 px-3 py-2.5 text-xs text-red-200" style={{ border: "1px solid #F8717180" }}>
                  {failure}{" "}
                  <Link href="/marketplace/cart" className="underline">
                    Review basket
                  </Link>
                </p>
              )}

              <button
                type="submit"
                disabled={placing || !quote}
                className="w-full mt-6 py-4 flex items-center justify-center gap-3 font-extrabold uppercase tracking-tighter text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: DEEP }}
              >
                <Lock className="w-4 h-4" />
                {placing ? "Placing order…" : quote ? `Place order · ${formatPrice(quote.total)}` : "Place order"}
              </button>
              <p className="text-xs mt-4 leading-relaxed" style={{ color: `${CREAM}80` }}>
                By placing your order you agree to the HalalMe{" "}
                <Link href="/terms" className="underline hover:text-white">
                  terms
                </Link>{" "}
                and each seller&apos;s{" "}
                <Link href="/marketplace/help" className="underline hover:text-white">
                  returns policy
                </Link>
                .
              </p>
            </Panel>
          </aside>
        </form>
      </section>
    </>
  );
}
