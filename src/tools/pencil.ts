// src/tools/pencil.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

const RAINBOW_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'pink', 'purple']

const settings: ToolSettings & { controls: Array<{ id: string; name: string; onclick: () => void }> } = {
  width: 1,
  controls: [
    { id: 'increase', name: '+', onclick: () => { settings.width!-- } },
    // Known bug preserved: 'decrease' control increments (swapped)
    { id: 'decrease', name: '+', onclick: () => { settings.width!++ } },
  ],
}

export const pencil: Tool = {
  name: 'pencil',
  button: document.getElementById('pencil') as HTMLElement,
  drawsImmediately: false,
  selectable: true,
  settings,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    playSound('pencilSound')
    if (drawHorse.selectedColor === 'rainbow') {
      const oldX = drawHorse.pos.x
      const oldY = drawHorse.pos.y
      drawHorse.setPosition(e)
      const newX = drawHorse.pos.x
      const newY = drawHorse.pos.y

      const angle = Math.atan2(newY - oldY, newX - oldX)
      const perpAngle = angle + Math.PI / 2
      const stripeWidth = settings.width ?? 1
      const cosP = Math.cos(perpAngle)
      const sinP = Math.sin(perpAngle)

      RAINBOW_COLORS.forEach((color, i) => {
        const offset = (i - 3) * stripeWidth
        drawHorse.ctx.beginPath()
        drawHorse.ctx.lineWidth = stripeWidth
        drawHorse.ctx.lineCap = 'round'
        drawHorse.ctx.strokeStyle = color
        drawHorse.ctx.moveTo(oldX + offset * cosP, oldY + offset * sinP)
        drawHorse.ctx.lineTo(newX + offset * cosP, newY + offset * sinP)
        drawHorse.ctx.stroke()
      })
      return
    }

    drawHorse.ctx.beginPath()
    drawHorse.ctx.lineWidth = 5
    drawHorse.ctx.lineCap = 'round'
    drawHorse.ctx.strokeStyle = drawHorse.selectedColor
    drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.setPosition(e)
    drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.ctx.stroke()
  },

  stopDrawing(_e) {
    pauseSound('pencilSound')
  },
}
