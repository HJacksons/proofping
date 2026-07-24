export const proofRequestCategoryValues = [
  "APARTMENT_LISTING",
  "SELLER_OR_SHOP",
  "ADDRESS_CHECK",
  "FACILITY_OR_QUEUE",
  "LOCAL_SITUATION",
  "DOCUMENT_OR_NOTICE",
  "OTHER",
] as const;

export const proofRequestCategories = [
  {
    value: proofRequestCategoryValues[0],
    label: "Apartment listing",
  },
  {
    value: proofRequestCategoryValues[1],
    label: "Seller or shop",
  },
  {
    value: proofRequestCategoryValues[2],
    label: "Address check",
  },
  {
    value: proofRequestCategoryValues[3],
    label: "Printer, queue, room, access",
  },
  {
    value: proofRequestCategoryValues[4],
    label: "Open / crowded / right now",
  },
  {
    value: proofRequestCategoryValues[5],
    label: "Document or notice",
  },
  {
    value: proofRequestCategoryValues[6],
    label: "Other",
  },
] as const;

export type ProofRequestCategory = (typeof proofRequestCategories)[number]["value"];

export function getProofRequestCategoryLabel(category: string): string {
  return (
    proofRequestCategories.find((item) => item.value === category)?.label ??
    "Other"
  );
}

/** Example asks shown on the create form (busy places + marketplace). */
export const proofRequestExampleAsks = [
  "How long is the queue at the west gate?",
  "Is the beach parking full right now?",
  "Is the library printer working?",
  "Is this market stall actually open?",
  "Is this Marketplace phone deal real?",
  "Worth going, or pick another option?",
] as const;
