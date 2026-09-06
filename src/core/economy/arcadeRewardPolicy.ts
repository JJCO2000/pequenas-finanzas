export const ARCADE_REWARD_MULTIPLIERS = [1, 0.5, 0.25, 0] as const;

export function getArcadeRewardMultiplier(previousRewardedRunsToday: number) {
  const index = Math.max(0, Math.trunc(previousRewardedRunsToday));
  return ARCADE_REWARD_MULTIPLIERS[Math.min(index, ARCADE_REWARD_MULTIPLIERS.length - 1)] ?? 0;
}

export function applyArcadeRewardPolicy(baseRewardCents: number, previousRewardedRunsToday: number) {
  const multiplier = getArcadeRewardMultiplier(previousRewardedRunsToday);
  return {
    multiplier,
    rewardCents: Math.round(Math.max(0, baseRewardCents) * multiplier),
  };
}
