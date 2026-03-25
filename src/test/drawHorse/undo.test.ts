// src/test/drawHorse/undo.test.ts
import { drawHorse } from '../../drawHorse'
import { tools } from '../../tools/index'

describe('undo (import-based)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    drawHorse.ctx = ctx
    drawHorse.undoStack = []
    // Ensure canvas has dimensions
    if (drawHorse.canvas.width === 0) {
      drawHorse.canvas.width = 100
      drawHorse.canvas.height = 100
    }
  })

  it('AC1.6: oops.onclick() pops undoStack and calls ctx.putImageData', () => {
    // Push a snapshot first
    const event = new MouseEvent('mouseup', { bubbles: true })
    Object.defineProperty(event, 'target', { value: drawHorse.canvas, enumerable: true })
    drawHorse.endPosition(event)
    expect(drawHorse.undoStack.length).toBe(1)

    // Spy on putImageData to verify it was called
    const putImageDataSpy = vi.spyOn(ctx, 'putImageData')
    tools.oops.onclick(new MouseEvent('click'))

    expect(drawHorse.undoStack.length).toBe(0)
    expect(putImageDataSpy).toHaveBeenCalledOnce()
    putImageDataSpy.mockRestore()
  })
})
