'use client';

import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useAchievements() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['achievements'],
    enabled: isSignedIn ?? false,
    queryFn: async () => {
      const token = await getToken();
      return api.gamification.achievements(token ?? '');
    },
  });
}

export function useLeaderboard() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ['leaderboard'],
    enabled: isSignedIn ?? false,
    queryFn: async () => {
      const token = await getToken();
      return api.gamification.leaderboard(token ?? '');
    },
  });
}
