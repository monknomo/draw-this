// src/tools/pencil.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

const settings: ToolSettings & { controls: Array<{ id: string; name: string; onclick: () => void }> } = {
  width: 5,
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
