export type SortDirection = 'asc' | 'desc';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** A one-based page request. */
export interface PageRequest {
  page: number;
  pageSize: number;
}

/** A page of results with navigation metadata. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Clamp/normalize an untrusted page request into safe bounds. */
export function normalizePageRequest(request?: Partial<PageRequest>): PageRequest {
  const page = Math.max(1, Math.trunc(request?.page ?? 1) || 1);
  const rawSize = Math.trunc(request?.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  return { page, pageSize };
}

/** Offset for a normalized page request (for SQL/Prisma `skip`). */
export function pageOffset(request: PageRequest): number {
  return (request.page - 1) * request.pageSize;
}

/** Assemble a {@link Page} from items and the total count. */
export function buildPage<T>(items: T[], total: number, request: PageRequest): Page<T> {
  const totalPages = request.pageSize > 0 ? Math.ceil(total / request.pageSize) : 0;
  return {
    items,
    total,
    page: request.page,
    pageSize: request.pageSize,
    totalPages,
    hasNext: request.page < totalPages,
    hasPrevious: request.page > 1,
  };
}
