import { updateProfileSchema } from '@mnemonic/validation';
import type { Request, Response } from 'express';
import { toMeResponse } from '../application/user.dto.js';
import type { GetMeUseCase, UpdateProfileUseCase } from '../application/user.usecases.js';

/** Controller for the authenticated user's own account (`/me`). */
export class UsersController {
  constructor(
    private readonly getMe: GetMeUseCase,
    private readonly updateProfile: UpdateProfileUseCase,
  ) {}

  me = async (req: Request, res: Response): Promise<void> => {
    const { user, profile } = await this.getMe.execute(req.auth!.userId);
    res.status(200).json({ data: toMeResponse(user, profile) });
  };

  patchProfile = async (req: Request, res: Response): Promise<void> => {
    const data = updateProfileSchema.parse(req.body);
    const profile = await this.updateProfile.execute(req.auth!.userId, data);
    res.status(200).json({ data: profile });
  };
}
