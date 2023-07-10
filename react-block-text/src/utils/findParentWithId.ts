function findParentWithId(element: HTMLElement, id: string) {
  if (!element) return
  if (element.id === id) return element
  if (!element.parentElement) return null

  return findParentWithId(element.parentElement, id)
}

export default findParentWithId
