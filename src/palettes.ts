// src/palettes.ts
//
// Swappable color palettes. This module has NO imports on purpose: it is the
// single source of truth for palette data and must be safe to import anywhere
// (including tools) without tripping the tools ↔ drawHorse circular-import trap.
//
// A Palette is 7 ordered chromatic colors. The ORDER is meaningful — it is the
// source for every rainbow mode (pencil stripes, drip cycling, stamp gradient,
// bubble slices). `black` and `white` are shared neutrals shown on every
// palette; `accentNeutral` is a required per-palette extra ("brown" slot). Because it
// is required, every palette offers the same number of swatches (7 + 2 + 1 = 10), so the
// color column keeps its height and the palette arrows never jump when cycling.

export interface Palette {
  name: string           // display name + stable key, e.g. 'Classic'
  colors: string[]       // exactly 7 ordered CSS colors — the rainbow source
  accentNeutral: string  // required per-palette extra neutral ("brown" slot)
}

export const PALETTES: Palette[] = [
  {
    name: 'Classic',
    colors: ['red', 'orange', 'yellow', 'green', 'blue', 'violet', 'purple'],
    accentNeutral: 'saddlebrown',
  },
  {
    name: 'Pastel',
    colors: ['#ffb3c6', '#ffd9b3', '#fff2b3', '#b3ffcc', '#b3e0ff', '#d9b3ff', '#e0b3d9'],
    accentNeutral: '#d2b48c', // tan
  },
  {
    name: 'Grayscale',
    // Intentionally avoids pure #000/#fff so it doesn't duplicate the shared neutrals.
    colors: ['#f2f2f2', '#cccccc', '#a6a6a6', '#808080', '#595959', '#404040', '#1a1a1a'],
    accentNeutral: '#704214', // sepia, the monochrome-photo tone
  },
  {
    name: 'Neon',
    colors: ['#ff2d95', '#ff5e00', '#ccff00', '#39ff14', '#00e5ff', '#2d5cff', '#c400ff'],
    accentNeutral: '#26215c', // midnight indigo
  },
]

export const SHARED_NEUTRALS = ['black', 'white'] as const

export const DEFAULT_PALETTE = PALETTES[0]

// Every color a palette offers as a swatch, in display order (the rainbow swatch is
// separate: it is always present and is not a color). Single source of truth for
// both swatch rendering and "is this color still available after a palette swap?".
export function swatchColors(palette: Palette): string[] {
  return [...palette.colors, ...SHARED_NEUTRALS, palette.accentNeutral]
}

// Ring-buffer step through PALETTES: +1 is next, -1 is previous, and both wrap, so the
// last palette's next is the first and the first palette's previous is the last.
// A palette that isn't in the list (shouldn't happen) is treated as the default.
export function cyclePalette(current: Palette, step: 1 | -1): Palette {
  const n = PALETTES.length
  const found = PALETTES.findIndex(p => p.name === current.name)
  const i = found === -1 ? PALETTES.indexOf(DEFAULT_PALETTE) : found
  return PALETTES[(i + step + n) % n]
}
