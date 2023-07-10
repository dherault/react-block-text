import type { EditorRefRegistry } from '../types'

function forceContentFocus(editorRefs: EditorRefRegistry, id: string) {
  if (!editorRefs[id]) return
  if (editorRefs[id]?.editorContainer?.contains(document.activeElement)) return

  editorRefs[id]?.focus()
}

export default forceContentFocus
