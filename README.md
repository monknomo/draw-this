# draw-this

An HTML5 canvas drawing toy. Pick a tool, pick a color, make a mess.

## Running

```bash
npm install   # first time only
npm run dev   # start dev server at http://localhost:3000
```

The dev server watches TypeScript source and reloads the browser automatically on any change to `src/`, `style.css`, or `index.html`.

## Other commands

- `npm run build` — compile TypeScript to `script.js` (production)
- `npm run watch` — watch and rebuild without starting a server
- `npm run test` — run tests
- `npm run check` — run tests + type-check
- `npm run typecheck` — type-check only (no output files)

## Architecture

The source lives in `src/`. TypeScript is compiled by esbuild into `script.js` — a build artifact you should never edit directly. The non-tool modules are `main.ts` (entry point and `window.onload` init), `drawHorse.ts` (application state and event routing), `stamps.ts` (stamp data), `sounds.ts` (audio helpers), and `types.ts` (shared interfaces). Tools each get their own file in `src/tools/` and are re-exported through `src/tools/index.ts` as a flat `Record<string, Tool>`.

### The tool plugin system

The central design is that `tools` is a **plugin registry** — a plain object where every key is a tool name and every value implements the same `Tool` interface. Adding a new tool means writing a module in `src/tools/`, exporting it from `src/tools/index.ts`, and dropping a `<button id="your-tool" class="control tool">` into `index.html`. The event wiring picks it up automatically.

The `Tool` interface (from `src/types.ts`):

```typescript
interface Tool {
  name: string
  button: HTMLElement
  selectable: boolean       // false = one-shot action (oops, nuke)
  drawsImmediately: boolean // true = fires on click; false = fires on drag
  onclick: (e: Event) => void
  draw: (e: MouseEvent | TouchEvent) => void
  stopDrawing: (e: MouseEvent | TouchEvent) => void
  settings?: ToolSettings
}
```

`drawHorse` is the event host — it registers all mouse and touch listeners once and routes them to whichever tool is currently active. Tools never register their own listeners.

| Tool | What it does |
|---|---|
| `pencil` | Freehand stroke |
| `drips` | Filled circles of random radius |
| `stamp` | Drops a 50×50 colored SVG at the click point |
| `bubbles` | Scatters 0–30 bubble SVGs around the click point |
| `eraser` | Paints white strokes over everything |
| `oops` | Pops the undo stack and restores the previous canvas state |
| `nuke` | Clears everything |
| `bucket` | Scanline flood fill (button hidden pending a color fix) |

### `drawHorse` and `DrawHorseContext`

`drawHorse` is the single object that owns all application state: the canvas context, the active tool, selected color, undo stack, cursor position, and a handful of UI helpers (`showStampSelectors`, `hideStampSelectors`, `showColorSelectors`). It lives in `src/drawHorse.ts`.

Tools only need a slice of that. The `DrawHorseContext` interface in `src/types.ts` defines exactly that subset — the properties a tool is allowed to reach for. This keeps the boundary between tool code and host code explicit: tools import the interface from `types.ts` without coupling to the full `drawHorse` module. In practice every tool calls `drawHorse.ctx` to draw, reads `drawHorse.pos` and `drawHorse.selectedColor`, and calls `drawHorse.setPosition(e)` to update the cursor during a drag.

### Stamp color substitution

Stamp SVGs are stored as base64-encoded strings with `%%%%` as a fill color placeholder. When a stamp is rendered, the app decodes the base64, does a `replaceAll('%%%%', "style='fill:COLOR;stroke:COLOR;'")`, re-encodes to base64, builds a `data:image/svg+xml;base64,…` URI, and hands it to `ctx.drawImage`. The same pipeline runs in `setupStamps()` to colorize the stamp-picker thumbnails in the footer.

### Sound

`playSound(id)` and `pauseSound(id)` in `src/sounds.ts` look up `<audio>` elements by DOM id. Continuous sounds (pencil scratching, drips) are started in `tool.draw()` and stopped in `tool.stopDrawing()`. One-shot sounds (click, stamp) fire in `tool.onclick()`.
