import type { ContextMenuData, EditorRefRegistry } from '../types'

import { CONTEXT_MENU_HEIGHT } from '../constants'

// Get the context menu position based on the current selection
function getContextMenuData(editorRefs: EditorRefRegistry, id: string, rootElement: HTMLElement): ContextMenuData | null {
  const range = window.getSelection()?.getRangeAt(0)?.cloneRange()

  if (!range) return null

  range.collapse(true)

  const rects = range.getClientRects()
  const rootRect = rootElement.getBoundingClientRect()

  if (rects.length) {
    return {
      id,
      query: '',
      left: rects[0].right - rootRect.left - 6,
      ...getContextMenuYPosition(rects[0], rootRect, rootElement.offsetTop, false),
    }
  }

  const editorRef = editorRefs[id]

  if (!editorRef) return null

  const editorRects = editorRef.editorContainer?.getClientRects()

  if (!editorRects?.length) return null

  return {
    id,
    query: '',
    left: editorRects[0].left - rootRect.left - 2,
    ...getContextMenuYPosition(editorRects[0], rootRect, rootElement.offsetTop, true),
  }
}

function getContextMenuYPosition(rect: DOMRectReadOnly, rootRect: DOMRect, rootOffsetTop: number, isEditorRect: boolean) {
  const top = (isEditorRect ? rect.top + 24 : rect.bottom + 4) - rootRect.top

  if (top + rootOffsetTop + CONTEXT_MENU_HEIGHT < window.innerHeight) return { top }

  const bottom = rootRect.height - rect.top + rootRect.top + 4

  return { bottom }
}

export default getContextMenuData
