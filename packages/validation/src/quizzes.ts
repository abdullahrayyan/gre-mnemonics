import { QuizType } from '@mnemonic/core';
import { z } from 'zod';

/** Body schema for starting a quiz (`POST /api/v1/quizzes`). */
export const startQuizSchema = z.object({
  type: z.nativeEnum(QuizType),
  count: z.coerce.number().int().min(1).max(50).optional(),
});
export type StartQuizDto = z.infer<typeof startQuizSchema>;

/** Body schema for answering a quiz question. */
export const answerQuestionSchema = z.object({
  attemptId: z.string().trim().min(1),
  userAnswer: z.string().trim().min(1).max(500),
  responseTimeMs: z.number().int().nonnegative().max(600_000).optional(),
});
export type AnswerQuestionDto = z.infer<typeof answerQuestionSchema>;
