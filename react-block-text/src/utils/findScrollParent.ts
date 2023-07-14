// https://stackoverflow.com/questions/35939886/find-first-scrollable-parent
const properties = ['overflow', 'overflow-x', 'overflow-y']

const isScrollable = (node: Element) => {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) return false

  const style = getComputedStyle(node)

  return properties.some(propertyName => {
    const value = style.getPropertyValue(propertyName)

    return value === 'auto' || value === 'scroll'
  })
}

export const findScrollParent = (node: Element): HTMLElement => {
  let currentParent = node.parentElement

  while (currentParent) {
    if (isScrollable(currentParent)) return currentParent

    currentParent = currentParent.parentElement
  }

  return (document.scrollingElement as HTMLElement) || document.documentElement
}

export default findScrollParent
