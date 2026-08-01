// src/test/drawHorse/events.test.ts
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
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

  it('clicking a selectable tool button switches currentTool and applies selectedControl class (AC4.1)', () => {
    // Start with pencil as current tool
    drawHorse.currentTool = tools.pencil
    const pencilButton = document.getElementById('pencil') as HTMLElement
    const dripsButton = document.getElementById('drips') as HTMLElement

    // Ensure initial state: pencil is selected
    pencilButton.classList.add('selectedControl')
    expect(drawHorse.currentTool).toBe(tools.pencil)
    expect(pencilButton.classList.contains('selectedControl')).toBe(true)
    expect(dripsButton.classList.contains('selectedControl')).toBe(false)

    // Click the drips button
    dripsButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    // Assert: currentTool switched to drips
    expect(drawHorse.currentTool).toBe(tools.drips)
    // Assert: drips button has selectedControl class
    expect(dripsButton.classList.contains('selectedControl')).toBe(true)
    // Assert: pencil button no longer has selectedControl class
    expect(pencilButton.classList.contains('selectedControl')).toBe(false)
  })
})
