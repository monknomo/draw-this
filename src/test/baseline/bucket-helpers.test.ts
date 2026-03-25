import { describe, it, expect } from 'vitest'

declare const __tools: Record<string, any>

// Access bucket helper functions via __tools.bucket
const { hexToRgb, rgbToHex, standardizeColor } = __tools.bucket

describe('bucket helper functions', () => {
  describe('AC4.3: hexToRgb and rgbToHex round-trip preserves color values', () => {
    const testColors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000']

    it.each(testColors)(
      'round-trips color %s correctly',
      (hex) => {
        const rgb = hexToRgb(hex)
        const returnedHex = rgbToHex(rgb[0], rgb[1], rgb[2])
        // rgbToHex returns without # prefix and doesn't pad leading zeros
        // Pad to 6 chars and normalize for comparison
        const paddedHex = `#${returnedHex.padStart(6, '0')}`
        expect(paddedHex).toBe(hex)
      }
    )
  })

  describe('AC4.4: standardizeColor converts CSS color names to RGB arrays', () => {
    it('converts red to [255, 0, 0]', () => {
      // standardizeColor paints to a temporary canvas and reads pixel data.
      // vitest-canvas-mock may not provide real pixel values for named colors.
      // If it returns [0, 0, 0] for all colors, mark this test .skip with a
      // note explaining the mock canvas limitation.
      const red = standardizeColor('red')
      expect(red).toEqual([255, 0, 0])
    })

    it('converts green to [0, 128, 0]', () => {
      const green = standardizeColor('green')
      expect(green).toEqual([0, 128, 0])
    })

    it('converts blue to [0, 0, 255]', () => {
      const blue = standardizeColor('blue')
      expect(blue).toEqual([0, 0, 255])
    })
  })
})
