function findChildWithProperty(parent: HTMLElement, name: string, value: string): HTMLElement | null {
  if (parent.getAttribute(name) === value) return parent
  if (!parent.children) return null

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i] as HTMLElement
    const found = findChildWithProperty(child, name, value)

    if (found) return found
  }

  return null
}

export default findChildWithProperty
