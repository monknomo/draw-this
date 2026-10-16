// src/test/drawHorse/palette-apply.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { drawHorse } from '../../drawHorse'
import { PALETTES, DEFAULT_PALETTE, swatchColors } from '../../palettes'

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

describe('palette arrows (ring-buffer cycling)', () => {
  const next = () => document.getElementById('palette-next') as HTMLElement
  const prev = () => document.getElementById('palette-prev') as HTMLElement
  const rendered = () =>
    Array.from(document.querySelectorAll('#swatches .colorChoice')).map(
      el => (el as HTMLElement).dataset.color
    )

  beforeEach(() => {
    drawHorse.selectedColor = 'black'
    drawHorse.applyPalette(DEFAULT_PALETTE)
    drawHorse.setupPalettePicker()
  })

  it('are not color choices (own class, so the color handler skips them)', () => {
    expect(next().classList.contains('colorChoice')).toBe(false)
    expect(prev().classList.contains('colorChoice')).toBe(false)
  })

  it('next steps to the following palette and re-renders its swatches', () => {
    next().click()
    expect(drawHorse.activePalette).toBe(PALETTES[1])
    expect(rendered()).toEqual(swatchColors(PALETTES[1]).concat('rainbow'))
  })

  it('previous steps back to the preceding palette', () => {
    next().click()
    next().click()
    prev().click()
    expect(drawHorse.activePalette).toBe(PALETTES[1])
  })

  it('previous from the first palette wraps to the last', () => {
    prev().click()
    expect(drawHorse.activePalette).toBe(PALETTES[PALETTES.length - 1])
  })

  it('next from the last palette wraps to the first', () => {
    for (let i = 0; i < PALETTES.length - 1; i++) next().click()
    expect(drawHorse.activePalette).toBe(PALETTES[PALETTES.length - 1])
    next().click()
    expect(drawHorse.activePalette).toBe(PALETTES[0])
  })

  it('one click moves exactly one step, even if the picker was wired twice', () => {
    drawHorse.setupPalettePicker()
    drawHorse.setupPalettePicker()
    next().click()
    expect(drawHorse.activePalette).toBe(PALETTES[1])
  })

  it('does not change the selected color when the color exists in every palette', () => {
    for (const color of ['black', 'rainbow']) {
      drawHorse.selectedColor = color
      next().click()
      expect(drawHorse.selectedColor).toBe(color)
    }
  })

  it('does not steal the selected-swatch highlight', () => {
    drawHorse.selectedColor = 'white'
    drawHorse.applyPalette(DEFAULT_PALETTE)
    next().click()
    expect(next().classList.contains('selectedColorChoice')).toBe(false)
    expect(prev().classList.contains('selectedColorChoice')).toBe(false)
    const highlighted = document.querySelectorAll('.selectedColorChoice')
    expect(highlighted).toHaveLength(1)
    expect((highlighted[0] as HTMLElement).dataset.color).toBe('white')
  })

  it('plays the click sound', () => {
    const play = window.HTMLMediaElement.prototype.play as unknown as ReturnType<typeof vi.fn>
    play.mockClear()
    next().click()
    prev().click()
    expect(play).toHaveBeenCalledTimes(2)
  })
})
