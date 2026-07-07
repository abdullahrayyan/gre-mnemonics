'use client';

import { useAuth } from '@clerk/nextjs';
import type { ReviewRatingValue } from '@mnemonic/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

/** Fetch the authenticated learner's review queue (due + new cards). */
export function useReviewQueue() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['review-queue'],
    enabled: isSignedIn ?? false,
    staleTime: 0,
    queryFn: async () => {
      const token = await getToken();
      return api.reviews.queue(token ?? '');
    },
  });
}

/** Submit a review rating and invalidate the queue. */
export function useSubmitReview() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { wordId: string; rating: ReviewRatingValue }) => {
      const token = await getToken();
      return api.reviews.submit(input, token ?? '');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['review-queue'] });
    },
  });
}
