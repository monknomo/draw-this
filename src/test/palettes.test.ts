// src/test/palettes.test.ts
import { describe, it, expect } from 'vitest'
import { PALETTES, SHARED_NEUTRALS, DEFAULT_PALETTE } from '../palettes'

describe('palette data invariants', () => {
  it('ships exactly four palettes', () => {
    expect(PALETTES).toHaveLength(4)
  })

  it('lists Classic first and it is the default palette', () => {
    expect(PALETTES[0].name).toBe('Classic')
    expect(DEFAULT_PALETTE).toBe(PALETTES[0])
  })

  it('every palette has exactly 7 ordered colors', () => {
    for (const p of PALETTES) {
      expect(p.colors, `${p.name} should have 7 colors`).toHaveLength(7)
    }
  })

  it('defines an accent neutral only on Classic and Pastel', () => {
    const withAccent = PALETTES.filter(p => p.accentNeutral !== undefined).map(p => p.name)
    expect(new Set(withAccent)).toEqual(new Set(['Classic', 'Pastel']))
  })

  it('omits the accent neutral on Grayscale and Neon', () => {
    const grayscale = PALETTES.find(p => p.name === 'Grayscale')!
    const neon = PALETTES.find(p => p.name === 'Neon')!
    expect(grayscale.accentNeutral).toBeUndefined()
    expect(neon.accentNeutral).toBeUndefined()
  })

  it('reproduces the classic ROYGBIV+purple order', () => {
    expect(PALETTES[0].colors).toEqual([
      'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'purple',
    ])
    expect(PALETTES[0].accentNeutral).toBe('saddlebrown')
  })

  it('exposes black and white as the shared neutrals', () => {
    expect(SHARED_NEUTRALS).toEqual(['black', 'white'])
  })

  it('grayscale intentionally avoids the pure shared neutrals', () => {
    const grayscale = PALETTES.find(p => p.name === 'Grayscale')!
    expect(grayscale.colors).not.toContain('#000000')
    expect(grayscale.colors).not.toContain('#ffffff')
    expect(grayscale.colors).not.toContain('black')
    expect(grayscale.colors).not.toContain('white')
  })
})
