// src/test/size-control.test.ts
import { describe, it, expect } from 'vitest'
import { nextSize, rainbowStripeWidth, SIZE_MIN, SIZE_MAX, SIZE_DEFAULT } from '../sizeControl'

describe('nextSize', () => {
  it('walks the ladder 1, 5, 10, 20, 30, 50 going up', () => {
    const seen = [SIZE_MIN]
    for (let i = 0; i < 5; i++) seen.push(nextSize(seen[seen.length - 1], 1))
    expect(seen).toEqual([1, 5, 10, 20, 30, 50])
  })

  it('walks the same ladder back down', () => {
    const seen = [SIZE_MAX]
    for (let i = 0; i < 5; i++) seen.push(nextSize(seen[seen.length - 1], -1))
    expect(seen).toEqual([50, 30, 20, 10, 5, 1])
  })

  it('up then down returns to the same size', () => {
    for (const rung of [1, 5, 10, 20, 30]) {
      expect(nextSize(nextSize(rung, 1), -1)).toBe(rung)
    }
  })

  it('snaps an off-ladder size to the nearest rung in the direction of travel', () => {
    expect(nextSize(7, 1)).toBe(10)
    expect(nextSize(7, -1)).toBe(5)
    expect(nextSize(45, 1)).toBe(SIZE_MAX)
    expect(nextSize(2, -1)).toBe(SIZE_MIN)
  })

  it('has about half as many stops as before (5 steps across the range)', () => {
    let size = SIZE_MIN
    let steps = 0
    while (nextSize(size, 1) !== size) { size = nextSize(size, 1); steps++ }
    expect(size).toBe(SIZE_MAX)
    expect(steps).toBe(5)
  })

  it('SIZE_DEFAULT is on the ladder', () => {
    expect(nextSize(nextSize(SIZE_DEFAULT, 1), -1)).toBe(SIZE_DEFAULT)
  })

  describe('clamping', () => {
    it('does not exceed SIZE_MAX when increasing at the ceiling', () => {
      expect(nextSize(SIZE_MAX, 1)).toBe(SIZE_MAX)
      expect(nextSize(SIZE_MAX - 1, 1)).toBe(SIZE_MAX)
      expect(nextSize(45, 1)).toBe(SIZE_MAX)
    })

    it('does not go below SIZE_MIN when decreasing at the floor', () => {
      expect(nextSize(SIZE_MIN, -1)).toBe(SIZE_MIN)
      expect(nextSize(SIZE_MIN + 1, -1)).toBe(SIZE_MIN)
    })
  })

  describe('SIZE_DEFAULT', () => {
    it('SIZE_DEFAULT is within [SIZE_MIN, SIZE_MAX]', () => {
      expect(SIZE_DEFAULT).toBeGreaterThanOrEqual(SIZE_MIN)
      expect(SIZE_DEFAULT).toBeLessThanOrEqual(SIZE_MAX)
    })
  })
})

describe('rainbowStripeWidth', () => {
  it('is 1px at the default size, preserving the original thin rainbow', () => {
    expect(rainbowStripeWidth(SIZE_DEFAULT)).toBe(1)
  })

  it('never drops below 1px at small sizes', () => {
    expect(rainbowStripeWidth(SIZE_MIN)).toBe(1)
  })

  it('grows proportionally with size', () => {
    expect(rainbowStripeWidth(SIZE_MAX)).toBe(SIZE_MAX / SIZE_DEFAULT)
  })
})
