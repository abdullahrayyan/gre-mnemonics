import { checkoutSchema } from '@mnemonic/validation';
import type { Request, Response } from 'express';
import type {
  GetSubscriptionUseCase,
  ListPlansUseCase,
  StartCheckoutUseCase,
} from '../application/billing.usecases.js';

export class BillingController {
  constructor(
    private readonly getSubscription: GetSubscriptionUseCase,
    private readonly listPlans: ListPlansUseCase,
    private readonly startCheckout: StartCheckoutUseCase,
  ) {}

  plans = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: this.listPlans.execute() });
  };

  subscription = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ data: await this.getSubscription.execute(req.auth!.userId) });
  };

  checkout = async (req: Request, res: Response): Promise<void> => {
    const { plan } = checkoutSchema.parse(req.body);
    const result = await this.startCheckout.execute(req.auth!.userId, plan);
    res.status(200).json({ data: result });
  };
}
