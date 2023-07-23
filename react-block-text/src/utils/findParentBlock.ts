function findParentBlock(id: string, element: HTMLElement) {
  if (element.id === id) return element
  if (!element.parentElement) return null

  return findParentBlock(id, element.parentElement)
}

export default findParentBlock
