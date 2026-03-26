// src/tools/bubbles.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

// Bubble SVGs: circle+highlight design with %%%% color placeholder (upper-left, upper-right, top-center)
const BUBBLE_BASE64_1 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUyIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIlJSUlIiBzdHJva2Utd2lkdGg9IjUiLz48ZWxsaXBzZSBjeD0iMzYiIGN5PSIyOCIgcng9IjExIiByeT0iNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTM1IDM2IDI4KSIgZmlsbD0iJSUlJSIvPjwvc3ZnPg=='
const BUBBLE_BASE64_2 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUyIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIlJSUlIiBzdHJva2Utd2lkdGg9IjUiLz48ZWxsaXBzZSBjeD0iNjQiIGN5PSIyOCIgcng9IjExIiByeT0iNiIgdHJhbnNmb3JtPSJyb3RhdGUoMzUgNjQgMjgpIiBmaWxsPSIlJSUlIi8+PC9zdmc+'
const BUBBLE_BASE64_3 =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUyIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIlJSUlIiBzdHJva2Utd2lkdGg9IjUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSIyMCIgcng9IjEyIiByeT0iNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTEwIDUwIDIwKSIgZmlsbD0iJSUlJSIvPjwvc3ZnPg=='

export function colorizeBubbleSvg(base64: string, color: string): string {
  return window.btoa(window.atob(base64).replaceAll('%%%%', color))
}

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
      const base64 =
        bubbleChoice < 0.33
          ? BUBBLE_BASE64_1
          : bubbleChoice < 0.5
          ? BUBBLE_BASE64_2
          : BUBBLE_BASE64_3
      img.src = 'data:image/svg+xml;base64,' + colorizeBubbleSvg(base64, drawHorse.selectedColor)

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
