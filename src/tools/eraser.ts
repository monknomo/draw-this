// src/tools/eraser.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

const settings: ToolSettings & { controls: Array<{ id: string; name: string; onclick: () => void }> } = {
  width: 5,
  controls: [
    { id: 'increase', name: '+', onclick: () => { settings.width!-- } },
    { id: 'decrease', name: '+', onclick: () => { settings.width!++ } },
  ],
}

export const eraser: Tool = {
  name: 'eraser',
  button: document.getElementById('eraser') as HTMLElement,
  drawsImmediately: false,
  selectable: true,
  settings,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    playSound('eraserSound')
    drawHorse.ctx.beginPath()
    drawHorse.ctx.lineWidth = 5
    drawHorse.ctx.lineCap = 'round'
    drawHorse.ctx.strokeStyle = 'white'  // Eraser is white-only (known limitation)
    drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.setPosition(e)
    drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.ctx.stroke()
    console.log(drawHorse.ctx)  // Preserved from original script.js
  },

  stopDrawing(_e) {
    pauseSound('eraserSound')
  },
}
