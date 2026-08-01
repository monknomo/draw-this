// src/sizeControl.ts
// Global brush size control — configurable constants and step function.

export const SIZE_MIN = 1
export const SIZE_MAX = 50
export const SIZE_DEFAULT = 5

// Step schedule: each entry means "use this step size while current is below threshold".
// Tiers are checked in order; the last entry acts as the catch-all.
// To retune the feel, edit the threshold/step pairs — no logic changes needed.
const STEP_SCHEDULE: Array<{ threshold: number; step: number }> = [
  { threshold: 10, step: 1 },
  { threshold: 20, step: 2 },
  { threshold: Infinity, step: 5 },
]

/**
 * Return the next brush size given the current size and direction.
 * direction = 1 means "increase", -1 means "decrease".
 * The step size grows with the current value (data-driven table above).
 * Result is clamped to [SIZE_MIN, SIZE_MAX].
 */
export function nextSize(current: number, direction: 1 | -1): number {
  const tier = STEP_SCHEDULE.find(t => current < t.threshold)!
  const step = tier.step
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, current + direction * step))
}
