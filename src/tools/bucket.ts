// src/tools/bucket.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'
import {
  cssColorToRgba,
  matchExact,
  colorPixelRgba,
} from './bucket-helpers'

// How many pixels of fill to bleed into the antialiased boundary after the
// exact-match fill completes. Canvas2D always antialiases strokes, so an
// exact-match fill stops one ring short of the solid stroke core and leaves a
// thin unfilled fringe (issue #24). A small bleed swallows that fringe. Because
// the solid stroke core sits *behind* its own antialiased ring, bleeding a
// pixel or two fills the fringe without crossing the stroke.
// Configurable so we can tune the feel; 0 = stop exactly, never touch the fringe.
const EDGE_BLEED = 1

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

    // Early exit: clicked pixel is already exactly the fill color.
    if (matchExact(data, pixelPos, fillRgba)) return

    // `visited` doubles as the record of which pixels are in the filled region,
    // which the edge-bleed pass reads below.
    const stack: [number, number][] = [[x, y]]
    const visited = new Uint8Array(width * height)

    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop()!
      const initialIndex = currentY * width + currentX
      if (visited[initialIndex] || !matchExact(data, initialIndex * 4, startColor)) continue

      // Scan left to find the start of this horizontal span.
      let leftX = currentX
      while (leftX > 0 && matchExact(data, (currentY * width + leftX - 1) * 4, startColor)) {
        leftX--
      }

      // Scan right to find the end of this horizontal span.
      let rightX = currentX
      while (rightX < width - 1 && matchExact(data, (currentY * width + rightX + 1) * 4, startColor)) {
        rightX++
      }

      // Fill the span and queue unvisited matching pixels in rows above/below.
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
          if (!visited[aboveIndex] && matchExact(data, aboveIndex * 4, startColor)) {
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
          if (!visited[belowIndex] && matchExact(data, belowIndex * 4, startColor)) {
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

    // Edge bleed: grow the filled region by EDGE_BLEED pixels into the
    // antialiased fringe so no thin unfilled ring remains next to strokes.
    // Each pass collects the current one-pixel boundary of the filled region,
    // then fills it — collecting before filling keeps a pass from chaining
    // deeper than one ring, so the bleed can't run away into the stroke core.
    for (let pass = 0; pass < EDGE_BLEED; pass++) {
      const edge: number[] = []
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const idx = py * width + px
          if (visited[idx]) continue
          const touchesFilled =
            (py > 0 && visited[idx - width]) ||
            (py < height - 1 && visited[idx + width]) ||
            (px > 0 && visited[idx - 1]) ||
            (px < width - 1 && visited[idx + 1])
          if (touchesFilled) edge.push(idx)
        }
      }
      for (const idx of edge) {
        colorPixelRgba(data, idx * 4, fillRgba)
        visited[idx] = 1
      }
    }

    ctx.putImageData(imageData, 0, 0)
  },

  stopDrawing(_e) {},
}
