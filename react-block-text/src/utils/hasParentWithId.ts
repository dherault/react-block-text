function hasParentWithId(element: HTMLElement, id: string) {
  if (element.id === id) return true
  if (!element.parentElement) return false

  return hasParentWithId(element.parentElement, id)
}

export default hasParentWithId
