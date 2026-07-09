import {
  adminGenerateWordSchema,
  moderateMnemonicSchema,
  resolveReportSchema,
} from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type {
  AdminGenerateWordUseCase,
  GetAdminOverviewUseCase,
  ListModerationMnemonicsUseCase,
  ListReportsUseCase,
  ModerateMnemonicUseCase,
  ResolveReportUseCase,
} from '../application/admin.usecases.js';

export class AdminController {
  constructor(
    private readonly overviewUseCase: GetAdminOverviewUseCase,
    private readonly listMnemonicsUseCase: ListModerationMnemonicsUseCase,
    private readonly moderateUseCase: ModerateMnemonicUseCase,
    private readonly listReportsUseCase: ListReportsUseCase,
    private readonly resolveUseCase: ResolveReportUseCase,
    private readonly generateWordUseCase: AdminGenerateWordUseCase,
  ) {}

  overview = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.overviewUseCase.execute() });
  };

  mnemonics = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.listMnemonicsUseCase.execute() });
  };

  moderate = async (req: Request, res: Response): Promise<void> => {
    const { status } = moderateMnemonicSchema.parse(req.body);
    await this.moderateUseCase.execute(req.params.id ?? '', status);
    res.status(200).json({ data: { id: req.params.id, status } });
  };

  reports = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.listReportsUseCase.execute() });
  };

  resolve = async (req: Request, res: Response): Promise<void> => {
    const { status } = resolveReportSchema.parse(req.body);
    await this.resolveUseCase.execute(req.params.id ?? '', status, req.auth!.userId);
    res.status(200).json({ data: { id: req.params.id, status } });
  };

  generateWord = async (req: Request, res: Response): Promise<void> => {
    const { word } = adminGenerateWordSchema.parse(req.body);
    const created = await this.generateWordUseCase.execute(word);
    res.status(201).json({ data: created });
  };
}
