// src/tools/bucket.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'
import {
  hexToRgb,
  rgbToHex,
  matchStartColor,
  colorPixel,
} from './bucket-helpers'

export const bucket: Tool = {
  name: 'bucket',
  button: document.getElementById('bucket') as HTMLElement,
  drawsImmediately: true,
  selectable: true,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    console.log('start')
    const { ctx } = drawHorse
    const { width, height } = ctx.canvas

    const outlineData = ctx.getImageData(0, 0, width, height)
    ctx.clearRect(0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)

    drawHorse.setPosition(e)

    const startColor: [number, number, number] = [
      outlineData.data[0],
      outlineData.data[1],
      outlineData.data[2],
    ]
    const startColorHex =
      '#' +
      ('000000' + rgbToHex(outlineData.data[0], outlineData.data[1], outlineData.data[2])).slice(-6)
    void startColorHex  // used indirectly via standardizeColor in original — preserved for parity

    const pixelStack: [number, number][] = [[drawHorse.pos.x, drawHorse.pos.y]]

    while (pixelStack.length) {
      const newPos = pixelStack.pop()!
      let x = newPos[0]
      let y = newPos[1]
      let pixelPos = (y * width + x) * 4

      while (y-- >= 0 && matchStartColor(pixelPos, outlineData, startColor)) {
        pixelPos -= width * 4
      }
      pixelPos += width * 4
      ++y

      let reachLeft = false
      let reachRight = false

      while (y++ < height - 1 && matchStartColor(pixelPos, outlineData, startColor)) {
        colorPixel(pixelPos, imageData, drawHorse.selectedColor)

        if (x > 0) {
          if (matchStartColor(pixelPos - 4, outlineData, startColor)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y])
              reachLeft = true
            }
          } else if (reachLeft) {
            reachLeft = false
          }
        }

        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4, imageData, startColor)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y])
              reachRight = true
            }
          } else if (reachRight) {
            reachRight = false
          }
        }

        pixelPos += width * 4
      }
    }

    ctx.putImageData(imageData, 0, 0)
    ctx.putImageData(outlineData, 0, 0)
    console.log('finis')
  },

  stopDrawing(_e) {},
}
