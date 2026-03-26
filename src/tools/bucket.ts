// src/tools/bucket.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'
import {
  cssColorToRgba,
  matchStartColorWithTolerance,
  colorPixelRgba,
} from './bucket-helpers'

const DEFAULT_TOLERANCE = 0.15
const MATCH_MAX_DIFF = 255 * 3 * DEFAULT_TOLERANCE

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
    drawHorse.setPosition(e)
    const { ctx } = drawHorse
    const { width, height } = ctx.canvas
    const x = Math.floor(drawHorse.pos.x)
    const y = Math.floor(drawHorse.pos.y)

    if (x < 0 || x >= width || y < 0 || y >= height) return

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const pixelPos = (y * width + x) * 4
    const startColor: [number, number, number, number] = [
      data[pixelPos],
      data[pixelPos + 1],
      data[pixelPos + 2],
      data[pixelPos + 3],
    ]

    const fillRgba = cssColorToRgba(drawHorse.selectedColor)

    // Early exit: clicked pixel is already the fill color
    if (matchStartColorWithTolerance(data, pixelPos, fillRgba, 255 * 3 * 0.05)) return

    const stack: [number, number][] = [[x, y]]
    const visited = new Uint8Array(width * height)

    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop()!
      const initialIndex = currentY * width + currentX
      if (visited[initialIndex] || !matchStartColorWithTolerance(data, initialIndex * 4, startColor, MATCH_MAX_DIFF)) continue

      // Scan left to find the start of this horizontal span
      let leftX = currentX
      while (leftX > 0 && matchStartColorWithTolerance(data, (currentY * width + leftX - 1) * 4, startColor, MATCH_MAX_DIFF)) {
        leftX--
      }

      // Scan right to find the end of this horizontal span
      let rightX = currentX
      while (rightX < width - 1 && matchStartColorWithTolerance(data, (currentY * width + rightX + 1) * 4, startColor, MATCH_MAX_DIFF)) {
        rightX++
      }

      // Fill the span and queue unvisited matching pixels in rows above/below
      let spanAddedAbove = false
      let spanAddedBelow = false
      const aboveY = currentY - 1
      const belowY = currentY + 1

      for (let scanX = leftX; scanX <= rightX; scanX++) {
        const index = currentY * width + scanX
        colorPixelRgba(data, index * 4, fillRgba)
        visited[index] = 1

        if (aboveY >= 0) {
          const aboveIndex = aboveY * width + scanX
          if (!visited[aboveIndex] && matchStartColorWithTolerance(data, aboveIndex * 4, startColor, MATCH_MAX_DIFF)) {
            if (!spanAddedAbove) {
              stack.push([scanX, aboveY])
              spanAddedAbove = true
            }
          } else {
            spanAddedAbove = false
          }
        }

        if (belowY < height) {
          const belowIndex = belowY * width + scanX
          if (!visited[belowIndex] && matchStartColorWithTolerance(data, belowIndex * 4, startColor, MATCH_MAX_DIFF)) {
            if (!spanAddedBelow) {
              stack.push([scanX, belowY])
              spanAddedBelow = true
            }
          } else {
            spanAddedBelow = false
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  },

  stopDrawing(_e) {},
}
