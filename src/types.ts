// src/types.ts

export interface ToolSettings {
  width?: number
  size?: number
  sizeVariation?: number
  maxNumberBubbles?: number
}

export interface Tool {
  name: string
  button: HTMLElement
  selectable: boolean
  drawsImmediately: boolean
  onclick: (e: Event) => void
  draw: (e: MouseEvent | TouchEvent) => void
  stopDrawing: (e: MouseEvent | TouchEvent) => void
  settings?: ToolSettings
}

export interface Stamp {
  id: string
  name: string
  url: string  // base64-encoded SVG with %%%% as fill color placeholder
}
