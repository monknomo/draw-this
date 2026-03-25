import { describe, it, expect, beforeEach, vi } from 'vitest'

declare const __tools: Record<string, any>
declare const __drawHorse: any

describe('canvas draw calls', () => {
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
    // Set a known draw position
    __drawHorse.pos = { x: 50, y: 50 }
  })

  describe('pencil (AC1.1)', () => {
    it('draw() calls beginPath, moveTo, lineTo, stroke', () => {
      const canvas = document.getElementById('drawHere') as HTMLCanvasElement
      __drawHorse.currentTool = __tools.pencil
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      Object.defineProperty(event, 'target', {
        value: canvas,
        enumerable: true,
      })
      ctx.__clearDrawCalls()
      __tools.pencil.draw(event)
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
      const canvas = document.getElementById('drawHere') as HTMLCanvasElement
      __drawHorse.currentTool = __tools.eraser
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 100 })
      Object.defineProperty(event, 'target', {
        value: canvas,
        enumerable: true,
      })
      __tools.eraser.draw(event)
      // eraser sets strokeStyle to white during draw — ctx normalizes it to hex
      expect(ctx.strokeStyle).toBe('#ffffff')
    })
  })

  describe('drips (AC1.3)', () => {
    it('draw() calls ctx.arc and ctx.fill', () => {
      const canvas = document.getElementById('drawHere') as HTMLCanvasElement
      __drawHorse.currentTool = __tools.drips
      ctx.__clearDrawCalls() // Clear any previous calls
      // Call 20 times to ensure at least one non-zero drip is produced
      for (let i = 0; i < 20; i++) {
        const event = new MouseEvent('mousemove', { clientX: 100 + i, clientY: 100 })
        Object.defineProperty(event, 'target', {
          value: canvas,
          enumerable: true,
        })
        __tools.drips.draw(event)
      }
      const drawCalls = ctx.__getDrawCalls()
      const allEvents = (ctx as any)._events || []
      const allCalls = [...drawCalls, ...allEvents]
      expect(allCalls.some((c: any) => c.type === 'arc')).toBe(true)
      expect(allCalls.some((c: any) => c.type === 'fill')).toBe(true)
    })
  })

  describe('stamp (AC1.4)', () => {
    it.skip('draw() calls ctx.drawImage', async () => {
      // stamp.draw() is async and fires drawImage in img.onload.
      // jsdom doesn't properly load base64 data URIs for images, so img.onload never fires.
      // This behavior is verified in Phase 4 import-based tests.
      const canvas = document.getElementById('drawHere') as HTMLCanvasElement
      __drawHorse.currentTool = __tools.stamp
      // Ensure a stamp is selected (setupStamps runs during onload)
      if (!__drawHorse.selectedStamp) {
        const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser button')
        if (stampChoices.length > 0) {
          stampChoices[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }
      }
      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      Object.defineProperty(event, 'target', {
        value: canvas,
        enumerable: true,
      })
      __tools.stamp.draw(event)
      // stamp.draw() fires drawImage in img.onload — give the microtask/timeout a tick
      await new Promise(resolve => setTimeout(resolve, 50))
      const drawCalls = ctx.__getDrawCalls()
      const allEvents = (ctx as any)._events || []
      const allCalls = [...drawCalls, ...allEvents]
      expect(allCalls.some((c: any) => c.type === 'drawImage')).toBe(true)
    })
  })

  describe('nuke (AC1.5)', () => {
    it('onclick() calls ctx.clearRect on the entire canvas', () => {
      __tools.nuke.onclick(new MouseEvent('click'))
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'clearRect')).toBe(true)
    })
  })
})
