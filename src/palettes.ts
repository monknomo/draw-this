// src/palettes.ts
//
// Swappable color palettes. This module has NO imports on purpose: it is the
// single source of truth for palette data and must be safe to import anywhere
// (including tools) without tripping the tools ↔ drawHorse circular-import trap.
//
// A Palette is 7 ordered chromatic colors. The ORDER is meaningful — it is the
// source for every rainbow mode (pencil stripes, drip cycling, stamp gradient,
// bubble slices). `black` and `white` are shared neutrals shown on every
// palette; `accentNeutral` is an optional per-palette extra ("brown" slot).

export interface Palette {
  name: string           // display name + stable key, e.g. 'Classic'
  colors: string[]       // exactly 7 ordered CSS colors — the rainbow source
  accentNeutral?: string // optional per-palette extra neutral ("brown" slot)
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
  },
  {
    name: 'Neon',
    colors: ['#ff2d95', '#ff5e00', '#ccff00', '#39ff14', '#00e5ff', '#2d5cff', '#c400ff'],
  },
]

export const SHARED_NEUTRALS = ['black', 'white'] as const

export const DEFAULT_PALETTE = PALETTES[0]
