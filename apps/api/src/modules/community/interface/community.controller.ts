import {
  addCommentSchema,
  communityListQuerySchema,
  reportSchema,
  submitMnemonicSchema,
  voteSchema,
} from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type {
  AddCommentUseCase,
  ListCommentsUseCase,
  ListCommunityMnemonicsUseCase,
  ReportContentUseCase,
  SubmitMnemonicUseCase,
  VoteMnemonicUseCase,
} from '../application/community.usecases.js';

export class CommunityController {
  constructor(
    private readonly listMnemonics: ListCommunityMnemonicsUseCase,
    private readonly submitMnemonic: SubmitMnemonicUseCase,
    private readonly voteMnemonic: VoteMnemonicUseCase,
    private readonly listComments: ListCommentsUseCase,
    private readonly addComment: AddCommentUseCase,
    private readonly reportContent: ReportContentUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const query = communityListQuerySchema.parse(req.query);
    const page = await this.listMnemonics.execute(
      { wordId: query.wordId, sort: query.sort, viewerId: req.auth?.userId },
      { page: query.page, pageSize: query.pageSize },
    );
    res.status(200).json({
      data: page.items,
      pagination: {
        page: page.page,
        pageSize: page.pageSize,
        total: page.total,
        totalPages: page.totalPages,
        hasNext: page.hasNext,
        hasPrevious: page.hasPrevious,
      },
    });
  };

  submit = async (req: Request, res: Response): Promise<void> => {
    const body = submitMnemonicSchema.parse(req.body);
    const created = await this.submitMnemonic.execute({
      wordId: body.wordId,
      authorId: req.auth!.userId,
      content: body.content,
      type: body.type,
    });
    res.status(201).json({ data: created });
  };

  vote = async (req: Request, res: Response): Promise<void> => {
    const body = voteSchema.parse(req.body);
    const result = await this.voteMnemonic.execute(req.auth!.userId, req.params.id ?? '', body.value);
    res.status(200).json({ data: result });
  };

  comments = async (req: Request, res: Response): Promise<void> => {
    const comments = await this.listComments.execute(req.params.id ?? '');
    res.status(200).json({ data: comments });
  };

  addCommentHandler = async (req: Request, res: Response): Promise<void> => {
    const body = addCommentSchema.parse(req.body);
    const created = await this.addComment.execute({
      mnemonicId: req.params.id ?? '',
      authorId: req.auth!.userId,
      content: body.content,
      parentId: body.parentId,
    });
    res.status(201).json({ data: created });
  };

  report = async (req: Request, res: Response): Promise<void> => {
    const body = reportSchema.parse(req.body);
    const result = await this.reportContent.execute({
      reporterId: req.auth!.userId,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details,
    });
    res.status(201).json({ data: result });
  };
}
