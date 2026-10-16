// src/test/size-buttons.test.ts
// Runs against the built script.js (see setup.ts), driven through the real DOM.
const dh = () => (globalThis as any).__drawHorse
const click = (id: string) => (document.getElementById(id) as HTMLElement).click()
const btn = (id: string) => document.getElementById(id) as HTMLButtonElement

describe('size +/- buttons', () => {
  beforeEach(() => {
    click('pencil')
    click('red')
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
    expect(dh().brushSize).toBe(6)
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
