import type { XY } from '../types'

function getRelativeMousePosition(element: HTMLElement, mousePosition: XY) {
  const rootRect = element.getBoundingClientRect()

  return {
    x: mousePosition.x - element.clientLeft - rootRect.left,
    y: mousePosition.y - element.clientTop - rootRect.top,
  }
}

export default getRelativeMousePosition
