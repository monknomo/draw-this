// src/test/save.test.ts
import { saveCanvas } from '../save'

describe('saveCanvas', () => {
  it('triggers a JPEG download with a timestamped filename', () => {
    const canvas = document.createElement('canvas')

    const anchor = document.createElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {})
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValueOnce(anchor as any)

    saveCanvas(canvas)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(anchor.href).toMatch(/^data:image\/jpeg/)
    expect(anchor.download).toMatch(/^screenshot-\d+\.jpg$/)
    expect(clickSpy).toHaveBeenCalledOnce()

    createElementSpy.mockRestore()
  })
})
