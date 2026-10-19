"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Lock, MapPin, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import { useMarketplaceCart } from "@/context/MarketplaceCartContext";
import type { MarketplaceProduct } from "@/types/marketplace";
import { ProductGrid, ProductImage, SaveButton } from "@/components/marketplace/ProductCard";
import { Eyebrow, Notice, QuantityStepper } from "@/components/marketplace/shared";
import { SellerLogo } from "@/components/marketplace/SellerLogo";
import { BG, BG2, BLUE, CREAM, DEEP, formatPrice } from "@/components/marketplace/theme";

const LOW_STOCK = 5;

export default function MarketplaceProductPage() {
  const { handle } = useParams<{ handle: string }>();

  const { data: product, loading, error } = useMarketplaceQuery(`product:${handle}`, () =>
    marketplaceService.getProduct(handle),
  );

  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-16">
        <Notice
          title={error ? "Something Went Wrong" : "Product Not Found"}
          message={
            error
              ? "We could not load this product. Please refresh and try again."
              : "This product does not exist or is no longer available."
          }
          actionHref="/marketplace/shop"
          actionLabel="Shop All"
        />
      </div>
    );
  }

  // Keyed so option and quantity state reset when moving between products
  return <ProductDetail key={product.id} product={product} />;
}

function ProductDetail({ product }: { product: MarketplaceProduct }) {
  const { addLine, lines } = useMarketplaceCart();

  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(firstAvailable.selectedOptions.map((o) => [o.name, o.value])),
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const variant =
    product.variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)) ?? firstAvailable;

  // Stock still free to add: what is left minus what is already in the basket.
  const inBasket = lines.find((l) => l.variantId === variant.id)?.quantity ?? 0;
  const remaining = Math.max(0, variant.stock - inBasket);
  const canAdd = variant.available && remaining > 0;
  const wanted = Math.min(quantity, Math.max(1, remaining));

  /** Would picking this value (keeping the other choices) land on a variant that is in stock? */
  const isValueAvailable = (optionName: string, value: string) =>
    product.variants.some(
      (v) =>
        v.available &&
        v.selectedOptions.every((o) => (o.name === optionName ? o.value === value : selected[o.name] === o.value)),
    );

  const handleAdd = () => {
    addLine(
      {
        variantId: variant.id,
        productHandle: product.handle,
        title: product.title,
        variantTitle: product.options.length > 0 ? variant.title : null,
        vendor: product.vendor,
        price: variant.price,
        image: product.images[0] ?? null,
      },
      wanted,
    );
    setQuantity(1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const { data: seller } = useMarketplaceQuery(`vendor:${product.vendor.handle}`, () =>
    marketplaceService.getVendor(product.vendor.handle),
  );
  const { data: related } = useMarketplaceQuery(`related:${product.id}`, () =>
    marketplaceService
      .listProducts({ category: product.category.handle })
      .then((items) => items.filter((p) => p.id !== product.id).slice(0, 4)),
  );

  const stockNote = !variant.available
    ? null
    : inBasket > 0 && remaining === 0
      ? "You have all the remaining stock in your basket."
      : variant.stock <= LOW_STOCK
        ? `Only ${variant.stock} left`
        : "In stock";

  return (
    <>
      <section className="py-8 md:py-12" style={{ backgroundColor: BG }}>
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
            <ol
              className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: `${CREAM}B3` }}
            >
              <li>
                <Link href="/marketplace/shop" className="transition-colors hover:text-white">
                  Shop
                </Link>
              </li>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <li>
                <Link href={`/marketplace/c/${product.category.handle}`} className="transition-colors hover:text-white">
                  {product.category.title}
                </Link>
              </li>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <li aria-current="page" style={{ color: BLUE }}>
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="relative aspect-square overflow-hidden" style={{ border: `1px solid ${BLUE}50` }}>
                <ProductImage image={product.images[activeImage] ?? null} categoryHandle={product.category.handle} />
                <SaveButton handle={product.handle} title={product.title} className="absolute top-3 right-3" />
              </div>
              {product.images.length > 1 && (
                <ul className="grid grid-cols-5 gap-2 mt-2">
                  {product.images.map((image, i) => (
                    <li key={`${i}-${image.url.slice(-16)}`}>
                      <button
                        type="button"
                        onClick={() => setActiveImage(i)}
                        aria-label={`Show image ${i + 1} of ${product.images.length}`}
                        aria-current={i === activeImage}
                        className="relative block w-full aspect-square overflow-hidden"
                        style={{ border: `1px solid ${i === activeImage ? BLUE : `${BLUE}30`}` }}
                      >
                        <ProductImage image={image} categoryHandle={product.category.handle} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Buy box */}
            <div>
              <Link
                href={`/marketplace/sellers/${product.vendor.handle}`}
                className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-4 transition-colors hover:text-white"
                style={{ color: BLUE }}
              >
                {product.vendor.name}
              </Link>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.92] mb-5"
                style={{ color: CREAM }}
              >
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-extrabold tracking-tighter" style={{ color: CREAM }}>
                  {formatPrice(variant.price)}
                </span>
                {variant.compareAtPrice !== null && variant.compareAtPrice > variant.price && (
                  <span className="text-base line-through" style={{ color: `${CREAM}B3` }}>
                    {formatPrice(variant.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] mb-8 min-h-4" style={{ color: variant.available && variant.stock > LOW_STOCK ? "#4ADE80" : "#FBBF24" }}>
                {stockNote}
              </p>

              {/* Options */}
              {product.options.map((option) => (
                <fieldset key={option.name} className="mb-6">
                  <legend className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: `${CREAM}B3` }}>
                    {option.name}: <span style={{ color: CREAM }}>{selected[option.name]}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const active = selected[option.name] === value;
                      const inStock = isValueAvailable(option.name, value);
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setSelected((current) => ({ ...current, [option.name]: value }));
                            setQuantity(1);
                          }}
                          className={`min-w-12 px-4 py-2.5 text-sm font-extrabold uppercase tracking-tighter transition-colors ${
                            inStock ? "" : "line-through"
                          }`}
                          style={{
                            backgroundColor: active ? DEEP : BG2,
                            color: active ? "#fff" : inStock ? CREAM : `${CREAM}80`,
                            border: `1px solid ${active ? DEEP : `${BLUE}50`}`,
                          }}
                        >
                          {value}
                          {!inStock && <span className="sr-only"> (sold out)</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              {/* Quantity + add */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <QuantityStepper quantity={wanted} onChange={setQuantity} label={product.title} max={remaining} />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!canAdd}
                  className="flex-1 min-w-48 h-10 flex items-center justify-center gap-2.5 font-extrabold uppercase tracking-tighter text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: DEEP }}
                >
                  {!variant.available ? (
                    "Sold Out"
                  ) : justAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Basket
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Basket
                    </>
                  )}
                </button>
              </div>
              <p className="min-h-5 text-xs" aria-live="polite">
                {justAdded && (
                  <Link href="/marketplace/cart" className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.15em] hover:text-white" style={{ color: BLUE }}>
                    View basket <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </p>

              {/* Description */}
              <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${BLUE}30` }}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: `${CREAM}B3` }}>
                  About this product
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: `${CREAM}CC`, fontFamily: "var(--font-body)" }}>
                  {product.description}
                </p>
              </div>

              {/* Delivery and returns, from this seller's own settings */}
              <ul className="mt-6 pt-6 space-y-3" style={{ borderTop: `1px solid ${BLUE}30` }}>
                {[
                  {
                    icon: Truck,
                    text: seller
                      ? `${seller.deliveryRate === 0 ? "Free UK delivery" : `${formatPrice(seller.deliveryRate)} UK delivery`}${
                          seller.freeDeliveryOver !== null && seller.deliveryRate > 0 ? `, free when you spend ${formatPrice(seller.freeDeliveryOver)} with this seller` : ""
                        }. ${seller.dispatch}.`
                      : "Sent to you directly by the seller, with tracking.",
                  },
                  { icon: RotateCcw, text: seller ? `${seller.returnsDays}-day returns. ${seller.returnsPolicy}`.trim() : "Returns accepted. See details at checkout." },
                  { icon: Lock, text: "Secure card checkout. HalalMe never stores your card details." },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-xs leading-relaxed" style={{ color: `${CREAM}B3` }}>
                    <item.icon className="w-4 h-4 shrink-0 mt-px" style={{ color: BLUE }} aria-hidden="true" />
                    {item.text}
                  </li>
                ))}
              </ul>

              {/* Seller */}
              {seller && (
                <Link
                  href={`/marketplace/sellers/${seller.handle}`}
                  className="group flex items-center gap-4 mt-6 p-4 transition-colors hover:bg-white/5"
                  style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}
                >
                  <SellerLogo seller={seller} size={48} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}B3` }}>
                      Sold and sent by
                    </span>
                    <span className="block text-sm font-extrabold uppercase tracking-tighter truncate" style={{ color: CREAM }}>
                      {seller.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs mt-0.5" style={{ color: `${CREAM}B3` }}>
                      <MapPin className="w-3 h-3" /> {seller.location}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: BLUE }} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related && related.length > 0 && (
        <section className="py-16 md:py-20" style={{ backgroundColor: BG2, borderTop: `1px solid ${BLUE}50` }}>
          <div className="max-w-[95vw] mx-auto px-6 md:px-10">
            <Eyebrow>More in {product.category.title}</Eyebrow>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <section className="py-8 md:py-12" aria-busy="true">
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 animate-pulse">
        <div className="h-3 w-56 mb-8" style={{ backgroundColor: BG2 }} />
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          <div className="aspect-square" style={{ backgroundColor: BG2 }} />
          <div className="space-y-5">
            <div className="h-3 w-28" style={{ backgroundColor: BG2 }} />
            <div className="h-10 w-4/5" style={{ backgroundColor: BG2 }} />
            <div className="h-8 w-24" style={{ backgroundColor: BG2 }} />
            <div className="h-10 w-full" style={{ backgroundColor: BG2 }} />
            <div className="h-24 w-full" style={{ backgroundColor: BG2 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
