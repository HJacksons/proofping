export const productFeedbackCategoryValues = [
  "broken",
  "confusing",
  "idea",
  "all_good",
] as const;

export type ProductFeedbackCategory =
  (typeof productFeedbackCategoryValues)[number];

export function getProductFeedbackCategoryLabel(category: string) {
  switch (category) {
    case "broken":
      return "Something’s broken";
    case "confusing":
      return "Confusing";
    case "idea":
      return "Idea";
    case "all_good":
      return "All good";
    default:
      return category;
  }
}
