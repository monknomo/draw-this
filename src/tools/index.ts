// src/tools/index.ts
import type { Tool } from '../types'
import { pencil } from './pencil'
import { drips } from './drips'
import { stamp } from './stamp/index'
import { bubbles } from './bubbles'
import { eraser } from './eraser'
import { oops } from './oops'
import { nuke } from './nuke'
import { bucket } from './bucket'

export const tools: Record<string, Tool> = {
  pencil,
  drips,
  stamp,
  bubbles,
  eraser,
  oops,
  nuke,
  bucket,
}
