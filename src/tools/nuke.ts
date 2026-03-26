// src/tools/nuke.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

export const nuke: Tool = {
  name: 'nuke',
  button: document.getElementById('nuke') as HTMLElement,
  drawsImmediately: false,
  selectable: false,

  onclick(_e) {
    playSound('tornadoSound')
    drawHorse.ctx.clearRect(
      0,
      0,
      drawHorse.ctx.canvas.width,
      drawHorse.ctx.canvas.height
    )
  },

  draw(_e) {},
  stopDrawing(_e) {},
}
