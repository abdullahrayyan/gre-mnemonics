import {
  generateQuizQuestions,
  questionKindsForQuizType,
  WordStatus,
  type QuizType,
  type Word,
  type WordRepository,
} from '@mnemonic/core';
import { AppError } from '../../../shared/http/http-error.js';
import type {
  AnswerInput,
  AnswerResult,
  QuizStore,
  StartedQuiz,
  WeakWord,
} from './quiz-store.port.js';

const POOL_MULTIPLIER = 3;
const MIN_POOL = 20;

function shuffle(input: Word[]): Word[] {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i]!;
    array[i] = array[j]!;
    array[j] = tmp;
  }
  return array;
}

/** Generate a quiz from a pool of published words and persist it. */
export class StartQuizUseCase {
  constructor(
    private readonly words: WordRepository,
    private readonly store: QuizStore,
  ) {}

  async execute(userId: string, params: { type: QuizType; count?: number }): Promise<StartedQuiz> {
    const count = params.count ?? 10;
    const pageSize = Math.max(MIN_POOL, count * POOL_MULTIPLIER);
    const pool = await this.words.search({ status: WordStatus.PUBLISHED }, { page: 1, pageSize });

    if (pool.items.length < 2) {
      throw AppError.unprocessable('Not enough words to build a quiz. Seed the database first.');
    }

    const questions = generateQuizQuestions(shuffle(pool.items), {
      types: questionKindsForQuizType(params.type),
      count,
    });

    if (questions.length === 0) {
      throw AppError.unprocessable('Could not generate quiz questions from the available words.');
    }

    return this.store.create({ userId, type: params.type, questions });
  }
}

/** Grade a single answer (and complete the quiz when it's the last one). */
export class AnswerQuestionUseCase {
  constructor(private readonly store: QuizStore) {}

  execute(input: AnswerInput): Promise<AnswerResult> {
    return this.store.answer(input);
  }
}

/** Words the learner most often gets wrong in quizzes. */
export class GetWeakWordsUseCase {
  constructor(private readonly store: QuizStore) {}

  execute(userId: string, limit = 10): Promise<WeakWord[]> {
    return this.store.getWeakWords(userId, Math.min(Math.max(limit, 1), 50));
  }
}
