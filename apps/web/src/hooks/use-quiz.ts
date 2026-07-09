'use client';

import { useAuth } from '@clerk/nextjs';
import type { QuizTypeValue } from '@mnemonic/types';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useStartQuiz() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (input: { type: QuizTypeValue; count?: number }) => {
      const token = await getToken();
      return api.quizzes.start(input, token ?? '');
    },
  });
}

export function useAnswerQuestion() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      quizId: string;
      attemptId: string;
      userAnswer: string;
      responseTimeMs?: number;
    }) => {
      const token = await getToken();
      const { quizId, ...body } = input;
      return api.quizzes.answer(quizId, body, token ?? '');
    },
  });
}
