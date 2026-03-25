// src/test/bucket-helpers.test.ts
import { hexToRgb, rgbToHex, standardizeColor } from '../tools/bucket-helpers'

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
