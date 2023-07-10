import type { SelectionRectData } from '../types'

// Lookup the ids under the given selectionRect
function findSelectionRectIds(selectionRefs: Record<string, HTMLElement>, selectionRect: SelectionRectData): string[] {
  if (!selectionRect.width || !selectionRect.height) return []

  const ids: string[] = []

  Object.entries(selectionRefs).forEach(([id, element]) => {
    if (!element) return

    const contentElement = element.parentElement

    if (!contentElement) return

    if (
      selectionRect.left + selectionRect.width < element.offsetLeft + contentElement.offsetLeft
      || selectionRect.left > element.offsetLeft + element.offsetWidth + contentElement.offsetLeft
      || selectionRect.top + selectionRect.height < element.offsetTop + contentElement.offsetTop
      || selectionRect.top > element.offsetTop + element.offsetHeight + contentElement.offsetTop
    ) {
      return
    }

    ids.push(id)
  })

  return ids
}

export default findSelectionRectIds
