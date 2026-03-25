// src/tools/oops.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

export const oops: Tool = {
  name: 'oops',
  button: document.getElementById('oops') as HTMLElement,
  drawsImmediately: false,
  selectable: false,

  onclick(_e) {
    playSound('oopsSound')
    const imageData = drawHorse.undoStack.pop()
    if (imageData) {
      drawHorse.ctx.putImageData(imageData, 0, 0)
    }
  },

  draw(_e) {},
  stopDrawing(_e) {},
}
