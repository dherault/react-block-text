import type { EditorRefRegistry, SelectionRectData } from '../types'

import findParentWithId from './findParentWithId'

// Lookup the ids under the given selectionRect
function findSelectionRectIds(editorRefs: EditorRefRegistry, selectionRect: SelectionRectData): string[] {
  if (selectionRect.width === 0 || selectionRect.height === 0) return []

  const ids: string[] = []

  Object.entries(editorRefs).forEach(([id, editorRef]) => {
    if (!editorRef) return

    const blockElement = findParentWithId(editorRef.editorContainer!, id)

    if (!blockElement) return
    if (
      selectionRect.left + selectionRect.width < blockElement.offsetLeft
      || selectionRect.left > blockElement.offsetLeft + blockElement.offsetWidth
      || selectionRect.top + selectionRect.height < blockElement.offsetTop
      || selectionRect.top > blockElement.offsetTop + blockElement.offsetHeight
    ) {
      return
    }

    ids.push(id)
  })

  return ids
}

export default findSelectionRectIds
