import { describe, it, expect } from 'vitest'

declare const __tools: Record<string, any>

const TOOL_NAMES = ['pencil', 'drips', 'stamp', 'bubbles', 'eraser', 'oops', 'nuke', 'bucket']

describe('Tool plugin interface contract', () => {
  describe('AC3.1: every tool has draw, stopDrawing, and onclick functions', () => {
    it.each(TOOL_NAMES)('%s has draw, stopDrawing, and onclick functions', (name) => {
      const tool = __tools[name]
      expect(typeof tool.draw).toBe('function')
      expect(typeof tool.stopDrawing).toBe('function')
      expect(typeof tool.onclick).toBe('function')
    })
  })

  describe('AC3.2: every tool has drawsImmediately and selectable booleans', () => {
    it.each(TOOL_NAMES)('%s has drawsImmediately and selectable booleans', (name) => {
      const tool = __tools[name]
      expect(typeof tool.drawsImmediately).toBe('boolean')
      expect(typeof tool.selectable).toBe('boolean')
    })
  })

  describe('AC3.3: oops and nuke have selectable = false', () => {
    it('oops.selectable is false', () => {
      expect(__tools.oops.selectable).toBe(false)
    })
    it('nuke.selectable is false', () => {
      expect(__tools.nuke.selectable).toBe(false)
    })
  })

  describe('AC3.4: stamp and bubbles have drawsImmediately = true', () => {
    it('stamp.drawsImmediately is true', () => {
      expect(__tools.stamp.drawsImmediately).toBe(true)
    })
    it('bubbles.drawsImmediately is true', () => {
      expect(__tools.bubbles.drawsImmediately).toBe(true)
    })
  })
})
