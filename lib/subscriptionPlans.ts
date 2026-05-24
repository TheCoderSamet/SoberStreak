export type SubscriptionPlanId = 'monthly' | 'six_month' | 'yearly';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  title: string;
  priceUsd: number;
  periodLabel: string;
  billingNote: string;
  /** Shown under price, e.g. equivalent monthly cost */
  subtitle?: string;
  badge?: string;
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    title: 'Monthly',
    priceUsd: 6.99,
    periodLabel: formatUsd(6.99),
    billingNote: 'Billed every month',
  },
  {
    id: 'six_month',
    title: '6 months',
    priceUsd: 35.99,
    periodLabel: formatUsd(35.99),
    billingNote: 'Billed every 6 months',
    subtitle: `${formatUsd(35.99 / 6)}/mo`,
    badge: 'Popular',
  },
  {
    id: 'yearly',
    title: 'Yearly',
    priceUsd: 130.99,
    periodLabel: formatUsd(130.99),
    billingNote: 'Billed once per year',
    subtitle: `${formatUsd(130.99 / 12)}/mo`,
  },
];

export const DEFAULT_PLAN_ID: SubscriptionPlanId = 'six_month';

export function getSubscriptionPlan(id: SubscriptionPlanId): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
  if (!plan) {
    return SUBSCRIPTION_PLANS[0];
  }
  return plan;
}
