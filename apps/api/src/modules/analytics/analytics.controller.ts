import { trackEventSchema } from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type { AnalyticsRecorder } from './analytics-recorder.port.js';

export class AnalyticsController {
  constructor(private readonly recorder: AnalyticsRecorder) {}

  track = async (req: Request, res: Response): Promise<void> => {
    const body = trackEventSchema.parse(req.body);
    await this.recorder.record({
      name: body.name,
      sessionId: body.sessionId,
      properties: body.properties,
      userId: req.auth?.userId ?? null,
    });
    res.status(202).json({ data: { accepted: true } });
  };
}
