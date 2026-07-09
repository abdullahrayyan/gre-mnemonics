import type {
  AchievementDto,
  AnswerResultDto,
  ApiError,
  ApiSuccess,
  CommentDto,
  CommunityListParams,
  CommunityMnemonicDto,
  DashboardDto,
  LeaderboardEntryDto,
  MeDto,
  PaginatedResponse,
  ProfileDto,
  ReviewCardDto,
  ReviewOutcomeDto,
  ReviewRatingValue,
  StartedQuizDto,
  QuizTypeValue,
  VoteResultDto,
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
  gamification: {
    achievements: (token: string) =>
      request<ApiSuccess<AchievementDto[]>>('/api/v1/gamification/achievements', { token }),
    leaderboard: (token: string) =>
      request<ApiSuccess<LeaderboardEntryDto[]>>('/api/v1/gamification/leaderboard', { token }),
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
  community: {
    list: (params?: CommunityListParams, token?: string | null) =>
      request<PaginatedResponse<CommunityMnemonicDto>>('/api/v1/community/mnemonics', {
        searchParams: params,
        token,
      }),
    submit: (body: { wordId: string; content: string; type?: string }, token: string) =>
      request<ApiSuccess<CommunityMnemonicDto>>('/api/v1/community/mnemonics', {
        method: 'POST',
        body,
        token,
      }),
    vote: (id: string, value: number, token: string) =>
      request<ApiSuccess<VoteResultDto>>(`/api/v1/community/mnemonics/${id}/vote`, {
        method: 'POST',
        body: { value },
        token,
      }),
    comments: (id: string, token?: string | null) =>
      request<ApiSuccess<CommentDto[]>>(`/api/v1/community/mnemonics/${id}/comments`, { token }),
    addComment: (id: string, body: { content: string; parentId?: string | null }, token: string) =>
      request<ApiSuccess<CommentDto>>(`/api/v1/community/mnemonics/${id}/comments`, {
        method: 'POST',
        body,
        token,
      }),
    report: (
      body: { targetType: string; targetId: string; reason: string; details?: string | null },
      token: string,
    ) => request<ApiSuccess<{ id: string }>>('/api/v1/community/reports', { method: 'POST', body, token }),
  },
  quizzes: {
    start: (body: { type: QuizTypeValue; count?: number }, token: string) =>
      request<ApiSuccess<StartedQuizDto>>('/api/v1/quizzes', { method: 'POST', body, token }),
    answer: (
      quizId: string,
      body: { attemptId: string; userAnswer: string; responseTimeMs?: number },
      token: string,
    ) =>
      request<ApiSuccess<AnswerResultDto>>(`/api/v1/quizzes/${quizId}/answers`, {
        method: 'POST',
        body,
        token,
      }),
  },
};
