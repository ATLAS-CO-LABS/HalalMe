// Single source of truth for the HalalMe Merchant Agreement. Rendered both
// inline on the merchant dashboard (Agreed stage) and in the confirmation email
// sent on signing, so the merchant reads exactly what they sign and receives the
// same wording for their records.
//
// NOTE: this is a sensible starting template, not legal advice. Have it reviewed
// and adjust the wording/clauses before relying on it commercially.

export const AGREEMENT_VERSION = "1.0";

export interface AgreementClause {
  heading: string;
  body: string;
}

export interface MerchantAgreement {
  title: string;
  version: string;
  effectiveDate: string;
  /** "between HalalMe and {restaurant}" line. */
  parties: string;
  intro: string;
  commissionLabel: string; // e.g. "25%"
  clauses: AgreementClause[];
}

function fmtPct(n: number): string {
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function buildMerchantAgreement(params: {
  restaurantName: string;
  ownerName?: string | null;
  commission: number;
  date?: Date;
}): MerchantAgreement {
  const { restaurantName, commission } = params;
  const date = params.date ?? new Date();
  const pct = fmtPct(commission);

  return {
    title: "HalalMe Merchant Partnership Agreement",
    version: AGREEMENT_VERSION,
    effectiveDate: fmtDate(date),
    parties: `This Agreement is made between HalalMe ("HalalMe", "we", "us") and ${restaurantName} ("the Merchant", "you").`,
    intro:
      "By signing below, the Merchant agrees to list and sell through the HalalMe platform on the terms set out in this Agreement. Please read each clause carefully.",
    commissionLabel: pct,
    clauses: [
      {
        heading: "1. Commission",
        body: `HalalMe will charge a commission of ${pct} on the gross order value (excluding delivery fees and applicable taxes) for each order placed through the platform. This rate is fixed for the term of this Agreement unless varied in writing under clause 12.`,
      },
      {
        heading: "2. Orders & Service",
        body: `${restaurantName} agrees to accept, prepare and fulfil orders received through HalalMe promptly and to the standard advertised. The Merchant is responsible for the quality, accuracy and safety of all items it supplies.`,
      },
      {
        heading: "3. Payments & Settlement",
        body: "HalalMe will remit order proceeds, less the agreed commission and any applicable platform or payment-processing fees, to the Merchant on the agreed settlement cycle. The Merchant is responsible for its own tax obligations on its sales.",
      },
      {
        heading: "4. Halal Integrity & Food Standards",
        body: `${restaurantName} warrants that all items described as halal are genuinely halal and that it holds and maintains valid halal certification and food-hygiene registration. The Merchant must comply with all applicable food-safety, labelling and allergen laws.`,
      },
      {
        heading: "5. Menu, Pricing & Availability",
        body: "The Merchant is responsible for keeping its menu, prices, opening hours and item availability accurate and up to date in its dashboard. Prices charged to customers on HalalMe must not be higher than the Merchant's standard in-store prices unless agreed.",
      },
      {
        heading: "6. Merchant Obligations",
        body: "The Merchant will maintain all licences, insurances and registrations required to operate lawfully, will deal fairly with customers, and will not use the platform for any unlawful, misleading or harmful purpose.",
      },
      {
        heading: "7. HalalMe Obligations",
        body: "HalalMe will provide the platform, list the Merchant to customers, process orders and payments, and provide reasonable support. HalalMe may carry out marketing and promotion of the Merchant on the platform.",
      },
      {
        heading: "8. Term & Termination",
        body: "This Agreement begins on the effective date and continues until terminated. Either party may terminate on 30 days' written notice. HalalMe may suspend or terminate immediately for a material breach, fraud, or a halal-integrity or food-safety concern.",
      },
      {
        heading: "9. Liability",
        body: "Nothing in this Agreement limits liability for death, personal injury or fraud. Subject to that, neither party is liable for indirect or consequential loss, and the Merchant remains solely responsible for the food and service it provides.",
      },
      {
        heading: "10. Data Protection",
        body: "Each party will comply with applicable UK data-protection law. Customer personal data shared for order fulfilment must be used only to fulfil the order and not retained or reused for the Merchant's own marketing without consent.",
      },
      {
        heading: "11. Confidentiality",
        body: "Each party will keep the other's non-public commercial information (including the commission rate in this Agreement) confidential, except where disclosure is required by law.",
      },
      {
        heading: "12. Variations & Governing Law",
        body: "Any change to this Agreement, including the commission rate, must be agreed in writing (which includes confirmation through the HalalMe platform). This Agreement is governed by the laws of England and Wales.",
      },
    ],
  };
}
