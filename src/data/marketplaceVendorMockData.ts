// Seed data for the vendor portal and the admin Marketplace screens.
// Every business, person, order and bank detail here is invented. Dates are
// built relative to "now" so charts and "last 30 days" figures always have
// something to show. marketplaceMockDb is the only importer.

import type { MarketplaceDb } from "@/lib/marketplaceMockDb";
import type {
  MarketplaceSettings,
  OrderEvent,
  OrderStatus,
  Payout,
  ProductStatus,
  Vendor,
  VendorDocStatus,
  VendorDocType,
  VendorOrder,
  VendorProduct,
  VendorStatus,
} from "@/types/marketplaceVendor";

const DAY = 86_400_000;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Small deterministic generator so the seed is the same on every load. */
function createRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&auto=format&fit=crop&q=80`;

const SETTINGS: MarketplaceSettings = {
  defaultCommissionRate: 12,
  categoryRates: { "books-learning": 10, "food-pantry": 15 },
  payoutSchedule: "monthly",
  minimumPayout: 20,
  productApprovalRequired: true,
  commissionOnShipping: false,
  defaultLowStockAt: 5,
  minimumReturnsDays: 14,
};

// ── Vendors ──────────────────────────────────────────────────────────────────

interface VendorSeed {
  id: string;
  name: string;
  status: VendorStatus;
  ageDays: number;
  owner: string;
  city: string;
  categories: string[];
  tagline: string;
  description: string;
  type: Vendor["business"]["type"];
  docs: Partial<Record<VendorDocType, VendorDocStatus>>;
  reviewNote?: string;
  commissionRate?: number;
  /** Leave later onboarding sections empty, for the half-finished application. */
  incomplete?: boolean;
}

const VENDOR_SEEDS: VendorSeed[] = [
  {
    id: "noor-and-co",
    name: "Noor & Co",
    status: "active",
    ageDays: 140,
    owner: "Amina Rahman",
    city: "Birmingham",
    categories: ["modest-fashion"],
    tagline: "Modest clothing in natural fabrics",
    description: "Modest clothing designed and finished in small batches in Birmingham, with a focus on natural fabrics and careful tailoring.",
    type: "limited_company",
    docs: { proof_of_identity: "approved", business_registration: "approved", proof_of_address: "approved", liability_insurance: "approved" },
  },
  {
    id: "barakah-crafts",
    name: "Barakah Crafts",
    status: "active",
    ageDays: 110,
    owner: "Yusuf Malik",
    city: "Bradford",
    categories: ["prayer-worship", "gifts-occasions"],
    tagline: "Handmade prayer essentials",
    description: "Handmade prayer mats, tasbih and alcohol-free fragrance, sourced from family workshops and finished by hand in Bradford.",
    type: "sole_trader",
    docs: { proof_of_identity: "approved", business_registration: "approved", proof_of_address: "approved" },
    commissionRate: 10,
  },
  {
    id: "kitab-corner",
    name: "Kitab Corner",
    status: "active",
    ageDays: 95,
    owner: "Hafsa Ahmed",
    city: "London",
    categories: ["books-learning", "kids-family"],
    tagline: "Independent Islamic bookshop",
    description: "An independent bookshop for Islamic titles, from first board books for toddlers to study editions for students of knowledge.",
    type: "limited_company",
    docs: { proof_of_identity: "approved", business_registration: "approved", proof_of_address: "approved" },
  },
  {
    id: "tayyib-pantry",
    name: "Tayyib Pantry",
    status: "submitted",
    ageDays: 6,
    owner: "Bilal Hussain",
    city: "Manchester",
    categories: ["food-pantry", "daily-essentials"],
    tagline: "Pantry staples, packed to order",
    description: "Dates, spices, honey and everyday pantry staples from suppliers we know personally, packed to order in Manchester.",
    type: "limited_company",
    docs: { proof_of_identity: "uploaded", business_registration: "uploaded", proof_of_address: "uploaded", halal_certificate: "uploaded" },
  },
  {
    id: "sakina-home",
    name: "Sakina Home",
    status: "changes_requested",
    ageDays: 12,
    owner: "Maryam Siddiqui",
    city: "Leicester",
    categories: ["gifts-occasions", "daily-essentials"],
    tagline: "Calm, considered homeware",
    description: "Candles, wall art and small homeware pieces for a calm home, designed in Leicester and made in small runs.",
    type: "sole_trader",
    docs: { proof_of_identity: "approved", business_registration: "approved", proof_of_address: "rejected" },
    reviewNote: "Your proof of address is older than 3 months. Please upload a recent utility bill or bank statement and resubmit.",
  },
  {
    id: "zamzam-gifts",
    name: "Zamzam Gifts",
    status: "draft",
    ageDays: 2,
    owner: "Ibrahim Khan",
    city: "Glasgow",
    categories: [],
    tagline: "",
    description: "",
    type: "sole_trader",
    docs: { proof_of_identity: "uploaded" },
    incomplete: true,
  },
  {
    id: "crescent-tech",
    name: "Crescent Tech",
    status: "rejected",
    ageDays: 30,
    owner: "Omar Farooq",
    city: "Leeds",
    categories: ["daily-essentials"],
    tagline: "Phone accessories",
    description: "Phone cases, chargers and accessories imported and resold from our Leeds unit, shipped across the UK.",
    type: "limited_company",
    docs: { proof_of_identity: "approved", business_registration: "rejected", proof_of_address: "approved" },
    reviewNote: "We could not verify the company registration supplied, and the product range is outside what the marketplace stocks at launch.",
  },
  {
    id: "medina-kids",
    name: "Medina Kids",
    status: "suspended",
    ageDays: 100,
    owner: "Khadija Ali",
    city: "Luton",
    categories: ["kids-family"],
    tagline: "Toys and books for little Muslims",
    description: "Toys, puzzles and activity books that help young children learn about their faith through play.",
    type: "sole_trader",
    docs: { proof_of_identity: "approved", business_registration: "approved", proof_of_address: "approved" },
    reviewNote: "Paused while we resolve three late-dispatch complaints. Reply to the support ticket to arrange a call.",
  },
];

function buildVendor(seed: VendorSeed, now: number): Vendor {
  const created = new Date(now - seed.ageDays * DAY).toISOString();
  const wasSubmitted = seed.status !== "draft";
  const wasApproved = seed.status === "active" || seed.status === "suspended";
  const slug = seed.id.replace(/-/g, "");
  const blank = seed.incomplete;

  return {
    id: seed.id,
    handle: seed.id,
    status: seed.status,
    createdAt: created,
    submittedAt: wasSubmitted ? new Date(now - (seed.ageDays - 1) * DAY).toISOString() : null,
    approvedAt: wasApproved ? new Date(now - (seed.ageDays - 4) * DAY).toISOString() : null,
    reviewNote: seed.reviewNote ?? null,
    business: {
      legalName: seed.type === "limited_company" ? `${seed.name} Ltd` : seed.name,
      tradingName: seed.name,
      type: seed.type,
      companyNumber: seed.type === "limited_company" ? "0" + (1234567 + seed.ageDays * 911) : "",
      vatNumber: "",
      address: `${10 + seed.ageDays} Market Street`,
      city: seed.city,
      postCode: "AB1 2CD",
      country: "United Kingdom",
    },
    owner: {
      name: seed.owner,
      email: `${seed.owner.split(" ")[0].toLowerCase()}@${slug}.example`,
      phone: "07700 900" + String(100 + seed.ageDays).slice(-3),
    },
    store: {
      name: blank ? "" : seed.name,
      tagline: seed.tagline,
      description: seed.description,
      logo: null,
      banner: null,
      supportEmail: blank ? "" : `hello@${slug}.example`,
    },
    categories: seed.categories,
    delivery: {
      dispatchDays: blank ? 0 : 2,
      ukRate: 3.95,
      freeOver: blank ? null : 40,
      couriers: blank ? [] : ["Royal Mail", "Evri"],
      returnsDays: 14,
      returnsAddress: blank ? "" : `${10 + seed.ageDays} Market Street, ${seed.city}, AB1 2CD`,
      returnsPolicy: blank ? "" : "Unused items can be returned within 14 days of delivery. Return postage is paid by the customer unless the item is faulty.",
    },
    payout: {
      accountName: blank ? "" : seed.type === "limited_company" ? `${seed.name} Ltd` : seed.owner,
      sortCode: blank ? "" : "12-34-56",
      accountNumber: blank ? "" : String(10000000 + seed.ageDays * 31337).slice(0, 8),
    },
    documents: (Object.entries(seed.docs) as [VendorDocType, VendorDocStatus][]).map(([type, status]) => ({
      type,
      fileName: `${type.replace(/_/g, "-")}.pdf`,
      status,
      rejectionReason: status === "rejected" ? "The document supplied could not be accepted. See the note on your application." : null,
      uploadedAt: created,
    })),
    commissionRate: seed.commissionRate ?? null,
    notificationPrefs: { newOrder: true, lowStock: true, productReview: true, payouts: true, marketing: false },
    welcomeSeen: wasApproved,
  };
}

// ── Products ─────────────────────────────────────────────────────────────────

interface ProductSeed {
  vendor: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  status?: ProductStatus;
  reviewNote?: string;
  /** [name, stock] pairs. Omit for a single-variant product. */
  variants?: [string, number][];
  stock?: number;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  { vendor: "noor-and-co", title: "Silk Blend Hijab", description: "A soft, breathable silk blend with a matte finish that stays in place through the day.", category: "modest-fashion", price: 24.99, image: img("1590073242678-70ee3fc28e8e"), variants: [["Sand", 18], ["Olive", 4], ["Black", 31]] },
  { vendor: "noor-and-co", title: "Linen Abaya", description: "A relaxed, full-length abaya cut from washed linen. Side pockets and covered buttons.", category: "modest-fashion", price: 59.99, image: img("1583391733956-3750e0ff4e8b"), variants: [["S", 6], ["M", 12], ["L", 0]] },
  { vendor: "noor-and-co", title: "Classic Thobe", description: "An everyday thobe in a crease-resistant cotton blend with a concealed placket.", category: "modest-fashion", price: 44.99, image: img("1617137968427-85924c800a22"), variants: [["M", 9], ["L", 14], ["XL", 3]] },
  { vendor: "noor-and-co", title: "Modest Activewear Set", description: "A longline top and loose-fit trousers in a lightweight, quick-dry fabric.", category: "modest-fashion", price: 38.99, image: img("1571945153237-4929e783af4a"), variants: [["S", 7], ["M", 10], ["L", 8]] },
  { vendor: "noor-and-co", title: "Jersey Underscarf Twin Pack", description: "Two stretch jersey underscarves that keep a hijab in place without slipping.", category: "modest-fashion", price: 9.99, stock: 42, status: "pending_review" },
  { vendor: "noor-and-co", title: "Wool Blend Winter Jilbab", description: "A warm, lined jilbab for colder months.", category: "modest-fashion", price: 84.0, stock: 10, status: "changes_requested", reviewNote: "Please add at least one photo and the fabric composition to the description." },
  { vendor: "noor-and-co", title: "Embroidered Prayer Dress", description: "A one-piece prayer dress with a delicate embroidered trim.", category: "modest-fashion", price: 32.0, stock: 0, status: "draft" },

  { vendor: "barakah-crafts", title: "Handwoven Prayer Mat", description: "A thick, handwoven mat with a padded base for comfort in sujood.", category: "prayer-worship", price: 49.99, image: img("1585036156171-384164a8c159"), stock: 22 },
  { vendor: "barakah-crafts", title: "Oud Attar Set", description: "Three alcohol-free attar oils in 6ml roller bottles: oud, amber and white musk.", category: "prayer-worship", price: 39.99, image: img("1594035910387-fea081ac26b0"), stock: 3 },
  { vendor: "barakah-crafts", title: "Olive Wood Tasbih", description: "Ninety-nine hand-turned olive wood beads on a strong cord.", category: "prayer-worship", price: 12.99, stock: 60 },
  { vendor: "barakah-crafts", title: "Eid Gift Box", description: "A ready-to-give box with dates, attar, a scented candle and a handwritten card.", category: "gifts-occasions", price: 29.99, stock: 15, status: "paused" },
  { vendor: "barakah-crafts", title: "Travel Prayer Mat with Compass", description: "A pocket-sized mat with a built-in qibla compass and carry pouch.", category: "prayer-worship", price: 14.5, stock: 35, status: "pending_review" },

  { vendor: "kitab-corner", title: "Qur'an with English Translation", description: "A hardback edition with Arabic text and a clear English translation side by side.", category: "books-learning", price: 22.0, stock: 28 },
  { vendor: "kitab-corner", title: "My First Duas Board Book", description: "Ten everyday duas with bright illustrations on sturdy pages.", category: "kids-family", price: 8.99, stock: 54 },
  { vendor: "kitab-corner", title: "Stories of the Prophets", description: "A retelling for readers aged 8 to 12, with maps and a glossary.", category: "books-learning", price: 14.99, stock: 2 },
  { vendor: "kitab-corner", title: "Arabic Alphabet Flashcards", description: "Twenty-eight large, wipe-clean cards with letter forms and example words.", category: "kids-family", price: 7.5, stock: 40 },
  { vendor: "kitab-corner", title: "Ramadan Journal", description: "A guided 30-day journal with daily prompts, trackers and reflection pages.", category: "books-learning", price: 12.0, stock: 25, status: "pending_review" },

  { vendor: "medina-kids", title: "Masjid Building Blocks", description: "A 120-piece wooden block set that builds into a masjid.", category: "kids-family", price: 27.99, stock: 12, status: "unpublished", reviewNote: "Unpublished while the store is suspended." },
  { vendor: "medina-kids", title: "Salah Steps Puzzle", description: "A chunky wooden puzzle showing the steps of the prayer.", category: "kids-family", price: 11.99, stock: 20, status: "unpublished", reviewNote: "Unpublished while the store is suspended." },
];

function buildProducts(now: number): VendorProduct[] {
  return PRODUCT_SEEDS.map((seed, i) => {
    const id = `p${String(i + 1).padStart(3, "0")}`;
    const skuBase = seed.title.replace(/[^A-Za-z]/g, "").slice(0, 5).toUpperCase();
    const variants = seed.variants
      ? seed.variants.map(([name, stock], v) => ({
          id: `${id}-v${v + 1}`,
          name,
          sku: `${skuBase}-${name.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
          price: seed.price,
          stock,
        }))
      : [{ id: `${id}-v1`, name: "Default", sku: `${skuBase}-01`, price: seed.price, stock: seed.stock ?? 0 }];
    const created = new Date(now - (80 - i * 3) * DAY).toISOString();

    return {
      id,
      vendorId: seed.vendor,
      title: seed.title,
      description: seed.description,
      category: seed.category,
      images: seed.image ? [seed.image] : [],
      compareAtPrice: null,
      weightGrams: 400,
      lowStockAt: SETTINGS.defaultLowStockAt,
      variants,
      status: seed.status ?? "live",
      reviewNote: seed.reviewNote ?? null,
      createdAt: created,
      updatedAt: created,
    };
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

const CUSTOMERS = [
  ["Sara Qureshi", "Leeds", "LS6 2AB"],
  ["Hamza Sheikh", "London", "E1 6AN"],
  ["Layla Hassan", "Cardiff", "CF10 1EP"],
  ["Zayn Patel", "Leicester", "LE1 5WW"],
  ["Fatima Noor", "Glasgow", "G1 2FF"],
  ["Idris Begum", "Bristol", "BS1 4DJ"],
  ["Ayesha Mirza", "Sheffield", "S1 2HE"],
  ["Tariq Aziz", "Nottingham", "NG1 5FS"],
  ["Nadia Karim", "Oxford", "OX1 3BG"],
  ["Musa Ibrahim", "Luton", "LU1 2SJ"],
] as const;

function statusForAge(ageDays: number, roll: number): OrderStatus {
  if (ageDays < 1) return "new";
  if (ageDays < 2) return roll < 0.5 ? "new" : "accepted";
  if (ageDays < 3) return roll < 0.5 ? "accepted" : "packed";
  if (ageDays < 7) return "shipped";
  if (roll < 0.06) return "cancelled";
  if (roll < 0.1) return "refunded";
  return "delivered";
}

function timelineFor(status: OrderStatus, placed: number): OrderEvent[] {
  const at = (hours: number) => new Date(placed + hours * 3_600_000).toISOString();
  const events: OrderEvent[] = [{ status: "new", at: at(0), note: null }];
  if (status === "new") return events;
  if (status === "cancelled") return [...events, { status: "cancelled", at: at(5), note: "Item out of stock" }];
  events.push({ status: "accepted", at: at(3), note: null });
  if (status === "accepted") return events;
  events.push({ status: "packed", at: at(20), note: null });
  if (status === "packed") return events;
  events.push({ status: "shipped", at: at(28), note: null });
  if (status === "shipped") return events;
  events.push({ status: "delivered", at: at(76), note: null });
  if (status === "refunded") events.push({ status: "refunded", at: at(140), note: "Returned by customer" });
  return events;
}

function buildOrders(vendors: Vendor[], products: VendorProduct[], now: number) {
  const random = createRandom(20261011);
  const orders: VendorOrder[] = [];
  const payouts: Payout[] = [];
  let counter = 10_200;

  // Suspended vendors traded before they were paused, so they keep a history.
  const trading = vendors.filter((v) => v.status === "active" || v.status === "suspended");

  for (const vendor of trading) {
    const catalogue = products.filter((p) => p.vendorId === vendor.id && (p.status === "live" || p.status === "unpublished"));
    if (catalogue.length === 0) continue;
    const firstDay = vendor.status === "suspended" ? 14 : 0;

    for (let day = 89; day >= firstDay; day--) {
      const count = random() < 0.42 ? (random() < 0.25 ? 2 : 1) : 0;
      for (let n = 0; n < count; n++) {
        const placed = now - day * DAY - Math.floor(random() * 10) * 3_600_000 - 3_600_000;
        const ageDays = (now - placed) / DAY;
        const status = statusForAge(ageDays, random());
        const customer = CUSTOMERS[Math.floor(random() * CUSTOMERS.length)];

        const lineCount = random() < 0.3 ? 2 : 1;
        const picked = new Set<string>();
        const items = [];
        for (let l = 0; l < lineCount; l++) {
          const product = catalogue[Math.floor(random() * catalogue.length)];
          if (picked.has(product.id)) continue;
          picked.add(product.id);
          const variant = product.variants[Math.floor(random() * product.variants.length)];
          items.push({
            productId: product.id,
            title: product.title,
            variantName: product.variants.length > 1 ? variant.name : null,
            sku: variant.sku,
            quantity: random() < 0.2 ? 2 : 1,
            unitPrice: variant.price,
          });
        }

        const subtotal = round2(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));
        const shipping = vendor.delivery.freeOver !== null && subtotal >= vendor.delivery.freeOver ? 0 : vendor.delivery.ukRate;
        const rate = vendor.commissionRate ?? SETTINGS.defaultCommissionRate;
        const commissionAmount = round2((subtotal * rate) / 100);
        const total = round2(subtotal + shipping);
        const shipped = status === "shipped" || status === "delivered" || status === "refunded";

        counter += 1;
        orders.push({
          id: `o${counter}`,
          number: `HM-${counter}`,
          vendorId: vendor.id,
          placedAt: new Date(placed).toISOString(),
          status,
          customer: {
            name: customer[0],
            email: `${customer[0].split(" ")[0].toLowerCase()}@customer.example`,
            phone: "07700 900" + String(200 + Math.floor(random() * 700)),
          },
          shippingAddress: { line1: `${1 + Math.floor(random() * 90)} High Street`, city: customer[1], postCode: customer[2] },
          customerNote: random() < 0.12 ? "Please leave with a neighbour if I am out." : null,
          items,
          subtotal,
          shipping,
          total,
          commissionRate: rate,
          commissionAmount,
          vendorNet: round2(total - commissionAmount),
          tracking: shipped ? { courier: "Royal Mail", number: "RM" + String(100000000 + Math.floor(random() * 899999999)) + "GB" } : null,
          timeline: timelineFor(status, placed),
          payoutId: null,
        });
      }
    }

    // Two closed payout periods. Anything delivered in the last 30 days is
    // still owed, which is what gives each vendor an available balance.
    const periods = [
      { from: 90, to: 60, status: "paid" as const },
      { from: 60, to: 30, status: vendor.id === "barakah-crafts" ? ("processing" as const) : ("paid" as const) },
    ];
    for (const period of periods) {
      const start = now - period.from * DAY;
      const end = now - period.to * DAY;
      const included = orders.filter(
        (o) => o.vendorId === vendor.id && o.status === "delivered" && new Date(o.placedAt).getTime() >= start && new Date(o.placedAt).getTime() < end,
      );
      if (included.length === 0) continue;
      const id = `pay-${vendor.id}-${period.from}`;
      included.forEach((o) => { o.payoutId = id; });
      payouts.push({
        id,
        vendorId: vendor.id,
        periodStart: new Date(start).toISOString(),
        periodEnd: new Date(end).toISOString(),
        amount: round2(included.reduce((s, o) => s + o.vendorNet, 0)),
        orderCount: included.length,
        status: period.status,
        createdAt: new Date(end + 2 * DAY).toISOString(),
        paidAt: period.status === "paid" ? new Date(end + 4 * DAY).toISOString() : null,
        reference: `HALALME-${vendor.id.slice(0, 4).toUpperCase()}-${period.from}`,
      });
    }
  }

  orders.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  return { orders, payouts };
}

// ── Assemble ─────────────────────────────────────────────────────────────────

export function buildSeed(now = Date.now()): MarketplaceDb {
  const ago = (days: number) => new Date(now - days * DAY).toISOString();
  const vendors = VENDOR_SEEDS.map((seed) => buildVendor(seed, now));
  const products = buildProducts(now);
  const { orders, payouts } = buildOrders(vendors, products, now);

  return {
    vendors,
    products,
    orders,
    payouts,
    settings: SETTINGS,
    promotions: [
      { id: "promo1", vendorId: "noor-and-co", code: "NOOR10", type: "percent", value: 10, minSpend: 30, startsAt: ago(20), endsAt: null, usageLimit: 200, used: 37, paused: false },
      { id: "promo2", vendorId: "noor-and-co", code: "EIDSHIP", type: "free_shipping", value: 0, minSpend: null, startsAt: ago(-10), endsAt: ago(-24), usageLimit: null, used: 0, paused: false },
      { id: "promo3", vendorId: "noor-and-co", code: "WELCOME5", type: "fixed", value: 5, minSpend: 25, startsAt: ago(80), endsAt: ago(50), usageLimit: 100, used: 64, paused: false },
      { id: "promo4", vendorId: "kitab-corner", code: "READ15", type: "percent", value: 15, minSpend: null, startsAt: ago(5), endsAt: ago(-9), usageLimit: 50, used: 8, paused: false },
    ],
    notifications: [
      { id: "n1", vendorId: "noor-and-co", kind: "order", title: "New order received", body: "You have a new order waiting to be accepted.", at: ago(0.1), read: false, href: "/vendor/orders" },
      { id: "n2", vendorId: "noor-and-co", kind: "product", title: "Changes requested on a product", body: "Wool Blend Winter Jilbab needs a photo and fabric details before it can go live.", at: ago(1), read: false, href: "/vendor/products" },
      { id: "n3", vendorId: "noor-and-co", kind: "stock", title: "Low stock", body: "Silk Blend Hijab in Olive is down to 4 units.", at: ago(2), read: false, href: "/vendor/inventory" },
      { id: "n4", vendorId: "noor-and-co", kind: "payout", title: "Payout sent", body: "Your payout for last month has been sent to your bank account.", at: ago(26), read: true, href: "/vendor/earnings" },
      { id: "n5", vendorId: "noor-and-co", kind: "account", title: "Welcome to HalalMe Marketplace", body: "Your store is approved. Add your first products to start selling.", at: ago(136), read: true, href: "/vendor/products" },
      { id: "n6", vendorId: "barakah-crafts", kind: "stock", title: "Low stock", body: "Oud Attar Set is down to 3 units.", at: ago(1), read: false, href: "/vendor/inventory" },
      { id: "n7", vendorId: "kitab-corner", kind: "order", title: "New order received", body: "You have a new order waiting to be accepted.", at: ago(0.3), read: false, href: "/vendor/orders" },
      { id: "n8", vendorId: "sakina-home", kind: "account", title: "Changes requested on your application", body: "We need a more recent proof of address before we can approve your store.", at: ago(3), read: false, href: "/vendor" },
    ],
    tickets: [
      {
        id: "t1",
        vendorId: "noor-and-co",
        subject: "Can I offer next-day delivery?",
        topic: "Delivery",
        status: "answered",
        createdAt: ago(9),
        messages: [
          { from: "vendor", body: "Some of my customers ask for next-day delivery. Is there a way to offer it as an option at checkout?", at: ago(9) },
          { from: "support", body: "Not yet. For now each store has one UK delivery rate. Express options are on our list, and we will let all sellers know when they are ready.", at: ago(8) },
        ],
      },
      {
        id: "t2",
        vendorId: "medina-kids",
        subject: "Store suspended",
        topic: "Account",
        status: "open",
        createdAt: ago(13),
        messages: [{ from: "vendor", body: "My store has been paused. I have now caught up on dispatch. What do I need to do to be reinstated?", at: ago(13) }],
      },
    ],
  };
}
