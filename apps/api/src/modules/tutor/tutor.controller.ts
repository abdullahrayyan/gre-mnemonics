import type { TutorAction, TutorEngine } from '@mnemonic/ai';
import { tutorChatSchema } from '@mnemonic/validation';
import type { Request, Response } from 'express';
import { AppError } from '../../shared/http/http-error.js';
import { logger } from '../../shared/logger.js';
import type { AiHistoryRecorder } from '../words/application/ai-history.port.js';

/** Streams the AI tutor's reply over Server-Sent Events. */
export class TutorController {
  constructor(
    private readonly engine: TutorEngine | null,
    private readonly history: AiHistoryRecorder,
  ) {}

  chat = async (req: Request, res: Response): Promise<void> => {
    const engine = this.engine;
    if (!engine) {
      throw new AppError('AI tutor is not configured', { statusCode: 503, code: 'AI_UNAVAILABLE' });
    }
    const body = tutorChatSchema.parse(req.body);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let full = '';
    try {
      for await (const token of engine.stream({
        messages: body.messages,
        word: body.word,
        action: body.action as TutorAction | undefined,
      })) {
        full += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (error) {
      logger.error({ err: error }, 'Tutor stream failed');
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Tutor stream failed' })}\n\n`);
    } finally {
      res.end();
      void this.history
        .record({
          userId: req.auth?.userId ?? null,
          type: 'TUTOR_CHAT',
          model: engine.model,
          prompt: body.word ?? body.action ?? 'chat',
          response: { content: full },
          status: 'SUCCESS',
        })
        .catch(() => undefined);
    }
  };
}
