import findParentBlock from './findParentBlock'
import findChildWithProperty from './findChildWithProperty'

function countCharactersOnLastBlockLines(id: string, editorElement: HTMLElement | null | undefined, injectionElement: HTMLElement) {
  if (!(editorElement && injectionElement)) return 0

  // We want to reconstitute the Block element with its content
  const blockElement = findParentBlock(id, editorElement)

  if (!blockElement) return null

  // So we clone it
  const blockElementClone = blockElement.cloneNode(true) as HTMLElement
  // Find its content
  const contentElement = findChildWithProperty(blockElementClone, 'data-contents', 'true')

  if (!contentElement) return null

  injectionElement.appendChild(blockElementClone)

  // Remove first content blocks, keep last one
  for (let i = 0; i < contentElement.children.length - 1; i++) {
    contentElement.removeChild(contentElement.children[i])
  }

  // We count the characters of each line
  const count = [0]
  const text = contentElement.innerText ?? ''
  const words = text.split(/ |-/)
  let height = contentElement.offsetHeight

  contentElement.innerText = text

  const { length } = words

  for (let i = 0; i < length; i++) {
    const lastWord = words.pop() ?? ''

    count[0] += lastWord.length + 1

    contentElement.innerText = contentElement.innerText.slice(0, -(lastWord.length + 1))

    if (contentElement.offsetHeight < height) {
      height = contentElement.offsetHeight
      count[0] -= 1

      if (contentElement.innerText.length === 0) break

      count.unshift(0)
    }
  }

  injectionElement.removeChild(blockElementClone)

  return count
}

export default countCharactersOnLastBlockLines
