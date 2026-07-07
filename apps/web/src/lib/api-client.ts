import type {
  ApiError,
  ApiSuccess,
  DashboardDto,
  MeDto,
  PaginatedResponse,
  ProfileDto,
  ReviewCardDto,
  ReviewOutcomeDto,
  ReviewRatingValue,
  WordDto,
  WordSearchParams,
} from '@mnemonic/types';

type ProfileUpdate = Partial<
  Pick<
    ProfileDto,
    'displayName' | 'nativeLanguage' | 'targetExam' | 'dailyWordGoal' | 'timezone' | 'bio'
  >
>;

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string | null;
  body?: unknown;
  searchParams?: object;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    throw new ApiClientError(
      response.status,
      payload?.error.code ?? 'ERROR',
      payload?.error.message ?? response.statusText,
    );
  }

  return (await response.json()) as T;
}

/** Typed client for the Mnemonic Master API. */
export const api = {
  words: {
    list: (params?: WordSearchParams, token?: string | null) =>
      request<PaginatedResponse<WordDto>>('/api/v1/words', { searchParams: params, token }),
    getBySlug: (slug: string, token?: string | null) =>
      request<ApiSuccess<WordDto>>(`/api/v1/words/slug/${slug}`, { token }),
  },
  me: {
    get: (token: string) => request<ApiSuccess<MeDto>>('/api/v1/me', { token }),
    updateProfile: (body: ProfileUpdate, token: string) =>
      request<ApiSuccess<ProfileDto>>('/api/v1/me/profile', { method: 'PATCH', body, token }),
  },
  stats: {
    dashboard: (token: string) =>
      request<ApiSuccess<DashboardDto>>('/api/v1/stats/dashboard', { token }),
  },
  analytics: {
    track: (body: { name: string; properties?: Record<string, unknown> }) =>
      request<ApiSuccess<{ accepted: boolean }>>('/api/v1/analytics', { method: 'POST', body }),
  },
  reviews: {
    queue: (token: string, limit?: number) =>
      request<ApiSuccess<ReviewCardDto[]>>('/api/v1/reviews/queue', {
        token,
        searchParams: limit ? { limit } : undefined,
      }),
    submit: (body: { wordId: string; rating: ReviewRatingValue }, token: string) =>
      request<ApiSuccess<ReviewOutcomeDto>>('/api/v1/reviews', { method: 'POST', body, token }),
  },
};
