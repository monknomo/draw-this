// src/test/palettes.test.ts
import { describe, it, expect } from 'vitest'
import { PALETTES, SHARED_NEUTRALS, DEFAULT_PALETTE, swatchColors, cyclePalette } from '../palettes'

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

  it('every palette defines an accent neutral', () => {
    for (const p of PALETTES) {
      expect(p.accentNeutral, `${p.name} needs an accent neutral`).toBeTruthy()
    }
  })

  it('every palette offers the same number of swatches', () => {
    const counts = PALETTES.map(p => swatchColors(p).length)
    expect(new Set(counts).size, `swatch counts differ: ${counts.join(', ')}`).toBe(1)
    expect(counts[0]).toBe(10) // 7 colors + black + white + accent
  })

  it('no palette repeats a swatch color (accent and neutrals included)', () => {
    for (const p of PALETTES) {
      const all = swatchColors(p).map(c => c.toLowerCase())
      expect(new Set(all).size, `${p.name} has a duplicate swatch`).toBe(all.length)
    }
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

describe('swatchColors', () => {
  it('lists palette colors, then shared neutrals, then the accent neutral', () => {
    const classic = PALETTES.find(p => p.name === 'Classic')!
    expect(swatchColors(classic)).toEqual([
      ...classic.colors, ...SHARED_NEUTRALS, classic.accentNeutral,
    ])
  })

  it('has the same length for every palette', () => {
    const lengths = new Set(PALETTES.map(p => swatchColors(p).length))
    expect(lengths.size).toBe(1)
  })

  it('always includes black, so it is a safe fallback color', () => {
    for (const p of PALETTES) expect(swatchColors(p)).toContain('black')
  })
})

describe('cyclePalette (ring buffer)', () => {
  const first = PALETTES[0]
  const last = PALETTES[PALETTES.length - 1]

  it('steps forward to the next palette', () => {
    expect(cyclePalette(PALETTES[0], 1)).toBe(PALETTES[1])
    expect(cyclePalette(PALETTES[1], 1)).toBe(PALETTES[2])
  })

  it('steps back to the previous palette', () => {
    expect(cyclePalette(PALETTES[2], -1)).toBe(PALETTES[1])
    expect(cyclePalette(PALETTES[1], -1)).toBe(PALETTES[0])
  })

  it('wraps from the last palette forward to the first', () => {
    expect(cyclePalette(last, 1)).toBe(first)
  })

  it('wraps from the first palette back to the last', () => {
    expect(cyclePalette(first, -1)).toBe(last)
  })

  it('visits every palette exactly once in a full lap, in either direction', () => {
    for (const step of [1, -1] as const) {
      const seen = new Set<string>()
      let p = first
      for (let i = 0; i < PALETTES.length; i++) {
        seen.add(p.name)
        p = cyclePalette(p, step)
      }
      expect(seen.size).toBe(PALETTES.length)
      expect(p).toBe(first)
    }
  })

  it('forward then back returns to the start', () => {
    for (const p of PALETTES) expect(cyclePalette(cyclePalette(p, 1), -1)).toBe(p)
  })
})
