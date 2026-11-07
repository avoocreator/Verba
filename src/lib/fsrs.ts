import type { FSRSCard } from "./db";

const DEFAULT_W = [
  0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
  0.34, 1.26, 0.29, 2.61,
];

export type FSRSRating = 1 | 2 | 3 | 4;

export function createEmptyCard(): FSRSCard {
  return {
    due: new Date().toISOString(),
    stability: 0.5,
    difficulty: 5.0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    last_review: undefined,
  };
}

export function scheduleReview(
  card: FSRSCard,
  rating: FSRSRating,
  now = new Date()
): { card: FSRSCard; intervalDays: number } {
  const lastReview = card.last_review ? new Date(card.last_review) : now;
  const elapsedDays = Math.max(
    0,
    Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24))
  );

  let stability = card.stability;
  let difficulty = card.difficulty;
  let lapses = card.lapses;
  let reps = card.reps + 1;
  let state = card.state;

  if (card.reps === 0) {
    stability = Math.max(0.1, DEFAULT_W[rating - 1]);
    difficulty = Math.min(10, Math.max(1, DEFAULT_W[4] - (rating - 3) * DEFAULT_W[5]));
    state = rating === 1 ? 1 : 2;
  } else {
    const retrievability = Math.pow(1 + elapsedDays / (9 * stability), -1);
    const deltaD = -DEFAULT_W[6] * (rating - 3);
    difficulty = Math.min(
      10,
      Math.max(1, difficulty + deltaD * ((10 - difficulty) / 9))
    );

    if (rating === 1) {
      lapses += 1;
      state = 3;
      stability = Math.max(
        0.1,
        DEFAULT_W[11] *
          Math.pow(difficulty, -DEFAULT_W[12]) *
          (Math.pow(stability + 1, DEFAULT_W[13]) - 1) *
          Math.exp((1 - retrievability) * DEFAULT_W[14])
      );
    } else {
      state = 2;
      const hardPenalty = rating === 2 ? DEFAULT_W[15] : 1;
      const easyBonus = rating === 4 ? DEFAULT_W[16] : 1;

      stability =
        stability *
        (1 +
          Math.exp(DEFAULT_W[8]) *
            (11 - difficulty) *
            Math.pow(stability, -DEFAULT_W[9]) *
            (Math.exp((1 - retrievability) * DEFAULT_W[10]) - 1) *
            hardPenalty *
            easyBonus);
    }
  }

  const intervalDays = Math.max(1, Math.round(stability));
  const nextDue = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  const updatedCard: FSRSCard = {
    due: nextDue.toISOString(),
    stability: Math.round(stability * 100) / 100,
    difficulty: Math.round(difficulty * 100) / 100,
    elapsed_days: elapsedDays,
    scheduled_days: intervalDays,
    reps,
    lapses,
    state,
    last_review: now.toISOString(),
  };

  return { card: updatedCard, intervalDays };
}

export function isQualifiesForGrown(card?: FSRSCard): boolean {
  if (!card) return false;
  return card.stability >= 14 && card.reps >= 3;
}
