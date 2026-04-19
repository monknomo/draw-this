// src/tools/drips.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

const RAINBOW_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'purple']
let rainbowIndex = 0

// Exported for testing — verifies AC4.1 and AC4.2 in import-based tests
export function getDripSize(): number {
  let size = 0
  if (Math.random() < 0.5) {
    if (Math.random() < 0.9) {
      size = Math.floor(Math.random() * 10)
    } else {
      size = Math.floor(Math.random() * 10 + 15)
    }
    if (size < 6) {
      size = 0
    }
  }
  return size
}

export const drips: Tool & { getDripSize: () => number } = {
  name: 'drips',
  button: document.getElementById('drips') as HTMLElement,
  drawsImmediately: false,
  selectable: true,
  settings: { width: 5 },

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    playSound('drippingSound')
    drawHorse.setPosition(e)
    const color = drawHorse.selectedColor === 'rainbow'
      ? RAINBOW_COLORS[rainbowIndex++ % RAINBOW_COLORS.length]
      : drawHorse.selectedColor
    drawHorse.ctx.fillStyle = color
    drawHorse.ctx.beginPath()
    drawHorse.ctx.arc(
      drawHorse.pos.x,
      drawHorse.pos.y,
      this.getDripSize(),
      0,
      Math.PI * 2,
      true
    )
    drawHorse.ctx.closePath()
    drawHorse.ctx.fill()
  },

  stopDrawing(_e) {
    pauseSound('drippingSound')
  },

  getDripSize,
}
