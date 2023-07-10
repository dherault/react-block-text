import type { MouseEvent } from 'react'

function getRelativeMousePosition(element: HTMLElement, event: MouseEvent) {
  const rootRect = element.getBoundingClientRect()

  return {
    x: event.clientX - element.clientLeft - rootRect.left,
    y: event.clientY - element.clientTop - rootRect.top,
  }
}

export default getRelativeMousePosition
