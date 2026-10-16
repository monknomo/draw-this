// src/test/size-buttons.test.ts
// Runs against the built script.js (see setup.ts), driven through the real DOM.
const dh = () => (globalThis as any).__drawHorse
const click = (id: string) => (document.getElementById(id) as HTMLElement).click()
const btn = (id: string) => document.getElementById(id) as HTMLButtonElement

describe('size +/- buttons', () => {
  beforeEach(() => {
    click('pencil')
    click('red')
    dh().brushSize = 5  // size persists across tools now, so pin it per test
  })

  it('do not change the selected colour', () => {
    expect(dh().selectedColor).toBe('red')
    click('size-increase')
    expect(dh().selectedColor).toBe('red')
    click('size-decrease')
    expect(dh().selectedColor).toBe('red')
  })

  it('do not change the selected colour when rainbow is active', () => {
    click('rainbow')
    click('size-increase')
    expect(dh().selectedColor).toBe('rainbow')
  })

  it('change brush size', () => {
    expect(dh().brushSize).toBe(5)
    click('size-increase')
    expect(dh().brushSize).toBe(10)
  })

  it('are not styled or registered as colour choices', () => {
    expect(btn('size-increase').classList.contains('colorChoice')).toBe(false)
    expect(btn('size-decrease').classList.contains('colorChoice')).toBe(false)
  })
})

describe('size buttons enabled state', () => {
  it.each(['pencil', 'drips', 'stamp', 'eraser'])('enabled for %s', (tool) => {
    click(tool)
    expect(btn('size-increase').disabled).toBe(false)
    expect(btn('size-decrease').disabled).toBe(false)
  })

  it.each(['bubbles', 'bucket'])('disabled for %s (ignores size)', (tool) => {
    click('pencil')
    click(tool)
    expect(btn('size-increase').disabled).toBe(true)
    expect(btn('size-decrease').disabled).toBe(true)
  })

  it('re-enables when switching back to a size-aware tool', () => {
    click('bubbles')
    click('pencil')
    expect(btn('size-increase').disabled).toBe(false)
  })
})

describe('size persistence', () => {
  it('keeps the chosen size when switching tools', () => {
    click('pencil')
    dh().brushSize = 5
    click('size-increase')
    click('size-increase')
    expect(dh().brushSize).toBe(20)
    click('eraser')
    expect(dh().brushSize).toBe(20)
    click('bubbles')
    expect(dh().brushSize).toBe(20)
    click('stamp')
    expect(dh().brushSize).toBe(20)
  })
})

describe('size feedback', () => {
  const preview = () => document.getElementById('size-preview') as HTMLElement
  const dot = () => document.getElementById('size-dot') as HTMLElement

  beforeEach(() => {
    click('pencil')
    dh().brushSize = 5
    dh().updateSizeControls()
  })

  it('preview reflects the current size and grows with it', () => {
    const before = parseInt(dot().style.width)
    click('size-increase')
    expect(preview().dataset.size).toBe('10')
    expect(preview().title).toBe('Size 10')
    expect(parseInt(dot().style.width)).toBeGreaterThan(before)
  })

  it('pops the dot when the size changes', () => {
    click('size-increase')
    expect(dot().classList.contains('pop')).toBe(true)
    expect(dot().classList.contains('nudge')).toBe(false)
  })

  it('nudges instead of popping when a limit is hit', () => {
    dh().brushSize = 1
    dh().updateSizeControls()
    click('size-decrease')
    expect(dh().brushSize).toBe(1)
    expect(dot().classList.contains('nudge')).toBe(true)
  })

  it('dims the preview for tools that ignore size', () => {
    click('bubbles')
    expect(preview().classList.contains('disabled')).toBe(true)
    click('pencil')
    expect(preview().classList.contains('disabled')).toBe(false)
  })
})
