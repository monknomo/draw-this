// src/tools/stamp/index.ts
import type { Tool } from '../../types'
import { drawHorse } from '../../drawHorse'
import { playSound } from '../../sounds'
import { colorizeStamp } from './colorize'
import { SIZE_DEFAULT } from '../../sizeControl'

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
    // Map brushSize to stamp pixel dimensions: stampPx = brushSize * 10.
    // At SIZE_DEFAULT (5) this gives 50px, matching the original fixed size.
    // Larger brush => proportionally larger stamp, always centered on the cursor.
    const stampPx = drawHorse.brushSize * (50 / SIZE_DEFAULT)
    const halfStamp = stampPx / 2
    const img = new Image(stampPx, stampPx)
    img.src =
      'data:image/svg+xml;base64,' +
      colorizeStamp(drawHorse.selectedStamp!.url, drawHorse.selectedColor)
    img.onload = function () {
      drawHorse.ctx.drawImage(img, drawHorse.pos.x - halfStamp, drawHorse.pos.y - halfStamp, stampPx, stampPx)
    }
  },

  stopDrawing(_e) {},
}
