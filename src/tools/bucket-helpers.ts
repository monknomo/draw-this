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

export function matchStartColor(
  pixelPos: number,
  colorLayer: ImageData,
  startColor: [number, number, number]
): boolean {
  const r = colorLayer.data[pixelPos]
  const g = colorLayer.data[pixelPos + 1]
  const b = colorLayer.data[pixelPos + 2]
  return r === startColor[0] && g === startColor[1] && b === startColor[2]
}

export function colorPixel(
  pixelPos: number,
  colorLayer: ImageData,
  _fillColor: string  // Known bug preserved: fillColor is intentionally unused
): void {
  // Known bug from script.js: hardcodes [100, 1, 2] instead of parsing _fillColor.
  // The bucket button is commented out in index.html until this is fixed (tracked separately).
  const color = [100, 1, 2]
  colorLayer.data[pixelPos] = color[0]
  colorLayer.data[pixelPos + 1] = color[1]
  colorLayer.data[pixelPos + 2] = color[2]
  colorLayer.data[pixelPos + 3] = 255
}
