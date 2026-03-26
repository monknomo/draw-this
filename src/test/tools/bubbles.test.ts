// src/test/tools/bubbles.test.ts
import { colorizeBubbleSvg } from '../../tools/bubbles'

describe('bubbles color substitution', () => {
  it('colorizeBubbleSvg replaces %%%% placeholder with the given color', () => {
    const source = btoa('<svg><circle stroke="%%%%"/><ellipse fill="%%%%"/></svg>')
    const result = colorizeBubbleSvg(source, 'red')
    expect(atob(result)).toBe('<svg><circle stroke="red"/><ellipse fill="red"/></svg>')
  })
})
