import { describe, it, expect, beforeEach, vi } from 'vitest'

declare const __drawHorse: any
declare const __tools: Record<string, any>

describe('undo stack', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    // Ensure canvas has dimensions for getImageData to work
    if (canvas.width === 0) {
      canvas.width = 800
    }
    if (canvas.height === 0) {
      canvas.height = 600
    }
    ctx.__clearDrawCalls()
    // Reset undoStack to a known empty state before each test
    __drawHorse.undoStack = []
  })

  it('AC1.7: endPosition() pushes a snapshot to undoStack', () => {
    expect(__drawHorse.undoStack.length).toBe(0)
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    const event = new MouseEvent('mouseup', { bubbles: true })
    Object.defineProperty(event, 'target', {
      value: canvas,
      enumerable: true,
    })
    __drawHorse.endPosition(event)
    expect(__drawHorse.undoStack.length).toBe(1)
    expect(__drawHorse.undoStack[0]).toBeInstanceOf(ImageData)
  })

  it('AC1.6: oops.onclick() pops undoStack and calls ctx.putImageData', () => {
    // Push a snapshot first
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    const event = new MouseEvent('mouseup', { bubbles: true })
    Object.defineProperty(event, 'target', {
      value: canvas,
      enumerable: true,
    })
    __drawHorse.endPosition(event)
    expect(__drawHorse.undoStack.length).toBe(1)

    // Spy on putImageData to verify it was called
    const putImageDataSpy = vi.spyOn(ctx, 'putImageData')
    __tools.oops.onclick(new MouseEvent('click'))

    expect(__drawHorse.undoStack.length).toBe(0)
    expect(putImageDataSpy).toHaveBeenCalledOnce()
    putImageDataSpy.mockRestore()
  })

  it('AC1.6: oops.onclick() does nothing when undoStack is empty', () => {
    expect(__drawHorse.undoStack.length).toBe(0)
    expect(() => {
      __tools.oops.onclick(new MouseEvent('click'))
    }).not.toThrow()
  })
})
