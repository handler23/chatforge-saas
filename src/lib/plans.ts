export const PLAN_LIMITS = {
  free: { maxBots: 1, maxMessages: 100 },
  starter: { maxBots: 3, maxMessages: 2000 },
  pro: { maxBots: 10, maxMessages: 10000 },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  if (plan in PLAN_LIMITS) {
    return PLAN_LIMITS[plan as PlanTier];
  }
  return PLAN_LIMITS.free;
}
