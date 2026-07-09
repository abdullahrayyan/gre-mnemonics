/** Per-question quiz kinds. */
export const QuizQuestionKind = {
  WORD_TO_MEANING: 'WORD_TO_MEANING',
  MEANING_TO_WORD: 'MEANING_TO_WORD',
  SYNONYM: 'SYNONYM',
  ANTONYM: 'ANTONYM',
  SENTENCE_COMPLETION: 'SENTENCE_COMPLETION',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
  ROOT: 'ROOT',
  MNEMONIC_RECALL: 'MNEMONIC_RECALL',
} as const;
export type QuizQuestionKind = (typeof QuizQuestionKind)[keyof typeof QuizQuestionKind];
export const QUIZ_QUESTION_KINDS = Object.values(QuizQuestionKind);

/** Quiz session types (question kinds + TIMED/MIXED presets). */
export const QuizType = {
  WORD_TO_MEANING: 'WORD_TO_MEANING',
  MEANING_TO_WORD: 'MEANING_TO_WORD',
  SYNONYM: 'SYNONYM',
  ANTONYM: 'ANTONYM',
  SENTENCE_COMPLETION: 'SENTENCE_COMPLETION',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
  ROOT: 'ROOT',
  MNEMONIC_RECALL: 'MNEMONIC_RECALL',
  TIMED: 'TIMED',
  MIXED: 'MIXED',
} as const;
export type QuizType = (typeof QuizType)[keyof typeof QuizType];
export const QUIZ_TYPES = Object.values(QuizType);

/** Question kinds a quiz session type draws from. */
export function questionKindsForQuizType(type: QuizType): QuizQuestionKind[] {
  if (type === QuizType.TIMED || type === QuizType.MIXED) {
    return [...QUIZ_QUESTION_KINDS];
  }
  return [type as QuizQuestionKind];
}
