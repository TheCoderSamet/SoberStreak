const MOTIVATIONS = [
  'Stay with this minute.',
  'You do not need to solve the whole week today.',
  'A small choice still counts.',
  'Your progress still matters.',
  'One moment at a time.',
  'Take a breath. This feeling will pass.',
  'You are building a better routine.',
] as const;

export function getDailyMotivation(): string {
  const index = Math.floor(Math.random() * MOTIVATIONS.length);
  return MOTIVATIONS[index];
}
