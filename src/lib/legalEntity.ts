// Registered entity details for HalalMe, matched to the current Companies
// House record (No. 13450710), verified live 11 Aug 2026.
//
// WA-01 is resolving an active strike-off proposal and a registered-office
// address that moved to the Companies House default on 29 June 2026 — the
// address below is that default, not a real trading address, but it is the
// legally accurate current record and that's what "Who we are" pages must
// show.
//
// Per HME-WEB-DEC-001 (Sami, 9 Aug 2026): the intended future name is
// "HalalMe Ltd" (one word) and the intended future registered office is in
// Leicester, but neither may be published here until Companies House has
// actually registered them. Update this file — not individual pages — once
// WA-01/WA-02 clear.

export const LEGAL_ENTITY = {
  tradingName: "HalalMe",
  registeredName: "Halal Delivery Ltd",
  companyNumber: "13450710",
  jurisdiction: "England and Wales",
  registeredOffice: "PO Box 4385, Cardiff, CF14 8LH, United Kingdom",
} as const;

export const LEGAL_ENTITY_STATEMENT =
  `${LEGAL_ENTITY.tradingName} is operated by ${LEGAL_ENTITY.registeredName} ` +
  `(Company No. ${LEGAL_ENTITY.companyNumber}), registered in ${LEGAL_ENTITY.jurisdiction}, ` +
  `with a registered office at ${LEGAL_ENTITY.registeredOffice}.`;

export const LEGAL_ENTITY_SHORT =
  `${LEGAL_ENTITY.registeredName} (Company No. ${LEGAL_ENTITY.companyNumber}), registered in ${LEGAL_ENTITY.jurisdiction}.`;
