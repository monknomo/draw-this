// src/test/drawHorse/events.test.ts
import { drawHorse } from '../../drawHorse'
import { tools } from '../../tools/index'

describe('drawHorse event handling', () => {
  let ctx: any

  beforeAll(() => {
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    drawHorse.ctx = ctx
    if (drawHorse.canvas.width === 0) {
      drawHorse.canvas.width = 100
      drawHorse.canvas.height = 100
    }
    drawHorse.addListeners()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    drawHorse.currentTool = tools.drips
  })

  it('mouseleave on canvas calls stopDrawing (prevents stuck dripping sound when mouse exits canvas)', () => {
    const stopDrawingSpy = vi.spyOn(drawHorse.currentTool, 'stopDrawing')

    drawHorse.canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }))

    expect(stopDrawingSpy).toHaveBeenCalledOnce()
    stopDrawingSpy.mockRestore()
  })

  it('mouseenter on canvas calls beginPosition (prevents straight line from exit point to re-entry point)', () => {
    const beginPositionSpy = vi.spyOn(drawHorse, 'beginPosition')

    drawHorse.canvas.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }))

    expect(beginPositionSpy).toHaveBeenCalledOnce()
    beginPositionSpy.mockRestore()
  })
})
