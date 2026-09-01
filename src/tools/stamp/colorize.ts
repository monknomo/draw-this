// src/tools/stamp/colorize.ts
import { DEFAULT_PALETTE } from '../../palettes'

// Build evenly-spaced gradient stops from an ordered palette. The gradient SHAPE
// is unchanged (a horizontal linear gradient across the stamp); only the color
// SOURCE moved to the active palette. Offsets are recomputed from array length as
// i/(n-1)*100% so any palette size produces valid stops.
export function buildRainbowStops(colors: string[]): string {
  const n = colors.length
  return colors
    .map((color, i) => {
      const offset = n > 1 ? (i / (n - 1)) * 100 : 0
      return `<stop offset="${offset}%" stop-color="${color}"/>`
    })
    .join('')
}

function buildDefs(svg: string, color: string, rainbowColors: string[]): string {
  if (color === 'rainbow') {
    const vbMatch = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+)/)
    const vbW = vbMatch ? parseFloat(vbMatch[1]) : 512
    const stops = buildRainbowStops(rainbowColors)
    return `<defs><linearGradient id="sc" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${vbW}" y2="0">${stops}</linearGradient></defs>`
  }
  return `<defs><linearGradient id="sc"><stop stop-color="${color}"/></linearGradient></defs>`
}

// rainbowColors defaults to the default palette so this stays testable in isolation
// (no drawHorse import). Callers thread the ACTIVE palette's colors through.
export function colorizeStamp(
  base64Svg: string,
  color: string,
  rainbowColors: string[] = DEFAULT_PALETTE.colors
): string {
  const svg = window.atob(base64Svg)
  const defs = buildDefs(svg, color, rainbowColors)
  return window.btoa(svg.replace(/(<svg[^>]*>)/, `$1${defs}`))
}
