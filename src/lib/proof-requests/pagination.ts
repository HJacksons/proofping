export const DASHBOARD_REQUESTS_PAGE_SIZE = 20;
export const NEARBY_REQUESTS_PAGE_SIZE = 8;
export const REPLIES_PAGE_SIZE = 10;

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function paginateByCursor<T extends { id: string }>(
  rows: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
