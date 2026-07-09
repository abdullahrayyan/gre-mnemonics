'use client';

import type { PlanInfo } from '@mnemonic/types';
import { Badge, Button, Card, CardTitle, Skeleton, cn } from '@mnemonic/ui';
import { Check } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@/lib/auth';
import { useCheckout, usePlans, useSubscription } from '@/hooks/use-billing';

const ORDER: Record<string, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };

function price(cents: number): string {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}/mo`;
}

function PlanCard({ plan, currentPlan }: { plan: PlanInfo; currentPlan: string }) {
  const checkout = useCheckout();
  const isCurrent = plan.plan === currentPlan;
  const isUpgrade = (ORDER[plan.plan] ?? 0) > (ORDER[currentPlan] ?? 0);
  const highlight = plan.plan === 'PRO';

  return (
    <Card className={cn('flex flex-col gap-4', highlight && 'ring-2 ring-indigo-400')}>
      <div>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          {highlight ? <Badge tone="info">Popular</Badge> : null}
        </div>
        <p className="mt-1 text-2xl font-bold text-gradient">{price(plan.priceCents)}</p>
      </div>
      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <SignedIn>
          {isCurrent ? (
            <Button variant="outline" disabled className="w-full">
              Current plan
            </Button>
          ) : (
            <Button
              variant={isUpgrade ? 'primary' : 'outline'}
              disabled={checkout.isPending}
              onClick={() => checkout.mutate(plan.plan)}
              className="w-full"
            >
              {checkout.isPending ? '…' : isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
            </Button>
          )}
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant={highlight ? 'primary' : 'outline'} className="w-full">
              Get started
            </Button>
          </SignInButton>
        </SignedOut>
      </div>
    </Card>
  );
}

function Plans() {
  const plans = usePlans();
  const subscription = useSubscription();
  const currentPlan = subscription.data?.data.plan ?? 'FREE';

  if (plans.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Current plan: <span className="font-semibold">{currentPlan}</span>
          {' · '}
          <span className="text-slate-400">
            (demo mode upgrades instantly — no real charge; add Stripe keys for live checkout)
          </span>
        </p>
      </SignedIn>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.data?.data
          .slice()
          .sort((a, b) => (ORDER[a.plan] ?? 0) - (ORDER[b.plan] ?? 0))
          .map((plan) => (
            <PlanCard key={plan.plan} plan={plan} currentPlan={currentPlan} />
          ))}
      </div>
    </>
  );
}

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Upgrade for unlimited AI tutoring and premium tools.
        </p>
      </div>
      <Plans />
    </div>
  );
}
