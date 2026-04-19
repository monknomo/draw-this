// src/tools/stamp/index.ts
import type { Tool } from '../../types'
import { drawHorse } from '../../drawHorse'
import { playSound } from '../../sounds'
import { colorizeStamp } from './colorize'

export const stamp: Tool = {
  name: 'stamp',
  button: document.getElementById('stamp') as HTMLElement,
  drawsImmediately: true,
  selectable: true,
  settings: { width: 5 },

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showStampSelectors()
    drawHorse.showColorSelectors()
  },

  draw(_e) {
    playSound('stampSound')
    const img = new Image(50, 50)
    img.src =
      'data:image/svg+xml;base64,' +
      colorizeStamp(drawHorse.selectedStamp!.url, drawHorse.selectedColor)
    img.onload = function () {
      drawHorse.ctx.drawImage(img, drawHorse.pos.x - 25, drawHorse.pos.y - 25, 50, 50)
    }
  },

  stopDrawing(_e) {},
}
