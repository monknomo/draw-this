// src/test/tools/canvas-draw-calls.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { tools } from '../../tools/index'
import { drawHorse } from '../../drawHorse'
import { getRainbowColorForY } from '../../tools/bubbles'

describe('canvas draw calls (import-based)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    // Ensure canvas has dimensions
    if (canvas.width === 0) {
      canvas.width = 800
    }
    if (canvas.height === 0) {
      canvas.height = 600
    }
    ctx.__clearDrawCalls()

    // Wire drawHorse stub to the jsdom canvas for this test
    drawHorse.ctx = ctx
    drawHorse.pos = { x: 50, y: 50 }
    drawHorse.selectedColor = 'black'
    drawHorse.undoStack = []
    drawHorse.setPosition = (e) => {
      if (e instanceof MouseEvent) {
        drawHorse.pos = { x: e.clientX, y: e.clientY }
      }
    }
    drawHorse.showColorSelectors = () => {}
    drawHorse.hideStampSelectors = () => {}
    drawHorse.showStampSelectors = () => {}
  })

  describe('pencil (AC1.1)', () => {
    it('draw() calls beginPath, moveTo, lineTo, stroke', () => {
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      tools.pencil.draw(event)
      // vitest-canvas-mock records in _events (all method calls and property sets)
      // Get both draw calls and events
      const drawCalls = ctx.__getDrawCalls()
      const allEvents = (ctx as any)._events || []
      const allCalls = [...drawCalls, ...allEvents]
      expect(allCalls.some((c: any) => c.type === 'beginPath')).toBe(true)
      expect(allCalls.some((c: any) => c.type === 'moveTo')).toBe(true)
      expect(allCalls.some((c: any) => c.type === 'lineTo')).toBe(true)
      expect(allCalls.some((c: any) => c.type === 'stroke')).toBe(true)
    })
  })

  describe('eraser (AC1.2)', () => {
    it('draw() uses strokeStyle = "white"', () => {
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      tools.eraser.draw(event)
      // eraser sets strokeStyle to white during draw — ctx normalizes it to hex
      expect(ctx.strokeStyle).toBe('#ffffff')
    })
  })

  describe('drips (AC1.3)', () => {
    it('draw() calls ctx.arc and ctx.fill', () => {
      ctx.__clearDrawCalls() // Clear any previous calls
      // Call 20 times to ensure at least one non-zero drip is produced
      for (let i = 0; i < 20; i++) {
        const event = new MouseEvent('mousemove', { clientX: 100 + i, clientY: 100 })
        tools.drips.draw(event)
      }
      const drawCalls = ctx.__getDrawCalls()
      const allEvents = (ctx as any)._events || []
      const allCalls = [...drawCalls, ...allEvents]
      expect(allCalls.some((c: any) => c.type === 'arc')).toBe(true)
      expect(allCalls.some((c: any) => c.type === 'fill')).toBe(true)
    })

    it('draw() cycles through rainbow colors when selectedColor is rainbow', () => {
      const RAINBOW_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'purple']
      drawHorse.selectedColor = 'rainbow'
      const seenColors: string[] = []
      const origFillStyleDescriptor = Object.getOwnPropertyDescriptor(ctx, 'fillStyle')
      Object.defineProperty(ctx, 'fillStyle', {
        get() { return this._fillStyle },
        set(v: string) {
          this._fillStyle = v
          seenColors.push(v)
        },
        configurable: true,
      })
      // Draw enough times to cycle through all colors twice
      for (let i = 0; i < 14; i++) {
        const event = new MouseEvent('mousemove', { clientX: 100 + i, clientY: 100 })
        tools.drips.draw(event)
      }
      if (origFillStyleDescriptor) {
        Object.defineProperty(ctx, 'fillStyle', origFillStyleDescriptor)
      }
      const uniqueSeen = [...new Set(seenColors.filter(c => RAINBOW_COLORS.includes(c)))]
      expect(uniqueSeen).toHaveLength(RAINBOW_COLORS.length)
    })

    it('draw() uses selectedColor directly for non-rainbow colors', () => {
      drawHorse.selectedColor = 'blue'
      const seenColors: string[] = []
      Object.defineProperty(ctx, 'fillStyle', {
        get() { return this._fillStyle },
        set(v: string) { this._fillStyle = v; seenColors.push(v) },
        configurable: true,
      })
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      tools.drips.draw(event)
      expect(seenColors.every(c => c === 'blue' || c === '#0000ff')).toBe(true)
    })
  })

  describe('stamp (AC1.4)', () => {
    it('draw() calls ctx.drawImage', async () => {
      // jsdom doesn't fire img.onload for base64 data URIs. We stub Image so its
      // src setter fires onload in the next microtask — matching real browser async
      // behavior and giving stamp.draw() time to assign the onload handler first.
      class AsyncImage {
        width: number; height: number; onload: (() => void) | null = null
        private _src = ''
        constructor(w = 0, h = 0) { this.width = w; this.height = h }
        get src() { return this._src }
        set src(value: string) {
          this._src = value
          Promise.resolve().then(() => this.onload?.())
        }
      }
      vi.stubGlobal('Image', AsyncImage)

      // Set up a minimal selectedStamp
      drawHorse.selectedStamp = {
        id: 'test',
        name: 'Test',
        // Minimal valid base64 SVG with %%%% placeholder
        url: window.btoa('<svg xmlns="http://www.w3.org/2000/svg"><circle %%%%/></svg>'),
      }

      // mockImplementation prevents vitest-canvas-mock from throwing on AsyncImage argument
      const drawImageSpy = vi.spyOn(ctx, 'drawImage').mockImplementation(() => {})
      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      tools.stamp.draw(event)
      await Promise.resolve() // let the microtask queue drain so onload fires

      expect(drawImageSpy).toHaveBeenCalled()

      vi.unstubAllGlobals()
    })
  })

  describe('pencil rainbow mode', () => {
    it('draw() calls stroke 7 times when selectedColor is rainbow', () => {
      drawHorse.selectedColor = 'rainbow'
      drawHorse.pos = { x: 50, y: 50 }
      ctx.__clearDrawCalls()
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      tools.pencil.draw(event)
      const strokeCalls = ctx.__getDrawCalls().filter((c: any) => c.type === 'stroke')
      expect(strokeCalls).toHaveLength(7)
    })

    it('draw() calls stroke once for non-rainbow color', () => {
      drawHorse.selectedColor = 'black'
      drawHorse.pos = { x: 50, y: 50 }
      ctx.__clearDrawCalls()
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      tools.pencil.draw(event)
      const strokeCalls = ctx.__getDrawCalls().filter((c: any) => c.type === 'stroke')
      expect(strokeCalls).toHaveLength(1)
    })
  })

  describe('bubbles rainbow slice colors', () => {
    it('getRainbowColorForY returns red at the bottom', () => {
      expect(getRainbowColorForY(590, 600)).toBe('red')
    })

    it('getRainbowColorForY returns purple at the top', () => {
      expect(getRainbowColorForY(10, 600)).toBe('purple')
    })

    it('getRainbowColorForY returns distinct colors across 7 slices', () => {
      const height = 700
      const sliceHeight = height / 7
      const colors = Array.from({ length: 7 }, (_, i) =>
        getRainbowColorForY(height - (i + 0.5) * sliceHeight, height)
      )
      expect(new Set(colors).size).toBe(7)
    })
  })

  describe('nuke (AC1.5)', () => {
    it('onclick() calls ctx.clearRect on the entire canvas', () => {
      tools.nuke.onclick(new MouseEvent('click'))
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'clearRect')).toBe(true)
    })
  })
})
