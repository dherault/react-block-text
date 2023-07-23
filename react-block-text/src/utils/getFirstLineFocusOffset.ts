import findParentBlock from './findParentBlock'
import findChildWithProperty from './findChildWithProperty'

function getFirstLineFocusOffset(id: string, focusOffset: number, editorElement: HTMLElement | null | undefined, injectionElement: HTMLElement) {
  if (!(editorElement && injectionElement)) return 0

  // We want to reconstitute the Block element with its content
  const blockElement = findParentBlock(id, editorElement)

  if (!blockElement) return 0

  // So we clone it
  const blockElementClone = blockElement.cloneNode(true) as HTMLElement
  // Find its content
  const contentElement = findChildWithProperty(blockElementClone, 'data-contents', 'true')

  if (!contentElement) return 0

  injectionElement.appendChild(blockElementClone)

  // Remove first content blocks, keep last one
  for (let i = 0; i < contentElement.children.length - 1; i++) {
    contentElement.removeChild(contentElement.children[i])
  }

  // Then we calculate the offset from the start of the last line
  let offset = 0
  let hasAcheivedOffset = false
  const text = contentElement.innerText ?? ''
  const words = text.split(/ |-/)
  const height = contentElement.offsetHeight

  contentElement.innerText = text

  for (let i = 0; i < words.length; i++) {
    if (contentElement.offsetHeight < height) {
      injectionElement.removeChild(blockElementClone)

      return offset
    }

    const lastWord = words.pop() ?? ''

    contentElement.innerText = contentElement.innerText.slice(0, -(lastWord.length + 1))

    if (contentElement.innerText.length < focusOffset) {
      if (hasAcheivedOffset) {
        offset += lastWord.length + 1
      }
      else {
        offset += focusOffset - contentElement.innerText.length - 1
        hasAcheivedOffset = true
      }
    }
  }

  injectionElement.removeChild(blockElementClone)

  return focusOffset
}

export default getFirstLineFocusOffset
