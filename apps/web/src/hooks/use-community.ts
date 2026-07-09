'use client';

import type { CommunitySort } from '@mnemonic/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api-client';

/** The community mnemonic feed, sorted newest or top-rated. */
export function useCommunityFeed(sort: CommunitySort) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['community', sort],
    queryFn: async () => {
      const token = await getToken();
      return api.community.list({ sort, pageSize: 50 }, token);
    },
  });
}

/** Submit a new community mnemonic. */
export function useSubmitMnemonic() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { wordId: string; content: string }) => {
      const token = await getToken();
      return api.community.submit(body, token ?? '');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community'] }),
  });
}

/** Cast (or clear) a vote on a mnemonic. */
export function useVoteMnemonic() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value }: { id: string; value: number }) => {
      const token = await getToken();
      return api.community.vote(id, value, token ?? '');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community'] }),
  });
}

/** Threaded comments for a mnemonic (enabled only when opened). */
export function useComments(mnemonicId: string | null) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['comments', mnemonicId],
    enabled: mnemonicId !== null,
    queryFn: async () => {
      const token = await getToken();
      return api.community.comments(mnemonicId ?? '', token);
    },
  });
}

/** Add a comment (or reply) to a mnemonic. */
export function useAddComment(mnemonicId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { content: string; parentId?: string | null }) => {
      const token = await getToken();
      return api.community.addComment(mnemonicId, body, token ?? '');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', mnemonicId] });
      void queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}
