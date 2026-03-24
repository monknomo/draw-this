import { describe, it, expect } from 'vitest'

declare const __tools: Record<string, any>

describe('getDripSize distribution', () => {
  it('AC4.1: returns 0 approximately half the time across 200 calls', () => {
    const results = Array.from({ length: 200 }, () => __tools.drips.getDripSize())
    const zeroCount = results.filter(r => r === 0).length
    // Allow wide range: 20–180 zeros out of 200 calls (10–90%)
    expect(zeroCount).toBeGreaterThanOrEqual(20)
    expect(zeroCount).toBeLessThanOrEqual(180)
  })

  it('AC4.2: never returns values between 1 and 5', () => {
    const results = Array.from({ length: 200 }, () => __tools.drips.getDripSize())
    const invalidValues = results.filter(r => r > 0 && r < 6)
    expect(invalidValues).toHaveLength(0)
  })
})
