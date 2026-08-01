// src/test/size-control.test.ts
import { describe, it, expect } from 'vitest'
import { nextSize, SIZE_MIN, SIZE_MAX, SIZE_DEFAULT } from '../sizeControl'

describe('nextSize', () => {
  describe('increasing direction', () => {
    it('steps by 1 when current is below 10', () => {
      expect(nextSize(5, 1)).toBe(6)
      expect(nextSize(1, 1)).toBe(2)
      expect(nextSize(9, 1)).toBe(10)
    })

    it('steps by 2 when current is in the 10–19 range', () => {
      expect(nextSize(10, 1)).toBe(12)
      expect(nextSize(15, 1)).toBe(17)
      expect(nextSize(19, 1)).toBe(21)
    })

    it('steps by 5 when current is 20 or above', () => {
      expect(nextSize(20, 1)).toBe(25)
      expect(nextSize(30, 1)).toBe(35)
      expect(nextSize(45, 1)).toBe(50)
    })
  })

  describe('decreasing direction', () => {
    it('steps by 1 when current is below 10', () => {
      expect(nextSize(5, -1)).toBe(4)
      expect(nextSize(9, -1)).toBe(8)
    })

    it('steps by 2 when current is in the 10–19 range', () => {
      expect(nextSize(10, -1)).toBe(8)
      expect(nextSize(15, -1)).toBe(13)
    })

    it('steps by 5 when current is 20 or above', () => {
      expect(nextSize(20, -1)).toBe(15)
      expect(nextSize(30, -1)).toBe(25)
    })
  })

  describe('clamping', () => {
    it('does not exceed SIZE_MAX when increasing at the ceiling', () => {
      expect(nextSize(SIZE_MAX, 1)).toBe(SIZE_MAX)
      expect(nextSize(SIZE_MAX - 1, 1)).toBe(SIZE_MAX)
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
