// src/tools/stamp/colorize.ts
const RAINBOW_STOPS = [
  { offset: '0%', color: 'red' },
  { offset: '16.7%', color: 'orange' },
  { offset: '33.3%', color: 'yellow' },
  { offset: '50%', color: 'green' },
  { offset: '66.7%', color: 'blue' },
  { offset: '83.3%', color: 'hotpink' },
  { offset: '100%', color: 'purple' },
]

function buildDefs(svg: string, color: string): string {
  if (color === 'rainbow') {
    const vbMatch = svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+)/)
    const vbW = vbMatch ? parseFloat(vbMatch[1]) : 512
    const stops = RAINBOW_STOPS.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('')
    return `<defs><linearGradient id="sc" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${vbW}" y2="0">${stops}</linearGradient></defs>`
  }
  return `<defs><linearGradient id="sc"><stop stop-color="${color}"/></linearGradient></defs>`
}

export function colorizeStamp(base64Svg: string, color: string): string {
  const svg = window.atob(base64Svg)
  const defs = buildDefs(svg, color)
  return window.btoa(svg.replace(/(<svg[^>]*>)/, `$1${defs}`))
}
