// src/test/drawHorse/state.test.ts
import { drawHorse } from '../../drawHorse'
import { tools } from '../../tools/index'

describe('drawHorse state (import-based)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    drawHorse.ctx = ctx
    drawHorse.undoStack = []
    drawHorse.selectedColor = 'black'
    drawHorse.currentTool = tools.pencil
  })

  describe('AC1.7: beginPosition() pushes to undoStack', () => {
    it('pushes an ImageData snapshot before each stroke', () => {
      // Ensure canvas has dimensions so getImageData doesn't fail
      if (drawHorse.canvas.width === 0) {
        drawHorse.canvas.width = 100
        drawHorse.canvas.height = 100
      }
      expect(drawHorse.undoStack.length).toBe(0)
      const event = new MouseEvent('mousedown')
      Object.defineProperty(event, 'target', { value: drawHorse.canvas, enumerable: true })
      drawHorse.beginPosition(event)
      expect(drawHorse.undoStack.length).toBe(1)
    })
  })

  describe('AC1.8: color button click sets selectedColor', () => {
    it('clicking a color button sets drawHorse.selectedColor to the button id', () => {
      // setupColorChooser is called in window.onload (which runs from setup.ts via __drawHorse)
      // For the TypeScript drawHorse object, call setupColorChooser directly
      drawHorse.setupColorChooser()
      const redButton = document.getElementById('red') as HTMLElement
      redButton.click()
      expect(drawHorse.selectedColor).toBe('red')
    })
  })

  describe('AC1.9: stamp choice click sets selectedStamp', () => {
    it('clicking a stamp choice sets drawHorse.selectedStamp', () => {
      // setupStamps populates #stampchooser — call it on the TypeScript drawHorse
      // Note: stampchooser may already have entries from the eval harness (setup.ts)
      // Clear it first to avoid duplicates
      const stampchooser = document.getElementById('stampchooser')!
      stampchooser.innerHTML = ''
      drawHorse.setupStamps()

      const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser .stampchoice')
      expect(stampChoices.length).toBeGreaterThan(0)
      stampChoices[0].click()
      expect(drawHorse.selectedStamp).toBeDefined()
    })
  })
})
