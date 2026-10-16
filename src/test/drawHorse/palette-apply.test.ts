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

  describe('selected color moves to its equivalent slot', () => {
    const pastel = PALETTES.find(p => p.name === 'Pastel')!
    const grayscale = PALETTES.find(p => p.name === 'Grayscale')!
    const neon = PALETTES.find(p => p.name === 'Neon')!

    it.each(['black', 'white', 'rainbow'])('keeps %s (same in every palette)', color => {
      drawHorse.selectedColor = color
      drawHorse.applyPalette(pastel)
      expect(drawHorse.selectedColor).toBe(color)
    })

    it('translates each chromatic slot (Classic -> Neon)', () => {
      DEFAULT_PALETTE.colors.forEach((color, i) => {
        drawHorse.applyPalette(DEFAULT_PALETTE)
        drawHorse.selectedColor = color
        drawHorse.applyPalette(neon)
        expect(drawHorse.selectedColor).toBe(neon.colors[i])
      })
    })

    it('red becomes pastel pink, then back to red', () => {
      drawHorse.selectedColor = 'red'
      drawHorse.applyPalette(pastel)
      expect(drawHorse.selectedColor).toBe(pastel.colors[0])
      drawHorse.applyPalette(DEFAULT_PALETTE)
      expect(drawHorse.selectedColor).toBe('red')
    })

    it('translates the accent neutral to the new palette accent', () => {
      drawHorse.selectedColor = 'saddlebrown'
      drawHorse.applyPalette(pastel)
      expect(drawHorse.selectedColor).toBe(pastel.accentNeutral)
      drawHorse.applyPalette(grayscale)
      expect(drawHorse.selectedColor).toBe(grayscale.accentNeutral)
    })

    it('every slot survives a full lap of the palettes', () => {
      swatchColors(DEFAULT_PALETTE).forEach(color => {
        drawHorse.applyPalette(DEFAULT_PALETTE)
        drawHorse.selectedColor = color
        PALETTES.slice(1).concat(DEFAULT_PALETTE).forEach(p => drawHorse.applyPalette(p))
        expect(drawHorse.selectedColor).toBe(color)
      })
    })

    it('highlights the equivalent swatch after the swap', () => {
      drawHorse.selectedColor = 'orange'
      drawHorse.applyPalette(neon)
      const highlighted = document.querySelectorAll('#swatches .selectedColorChoice')
      expect(highlighted).toHaveLength(1)
      expect((highlighted[0] as HTMLElement).dataset.color).toBe(neon.colors[1])
    })

    it('highlights the rainbow swatch when rainbow is kept', () => {
      drawHorse.selectedColor = 'rainbow'
      drawHorse.applyPalette(neon)
      const highlighted = document.querySelector('#swatches .selectedColorChoice') as HTMLElement
      expect(highlighted.dataset.color).toBe('rainbow')
    })

    it('falls back to black for a color the old palette never offered', () => {
      drawHorse.selectedColor = '#123456'
      drawHorse.applyPalette(pastel)
      expect(drawHorse.selectedColor).toBe('black')
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

  it('renders the same number of swatches for every palette', () => {
    const counts = PALETTES.map(p => {
      drawHorse.applyPalette(p)
      return document.querySelectorAll('#swatches .colorChoice').length
    })
    expect(new Set(counts).size, `swatch counts differ: ${counts.join(', ')}`).toBe(1)
    expect(counts[0]).toBe(11) // 7 colors + black + white + accent + rainbow
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

  it('keeps black and rainbow when cycling', () => {
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
