// src/test/size-control.test.ts
import { describe, it, expect } from 'vitest'
import { nextSize, rainbowStripeWidth, SIZE_MIN, SIZE_MAX, SIZE_DEFAULT } from '../sizeControl'

describe('nextSize', () => {
  describe('increasing direction', () => {
    it('steps by 2 when current is below 10', () => {
      expect(nextSize(5, 1)).toBe(7)
      expect(nextSize(1, 1)).toBe(3)
      expect(nextSize(9, 1)).toBe(11)
    })

    it('steps by 5 when current is in the 10–29 range', () => {
      expect(nextSize(10, 1)).toBe(15)
      expect(nextSize(16, 1)).toBe(21)
      expect(nextSize(29, 1)).toBe(34)
    })

    it('steps by 10 when current is 30 or above', () => {
      expect(nextSize(30, 1)).toBe(40)
      expect(nextSize(40, 1)).toBe(50)
    })

    it('five clicks from the default is a noticeable jump', () => {
      let size = SIZE_DEFAULT
      for (let i = 0; i < 5; i++) size = nextSize(size, 1)
      expect(size).toBe(21)
    })
  })

  describe('decreasing direction', () => {
    it('steps by 2 when current is below 10', () => {
      expect(nextSize(5, -1)).toBe(3)
      expect(nextSize(9, -1)).toBe(7)
    })

    it('steps by 5 when current is in the 10–29 range', () => {
      expect(nextSize(10, -1)).toBe(5)
      expect(nextSize(21, -1)).toBe(16)
    })

    it('steps by 10 when current is 30 or above', () => {
      expect(nextSize(30, -1)).toBe(20)
      expect(nextSize(50, -1)).toBe(40)
    })
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
