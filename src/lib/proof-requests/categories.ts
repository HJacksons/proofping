export const proofRequestCategoryValues = [
  "APARTMENT_LISTING",
  "SELLER_OR_SHOP",
  "ADDRESS_CHECK",
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
    label: "Local situation",
  },
  {
    value: proofRequestCategoryValues[4],
    label: "Document or notice",
  },
  {
    value: proofRequestCategoryValues[5],
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
