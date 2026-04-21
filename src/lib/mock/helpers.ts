// Mock-store helper utilities. Used internally by the mocked ApiClient
// to simulate latency and produce ApiError-compatible failures.
//
// NOTE: ApiError is intentionally re-declared here (instead of imported from
// '@/lib/api') to break the seed -> helpers -> api -> seed circular import,
// which would otherwise cause "Cannot access X before initialization"
// errors under Node/CJS bundling. The ApiError class shape is identical.

export class MockApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public type:
      | 'unauthorized'
      | 'forbidden'
      | 'not_found'
      | 'validation'
      | 'server'
      | 'network'
      | 'unknown' = 'unknown',
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const delay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const uid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (very unlikely needed)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function notFound(label: string): never {
  throw new MockApiError(404, `${label} not found`, 'not_found');
}

export function unauthorized(message = 'Unauthorized'): never {
  throw new MockApiError(401, message, 'unauthorized');
}

export function paginate<T>(items: T[], page = 1, limit = 50) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return {
    data: slice,
    total,
    page,
    limit,
    totalPages,
  };
}

// Strip undefined values from objects before merging (mimics PATCH behavior).
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

// Build a date relative to now (negative = past).
export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function daysFromNow(n: number): Date {
  return daysAgo(-n);
}
