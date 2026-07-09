import { randomUUID } from 'node:crypto';
import { NotFoundError } from '@mnemonic/core';
import { type Prisma, type PrismaClient } from '@mnemonic/database';
import type {
  AnswerInput,
  AnswerResult,
  CreateQuizInput,
  QuizStore,
  StartedQuiz,
  WeakWord,
} from '../application/quiz-store.port.js';

const XP_PER_CORRECT = 5;

const normalize = (value: string): string => value.trim().toLowerCase();

export class PrismaQuizStore implements QuizStore {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateQuizInput): Promise<StartedQuiz> {
    const quizId = randomUUID();
    const attempts = input.questions.map((question) => ({ id: randomUUID(), question }));

    await this.prisma.$transaction([
      this.prisma.quiz.create({
        data: {
          id: quizId,
          userId: input.userId,
          type: input.type as Prisma.QuizUncheckedCreateInput['type'],
          totalQuestions: input.questions.length,
          status: 'IN_PROGRESS',
        },
      }),
      this.prisma.quizAttempt.createMany({
        data: attempts.map((attempt) => ({
          id: attempt.id,
          quizId,
          wordId: attempt.question.wordId,
          prompt: attempt.question.prompt,
          options: attempt.question.options as Prisma.InputJsonValue,
          correctAnswer: attempt.question.correctAnswer,
          isCorrect: false,
        })),
      }),
    ]);

    return {
      quizId,
      type: input.type,
      totalQuestions: input.questions.length,
      questions: attempts.map((attempt) => ({
        attemptId: attempt.id,
        type: attempt.question.type,
        prompt: attempt.question.prompt,
        options: attempt.question.options,
      })),
    };
  }

  async answer(input: AnswerInput): Promise<AnswerResult> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: input.attemptId },
      include: { quiz: true },
    });
    if (!attempt || attempt.quizId !== input.quizId || attempt.quiz.userId !== input.userId) {
      throw new NotFoundError('Quiz attempt', input.attemptId);
    }

    const isCorrect = normalize(input.userAnswer) === normalize(attempt.correctAnswer);
    const now = new Date();

    await this.prisma.quizAttempt.update({
      where: { id: input.attemptId },
      data: {
        userAnswer: input.userAnswer,
        isCorrect,
        responseTimeMs: input.responseTimeMs,
        answeredAt: now,
      },
    });

    const answered = await this.prisma.quizAttempt.count({
      where: { quizId: input.quizId, userAnswer: { not: null } },
    });

    let completed = false;
    let summary: AnswerResult['summary'];

    if (answered >= attempt.quiz.totalQuestions && attempt.quiz.status !== 'COMPLETED') {
      const correctCount = await this.prisma.quizAttempt.count({
        where: { quizId: input.quizId, isCorrect: true },
      });
      const total = attempt.quiz.totalQuestions;
      const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - attempt.quiz.startedAt.getTime()) / 1000),
      );
      const xp = correctCount * XP_PER_CORRECT;

      await this.prisma.$transaction([
        this.prisma.quiz.update({
          where: { id: input.quizId },
          data: {
            status: 'COMPLETED',
            correctCount,
            scorePercent,
            completedAt: now,
            durationSeconds,
          },
        }),
        this.prisma.xpEvent.create({
          data: {
            userId: input.userId,
            amount: xp,
            reason: 'QUIZ_COMPLETED' as Prisma.XpEventUncheckedCreateInput['reason'],
            refType: 'quiz',
            refId: input.quizId,
          },
        }),
        this.prisma.gamificationProfile.updateMany({
          where: { userId: input.userId },
          data: { totalXp: { increment: xp } },
        }),
      ]);

      completed = true;
      summary = {
        quizId: input.quizId,
        totalQuestions: total,
        correctCount,
        scorePercent,
        xpAwarded: xp,
      };
    }

    return { isCorrect, correctAnswer: attempt.correctAnswer, completed, summary };
  }

  async getWeakWords(userId: string, limit: number): Promise<WeakWord[]> {
    const grouped = await this.prisma.quizAttempt.groupBy({
      by: ['wordId'],
      where: { isCorrect: false, userAnswer: { not: null }, quiz: { userId } },
      _count: { wordId: true },
      orderBy: { _count: { wordId: 'desc' } },
      take: limit,
    });
    if (grouped.length === 0) return [];

    const words = await this.prisma.word.findMany({
      where: { id: { in: grouped.map((group) => group.wordId) } },
      select: { id: true, word: true, meaning: true },
    });
    const byId = new Map(words.map((word) => [word.id, word]));

    return grouped
      .map((group) => {
        const word = byId.get(group.wordId);
        return {
          wordId: group.wordId,
          word: word?.word ?? '',
          meaning: word?.meaning ?? '',
          incorrectCount: group._count.wordId,
        };
      })
      .filter((entry) => entry.word.length > 0);
  }
}
