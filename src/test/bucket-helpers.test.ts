// src/test/bucket-helpers.test.ts
import { hexToRgb, rgbToHex, standardizeColor, matchExact } from '../tools/bucket-helpers'

describe('matchExact (flood-fill traversal)', () => {
  // pixel buffer: [white, black, near-white(254), transparent]
  const data = new Uint8ClampedArray([
    255, 255, 255, 255,
    0, 0, 0, 255,
    254, 255, 255, 255,
    0, 0, 0, 0,
  ])

  it('matches a byte-for-byte identical pixel', () => {
    expect(matchExact(data, 0, [255, 255, 255, 255])).toBe(true)
  })

  it('treats a solid stroke pixel as a non-match (hard barrier)', () => {
    expect(matchExact(data, 4, [255, 255, 255, 255])).toBe(false)
  })

  it('rejects a one-channel-off antialiased fringe pixel (no tolerance)', () => {
    // 254 vs 255 in the red channel — previously passed under fuzzy tolerance,
    // now a barrier. This is what stops fills bleeding across stroke edges.
    expect(matchExact(data, 8, [255, 255, 255, 255])).toBe(false)
  })

  it('distinguishes a transparent pixel from an opaque one of the same rgb', () => {
    expect(matchExact(data, 12, [0, 0, 0, 255])).toBe(false)
    expect(matchExact(data, 12, [0, 0, 0, 0])).toBe(true)
  })
})

describe('hexToRgb (AC4.3)', () => {
  it.each([
    ['#ff0000', [255, 0, 0]],
    ['#00ff00', [0, 255, 0]],
    ['#0000ff', [0, 0, 255]],
    ['#ffffff', [255, 255, 255]],
    ['#000000', [0, 0, 0]],
  ])('hexToRgb(%s) returns %j', (hex, expected) => {
    expect(hexToRgb(hex)).toEqual(expected)
  })
})

describe('rgbToHex (AC4.3)', () => {
  it('converts RGB components to a hex string', () => {
    expect(rgbToHex(255, 0, 0)).toBe('ff0000')
    expect(rgbToHex(0, 255, 0)).toBe('ff00')
    expect(rgbToHex(0, 0, 255)).toBe('ff')
    expect(rgbToHex(255, 255, 255)).toBe('ffffff')
  })

  it('throws on invalid components > 255', () => {
    expect(() => rgbToHex(256, 0, 0)).toThrow('Invalid color component')
  })
})

describe('hexToRgb / rgbToHex round-trip (AC4.3)', () => {
  it.each(['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'])(
    'round-trip preserves %s',
    (hex) => {
      const [r, g, b] = hexToRgb(hex)
      const result = '#' + rgbToHex(r, g, b).padStart(6, '0')
      expect(result).toBe(hex)
    }
  )
})

describe('standardizeColor (AC4.4)', () => {
  // standardizeColor creates a canvas, sets fillStyle to a CSS color name,
  // then reads fillStyle back (normalized to hex by the browser) and converts to RGB.
  // vitest-canvas-mock may not normalize fillStyle from CSS names to hex —
  // if this returns [0, 0, 0] for all colors, mark this describe block .skip with:
  // "mock canvas does not normalize fillStyle; covered by manual browser testing in Phase 6"
  it('converts "red" to [255, 0, 0]', () => {
    expect(standardizeColor('red')).toEqual([255, 0, 0])
  })

  it('converts "blue" to [0, 0, 255]', () => {
    expect(standardizeColor('blue')).toEqual([0, 0, 255])
  })

  it('converts "white" to [255, 255, 255]', () => {
    expect(standardizeColor('white')).toEqual([255, 255, 255])
  })

  it('converts "black" to [0, 0, 0]', () => {
    expect(standardizeColor('black')).toEqual([0, 0, 0])
  })
})
