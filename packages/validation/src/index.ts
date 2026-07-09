/**
 * @mnemonic/validation — Zod schemas shared between the API and the web client,
 * so both validate identically. Depends only on the domain for enum sources.
 */
export {
  createWordSchema,
  updateWordSchema,
  wordSearchQuerySchema,
  wordIdParamSchema,
  wordSlugParamSchema,
} from './words.js';
export type { CreateWordDto, UpdateWordDto, WordSearchQueryDto } from './words.js';
export { updateProfileSchema } from './users.js';
export type { UpdateProfileDto } from './users.js';
export { submitReviewSchema, reviewQueueQuerySchema } from './reviews.js';
export type { SubmitReviewDto, ReviewQueueQueryDto } from './reviews.js';
export { trackEventSchema } from './analytics.js';
export type { TrackEventDto } from './analytics.js';
export { startQuizSchema, answerQuestionSchema } from './quizzes.js';
export type { StartQuizDto, AnswerQuestionDto } from './quizzes.js';
export { tutorChatSchema, TUTOR_ACTIONS } from './tutor.js';
export type { TutorChatDto } from './tutor.js';
export {
  submitMnemonicSchema,
  voteSchema,
  addCommentSchema,
  reportSchema,
  communityListQuerySchema,
} from './community.js';
export type {
  SubmitMnemonicDto,
  VoteDto,
  AddCommentDto,
  ReportDto,
  CommunityListQueryDto,
} from './community.js';
export {
  moderateMnemonicSchema,
  resolveReportSchema,
  adminGenerateWordSchema,
} from './admin.js';
export type {
  ModerateMnemonicDto,
  ResolveReportDto,
  AdminGenerateWordDto,
} from './admin.js';
