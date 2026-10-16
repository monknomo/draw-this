// src/sizeControl.ts
// Global brush size control — configurable constants and step function.

export const SIZE_MIN = 1
export const SIZE_MAX = 50
export const SIZE_DEFAULT = 5

// Size ladder: +/- moves one rung at a time, so the gaps grow with the size and
// going up then down returns to the same size. First and last rungs are SIZE_MIN/SIZE_MAX.
// To retune the feel, edit the rungs — no logic changes needed.
const SIZE_STEPS = [1, 5, 10, 20, 30, 50]

/**
 * Return the next brush size given the current size and direction.
 * direction = 1 means "increase", -1 means "decrease".
 * Moves to the nearest rung above/below `current`, so an off-ladder value still lands
 * on a rung. Result is clamped to [SIZE_MIN, SIZE_MAX].
 */
export function nextSize(current: number, direction: 1 | -1): number {
  const next =
    direction === 1
      ? SIZE_STEPS.find(s => s > current) ?? SIZE_MAX
      : [...SIZE_STEPS].reverse().find(s => s < current) ?? SIZE_MIN
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, next))
}

/**
 * Rainbow pencil draws seven stripes side by side, so using brushSize directly would make
 * the band 7x brushSize wide (35px at default). Instead each stripe is 1px at the default
 * size and grows proportionally with it (band 7px at default, 70px at max).
 */
export function rainbowStripeWidth(size: number): number {
  return Math.max(1, size / SIZE_DEFAULT)
}
