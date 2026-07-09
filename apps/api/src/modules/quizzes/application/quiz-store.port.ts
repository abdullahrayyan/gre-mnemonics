import type { GeneratedQuizQuestion } from '@mnemonic/core';

/** A question as sent to the client — no correct answer. */
export interface QuizClientQuestion {
  attemptId: string;
  type: string;
  prompt: string;
  options: string[];
}

export interface StartedQuiz {
  quizId: string;
  type: string;
  totalQuestions: number;
  questions: QuizClientQuestion[];
}

export interface QuizSummary {
  quizId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  xpAwarded: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  completed: boolean;
  summary?: QuizSummary;
}

export interface WeakWord {
  wordId: string;
  word: string;
  meaning: string;
  incorrectCount: number;
}

export interface CreateQuizInput {
  userId: string;
  type: string;
  questions: GeneratedQuizQuestion[];
}

export interface AnswerInput {
  userId: string;
  quizId: string;
  attemptId: string;
  userAnswer: string;
  responseTimeMs?: number;
}

/** Persistence + grading for quizzes. */
export interface QuizStore {
  create(input: CreateQuizInput): Promise<StartedQuiz>;
  answer(input: AnswerInput): Promise<AnswerResult>;
  getWeakWords(userId: string, limit: number): Promise<WeakWord[]>;
}
