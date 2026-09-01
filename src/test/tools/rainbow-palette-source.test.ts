// src/test/tools/rainbow-palette-source.test.ts
//
// Verifies that every rainbow mode reads its colors from the ACTIVE palette
// (drawHorse.activePalette.colors) rather than a hardcoded list. The rainbow
// SHAPE/behavior is asserted elsewhere; here we only pin the color SOURCE.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tools } from '../../tools/index'
import { drawHorse } from '../../drawHorse'
import { getRainbowColorForY } from '../../tools/bubbles'
import { colorizeStamp, buildRainbowStops } from '../../tools/stamp/colorize'
import { DEFAULT_PALETTE, type Palette } from '../../palettes'

// A distinctive palette whose colors overlap nothing in the Classic default,
// so "uses the active palette" is unambiguous.
const TEST_PALETTE: Palette = {
  name: 'TestPalette',
  colors: ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'],
}

describe('rainbow color source follows the active palette', () => {
  let ctx: any

  beforeEach(() => {
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    if (canvas.width === 0) canvas.width = 800
    if (canvas.height === 0) canvas.height = 600
    ctx.__clearDrawCalls?.()

    drawHorse.ctx = ctx
    drawHorse.pos = { x: 50, y: 50 }
    drawHorse.selectedColor = 'rainbow'
    drawHorse.activePalette = TEST_PALETTE
    drawHorse.setPosition = (e) => {
      if (e instanceof MouseEvent) drawHorse.pos = { x: e.clientX, y: e.clientY }
    }
  })

  afterEach(() => {
    drawHorse.activePalette = DEFAULT_PALETTE
    vi.restoreAllMocks()
  })

  it('pencil strokes one stripe per active-palette color', () => {
    drawHorse.pos = { x: 50, y: 50 }
    ctx.__clearDrawCalls()
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 120 })
    tools.pencil.draw(event)
    const strokeCalls = ctx.__getDrawCalls().filter((c: any) => c.type === 'stroke')
    expect(strokeCalls).toHaveLength(TEST_PALETTE.colors.length)
  })

  it('pencil paints stripes with the active-palette colors', () => {
    const seen: string[] = []
    const orig = Object.getOwnPropertyDescriptor(ctx, 'strokeStyle')
    Object.defineProperty(ctx, 'strokeStyle', {
      get() { return this._ss },
      set(v: string) { this._ss = v; seen.push(v) },
      configurable: true,
    })
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 120 })
    tools.pencil.draw(event)
    if (orig) Object.defineProperty(ctx, 'strokeStyle', orig)
    for (const color of TEST_PALETTE.colors) {
      expect(seen).toContain(color)
    }
  })

  it('drips cycles through the active-palette colors', () => {
    const seen: string[] = []
    const orig = Object.getOwnPropertyDescriptor(ctx, 'fillStyle')
    Object.defineProperty(ctx, 'fillStyle', {
      get() { return this._fs },
      set(v: string) { this._fs = v; seen.push(v) },
      configurable: true,
    })
    for (let i = 0; i < TEST_PALETTE.colors.length * 2; i++) {
      tools.drips.draw(new MouseEvent('mousemove', { clientX: 100 + i, clientY: 100 }))
    }
    if (orig) Object.defineProperty(ctx, 'fillStyle', orig)
    const uniqueFromPalette = [
      ...new Set(seen.filter(c => TEST_PALETTE.colors.includes(c))),
    ]
    expect(uniqueFromPalette).toHaveLength(TEST_PALETTE.colors.length)
  })

  it('bubbles slice mapping draws only from the active-palette colors', () => {
    const height = 700
    const sliceHeight = height / TEST_PALETTE.colors.length
    const mapped = Array.from({ length: TEST_PALETTE.colors.length }, (_, i) =>
      getRainbowColorForY(height - (i + 0.5) * sliceHeight, height, drawHorse.activePalette.colors)
    )
    expect(new Set(mapped)).toEqual(new Set(TEST_PALETTE.colors))
    // bottom = colors[0], top = colors[last]
    expect(getRainbowColorForY(height - 1, height, TEST_PALETTE.colors)).toBe(TEST_PALETTE.colors[0])
    expect(getRainbowColorForY(1, height, TEST_PALETTE.colors)).toBe(
      TEST_PALETTE.colors[TEST_PALETTE.colors.length - 1]
    )
  })

  it('stamp gradient builds one stop per active-palette color with evenly spaced offsets', () => {
    const stops = buildRainbowStops(TEST_PALETTE.colors)
    const stopCount = (stops.match(/<stop /g) || []).length
    expect(stopCount).toBe(TEST_PALETTE.colors.length)
    expect(stops).toContain('offset="0%"')
    expect(stops).toContain('offset="100%"')
    for (const color of TEST_PALETTE.colors) {
      expect(stops).toContain(`stop-color="${color}"`)
    }
  })

  it('colorizeStamp threads the active-palette colors into the rainbow gradient', () => {
    const svg = window.btoa('<svg viewBox="0 0 512 512"><path/></svg>')
    const out = window.atob(colorizeStamp(svg, 'rainbow', TEST_PALETTE.colors))
    for (const color of TEST_PALETTE.colors) {
      expect(out).toContain(`stop-color="${color}"`)
    }
  })
})
