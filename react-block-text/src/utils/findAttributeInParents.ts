function findAttributeInParents(element: HTMLElement, attribute: string) {
  if (element.hasAttribute(attribute)) return element.getAttribute(attribute)

  if (!element.parentElement) return null

  return findAttributeInParents(element.parentElement, attribute)
}

export default findAttributeInParents
