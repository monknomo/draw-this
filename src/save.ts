// src/save.ts
export function saveCanvas(canvas: HTMLCanvasElement): void {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `screenshot-${Date.now()}.jpg`
  a.click()
}
