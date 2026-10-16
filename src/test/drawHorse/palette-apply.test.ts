// src/test/drawHorse/palette-apply.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { drawHorse } from '../../drawHorse'
import { PALETTES, DEFAULT_PALETTE } from '../../palettes'

describe('applyPalette (palette switching)', () => {
  beforeEach(() => {
    drawHorse.applyPalette(DEFAULT_PALETTE)
  })

  it('sets activePalette to the chosen palette', () => {
    const neon = PALETTES.find(p => p.name === 'Neon')!
    drawHorse.applyPalette(neon)
    expect(drawHorse.activePalette).toBe(neon)
  })

  describe('color survives a palette swap', () => {
    const pastel = PALETTES.find(p => p.name === 'Pastel')!
    const neon = PALETTES.find(p => p.name === 'Neon')!

    it.each(['black', 'white', 'rainbow'])('keeps %s (offered by every palette)', color => {
      drawHorse.selectedColor = color
      drawHorse.applyPalette(pastel)
      expect(drawHorse.selectedColor).toBe(color)
    })

    it('keeps a color the new palette also offers', () => {
      drawHorse.selectedColor = pastel.colors[2]
      drawHorse.applyPalette(pastel)
      expect(drawHorse.selectedColor).toBe(pastel.colors[2])
    })

    it('falls back to black when the new palette does not offer the color', () => {
      drawHorse.selectedColor = 'red' // Classic only
      drawHorse.applyPalette(neon)
      expect(drawHorse.selectedColor).toBe('black')
    })

    it('falls back to black when the old accent neutral is not in the new palette', () => {
      drawHorse.selectedColor = 'saddlebrown' // Classic accent
      drawHorse.applyPalette(neon)
      expect(drawHorse.selectedColor).toBe('black')
    })

    it('never lands on a near-white first color (Grayscale colors[0])', () => {
      const grayscale = PALETTES.find(p => p.name === 'Grayscale')!
      drawHorse.selectedColor = 'red'
      drawHorse.applyPalette(grayscale)
      expect(drawHorse.selectedColor).not.toBe(grayscale.colors[0])
    })

    it('highlights the swatch of the color it kept', () => {
      drawHorse.selectedColor = 'white'
      drawHorse.applyPalette(neon)
      const highlighted = document.querySelectorAll('#swatches .selectedColorChoice')
      expect(highlighted).toHaveLength(1)
      expect((highlighted[0] as HTMLElement).dataset.color).toBe('white')
    })

    it('highlights the rainbow swatch when rainbow is kept', () => {
      drawHorse.selectedColor = 'rainbow'
      drawHorse.applyPalette(neon)
      const highlighted = document.querySelector('#swatches .selectedColorChoice') as HTMLElement
      expect(highlighted.dataset.color).toBe('rainbow')
    })
  })

  it('re-renders swatches from the new palette (colors + neutrals + accent)', () => {
    const classic = PALETTES.find(p => p.name === 'Classic')!
    drawHorse.applyPalette(classic)
    const rendered = Array.from(
      document.querySelectorAll('#swatches .colorChoice')
    ).map(el => (el as HTMLElement).dataset.color)
    // 7 palette colors + black + white + accent + rainbow
    expect(rendered).toEqual([
      ...classic.colors, 'black', 'white', classic.accentNeutral, 'rainbow',
    ])
  })

  it('omits the accent swatch for palettes without an accent neutral', () => {
    const grayscale = PALETTES.find(p => p.name === 'Grayscale')!
    drawHorse.applyPalette(grayscale)
    const rendered = Array.from(
      document.querySelectorAll('#swatches .colorChoice')
    ).map(el => (el as HTMLElement).dataset.color)
    expect(rendered).toEqual([...grayscale.colors, 'black', 'white', 'rainbow'])
  })

  it('highlights the fallback swatch when the color is not carried over', () => {
    const neon = PALETTES.find(p => p.name === 'Neon')!
    drawHorse.selectedColor = 'red'
    drawHorse.applyPalette(neon)
    const highlighted = document.querySelector('#swatches .selectedColorChoice') as HTMLElement
    expect(highlighted.dataset.color).toBe('black')
  })
})

describe('palette button', () => {
  const paletteButton = () => document.getElementById('palette-button') as HTMLElement

  beforeEach(() => {
    drawHorse.applyPalette(DEFAULT_PALETTE)
    drawHorse.setupPalettePicker()
  })

  it('is not a color choice (its own class, so the color handler skips it)', () => {
    expect(paletteButton().classList.contains('colorChoice')).toBe(false)
  })

  it('does not change the selected color when clicked', () => {
    ;(document.querySelector('#swatches .colorChoice[data-color="red"]') as HTMLElement).click()
    expect(drawHorse.selectedColor).toBe('red')
    paletteButton().click()
    expect(drawHorse.selectedColor).toBe('red')
  })

  it('does not steal the selected-swatch highlight', () => {
    ;(document.querySelector('#swatches .colorChoice[data-color="red"]') as HTMLElement).click()
    paletteButton().click()
    expect(paletteButton().classList.contains('selectedColorChoice')).toBe(false)
    const highlighted = document.querySelector('.selectedColorChoice') as HTMLElement
    expect(highlighted.dataset.color).toBe('red')
  })
})
