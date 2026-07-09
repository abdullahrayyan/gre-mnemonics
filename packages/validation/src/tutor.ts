import { z } from 'zod';

export const TUTOR_ACTIONS = [
  'EXPLAIN',
  'ANOTHER_MNEMONIC',
  'HINDI',
  'GRE_EXAMPLE',
  'ROOT',
  'ETYMOLOGY',
  'ANALOGY',
  'COMPARE',
  'QUIZ',
] as const;

/** Body schema for `POST /api/v1/tutor/chat`. */
export const tutorChatSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().trim().min(1).max(4000),
        }),
      )
      .max(30)
      .default([]),
    word: z.string().trim().max(100).optional(),
    action: z.enum(TUTOR_ACTIONS).optional(),
  })
  .refine((value) => value.messages.length > 0 || Boolean(value.word) || Boolean(value.action), {
    message: 'Provide messages, a word, or an action',
  });
export type TutorChatDto = z.infer<typeof tutorChatSchema>;
