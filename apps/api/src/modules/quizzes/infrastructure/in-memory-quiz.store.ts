import { NotFoundError } from '@mnemonic/core';
import type {
  AnswerInput,
  AnswerResult,
  CreateQuizInput,
  QuizStore,
  StartedQuiz,
  WeakWord,
} from '../application/quiz-store.port.js';

interface MemAttempt {
  attemptId: string;
  wordId: string;
  type: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
}

interface MemQuiz {
  quizId: string;
  userId: string;
  type: string;
  totalQuestions: number;
  attempts: MemAttempt[];
  completed: boolean;
}

const XP_PER_CORRECT = 5;
const normalize = (value: string): string => value.trim().toLowerCase();

/** In-memory quiz store for tests. */
export class InMemoryQuizStore implements QuizStore {
  private readonly quizzes = new Map<string, MemQuiz>();
  private readonly xpByUser = new Map<string, number>();
  private seq = 0;

  private nextId(prefix: string): string {
    this.seq += 1;
    return `${prefix}_${this.seq}`;
  }

  async create(input: CreateQuizInput): Promise<StartedQuiz> {
    const quizId = this.nextId('quiz');
    const attempts: MemAttempt[] = input.questions.map((question) => ({
      attemptId: this.nextId('att'),
      wordId: question.wordId,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer: null,
      isCorrect: false,
    }));

    this.quizzes.set(quizId, {
      quizId,
      userId: input.userId,
      type: input.type,
      totalQuestions: input.questions.length,
      attempts,
      completed: false,
    });

    return {
      quizId,
      type: input.type,
      totalQuestions: input.questions.length,
      questions: attempts.map((attempt) => ({
        attemptId: attempt.attemptId,
        type: attempt.type,
        prompt: attempt.prompt,
        options: attempt.options,
      })),
    };
  }

  async answer(input: AnswerInput): Promise<AnswerResult> {
    const quiz = this.quizzes.get(input.quizId);
    if (!quiz || quiz.userId !== input.userId) throw new NotFoundError('Quiz', input.quizId);
    const attempt = quiz.attempts.find((candidate) => candidate.attemptId === input.attemptId);
    if (!attempt) throw new NotFoundError('Quiz attempt', input.attemptId);

    attempt.userAnswer = input.userAnswer;
    attempt.isCorrect = normalize(attempt.correctAnswer) === normalize(input.userAnswer);

    let completed = false;
    let summary: AnswerResult['summary'];
    const answered = quiz.attempts.filter((candidate) => candidate.userAnswer !== null).length;

    if (answered >= quiz.totalQuestions && !quiz.completed) {
      quiz.completed = true;
      const correctCount = quiz.attempts.filter((candidate) => candidate.isCorrect).length;
      const scorePercent = Math.round((correctCount / quiz.totalQuestions) * 100);
      const xp = correctCount * XP_PER_CORRECT;
      this.xpByUser.set(input.userId, (this.xpByUser.get(input.userId) ?? 0) + xp);
      completed = true;
      summary = {
        quizId: quiz.quizId,
        totalQuestions: quiz.totalQuestions,
        correctCount,
        scorePercent,
        xpAwarded: xp,
      };
    }

    return {
      isCorrect: attempt.isCorrect,
      correctAnswer: attempt.correctAnswer,
      completed,
      summary,
    };
  }

  async getWeakWords(userId: string, limit: number): Promise<WeakWord[]> {
    const counts = new Map<string, number>();
    for (const quiz of this.quizzes.values()) {
      if (quiz.userId !== userId) continue;
      for (const attempt of quiz.attempts) {
        if (attempt.userAnswer !== null && !attempt.isCorrect) {
          counts.set(attempt.wordId, (counts.get(attempt.wordId) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([wordId, incorrectCount]) => ({ wordId, word: '', meaning: '', incorrectCount }));
  }

  totalXp(userId: string): number {
    return this.xpByUser.get(userId) ?? 0;
  }
}
