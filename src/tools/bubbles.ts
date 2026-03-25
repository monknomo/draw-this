// src/tools/bubbles.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

const BUBBLE_URL_1 =
  'https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble.svg?v=1652888646403'
const BUBBLE_URL_2 =
  'https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble2.svg?v=1652888650037'
const BUBBLE_URL_3 =
  'https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble3.svg?v=1652888653363'

const settings: ToolSettings = {
  size: 35,
  sizeVariation: 15,
  maxNumberBubbles: 30,
}

export const bubbles: Tool = {
  name: 'bubbles',
  button: document.getElementById('bubbles') as HTMLElement,
  drawsImmediately: true,
  selectable: true,
  settings,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(_e) {
    const totalBubbles = Math.floor(Math.random() * settings.maxNumberBubbles!)
    for (let i = 0; i < totalBubbles; i++) {
      const img = new Image(settings.size, settings.size)
      const bubbleChoice = Math.random()
      img.src =
        bubbleChoice < 0.33
          ? BUBBLE_URL_1
          : bubbleChoice < 0.5
          ? BUBBLE_URL_2
          : BUBBLE_URL_3

      const positive = Math.floor(Math.random() * 2) % 2 === 0 ? -1 : 1
      const xOffset = positive * Math.floor(Math.random() * (i * settings.size!))
      const yOffset = Math.floor(Math.random() * (i * settings.size!))
      const bubbleSizeSign = Math.floor(Math.random() * 2) % 2 === 0 ? -1 : 1
      const bubbleSize = Math.floor(
        settings.size! + bubbleSizeSign * Math.floor(Math.random() * settings.sizeVariation!)
      )

      img.onload = function () {
        drawHorse.ctx.drawImage(
          img,
          drawHorse.pos.x - settings.size! / 2 + xOffset,
          drawHorse.pos.y - settings.size! / 2 - yOffset,
          bubbleSize,
          bubbleSize
        )
      }
    }
  },

  stopDrawing(_e) {},
}
