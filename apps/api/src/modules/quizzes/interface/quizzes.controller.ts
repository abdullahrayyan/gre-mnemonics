import type { QuizType } from '@mnemonic/core';
import { answerQuestionSchema, startQuizSchema } from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type {
  AnswerQuestionUseCase,
  GetWeakWordsUseCase,
  StartQuizUseCase,
} from '../application/quiz.usecases.js';

export class QuizzesController {
  constructor(
    private readonly startQuiz: StartQuizUseCase,
    private readonly answerQuestion: AnswerQuestionUseCase,
    private readonly weakWords: GetWeakWordsUseCase,
  ) {}

  start = async (req: Request, res: Response): Promise<void> => {
    const body = startQuizSchema.parse(req.body);
    const quiz = await this.startQuiz.execute(req.auth!.userId, {
      type: body.type as QuizType,
      count: body.count,
    });
    res.status(201).json({ data: quiz });
  };

  answer = async (req: Request, res: Response): Promise<void> => {
    const body = answerQuestionSchema.parse(req.body);
    const result = await this.answerQuestion.execute({
      userId: req.auth!.userId,
      quizId: req.params.id ?? '',
      attemptId: body.attemptId,
      userAnswer: body.userAnswer,
      responseTimeMs: body.responseTimeMs,
    });
    res.status(200).json({ data: result });
  };

  weak = async (req: Request, res: Response): Promise<void> => {
    const words = await this.weakWords.execute(req.auth!.userId);
    res.status(200).json({ data: words });
  };
}
