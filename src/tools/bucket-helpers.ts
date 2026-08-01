// src/tools/bucket-helpers.ts

export function hexToRgb(hex: string): [number, number, number] {
  const aRgbHex = hex.substring(1).match(/.{1,2}/g)!
  return [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  if (r > 255 || g > 255 || b > 255) throw 'Invalid color component'
  return ((r << 16) | (g << 8) | b).toString(16)
}

export function standardizeColor(str: string): [number, number, number] {
  const colorctx = document.createElement('canvas').getContext('2d')!
  colorctx.fillStyle = str
  return hexToRgb(colorctx.fillStyle)
}

/**
 * Converts any CSS color string to an RGBA array by rendering it to a 1×1 canvas.
 */
export function cssColorToRgba(cssColor: string): [number, number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = cssColor
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2], d[3]]
}

/**
 * Returns true if the pixel at `pos` in `data` matches `startColor` within `maxDiff`
 * (sum of absolute RGB channel differences). Handles transparent pixels correctly.
 */
export function matchStartColorWithTolerance(
  data: Uint8ClampedArray,
  pos: number,
  startColor: [number, number, number, number],
  maxDiff: number
): boolean {
  const a = data[pos + 3]
  if (startColor[3] === 0) return a === 0
  if (a === 0) return false
  return (
    Math.abs(data[pos] - startColor[0]) +
    Math.abs(data[pos + 1] - startColor[1]) +
    Math.abs(data[pos + 2] - startColor[2])
  ) < maxDiff
}

/**
 * Writes `fillRgba` into the pixel at `pos` in `data` with full opacity.
 */
export function colorPixelRgba(
  data: Uint8ClampedArray,
  pos: number,
  fillRgba: [number, number, number, number]
): void {
  data[pos] = fillRgba[0]
  data[pos + 1] = fillRgba[1]
  data[pos + 2] = fillRgba[2]
  data[pos + 3] = 255
}
