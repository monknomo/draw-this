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

  it('resets selectedColor to the palette first color', () => {
    const pastel = PALETTES.find(p => p.name === 'Pastel')!
    drawHorse.applyPalette(pastel)
    expect(drawHorse.selectedColor).toBe(pastel.colors[0])
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

  it('highlights the first swatch as the selected color', () => {
    const neon = PALETTES.find(p => p.name === 'Neon')!
    drawHorse.applyPalette(neon)
    const highlighted = document.querySelector('#swatches .selectedColorChoice') as HTMLElement
    expect(highlighted.dataset.color).toBe(neon.colors[0])
  })
})
