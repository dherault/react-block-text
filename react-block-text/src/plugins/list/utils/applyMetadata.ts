import type { ReactBlockTextDataItem } from '../../../types'

function applyMetadatas(_index: number, value: ReactBlockTextDataItem[]) {
  const nextValue = [...value]

  for (let i = 0; i < nextValue.length; i++) {
    const { type } = nextValue[i]

    if (type === 'numbered-list') nextValue[i] = applyNumberedListMetadata(nextValue, i)
    if (type === 'bulleted-list') nextValue[i] = applyBulletedListMetadata(nextValue, i)
  }

  return nextValue
}

function applyNumberedListMetadata(value: ReactBlockTextDataItem[], index: number) {
  const item = value[index]
  const previousListItem = findPreviousListItem(value, index)

  if (previousListItem) {
    const { index: previousIndex, depth } = JSON.parse(previousListItem.metadata)
    const isIndented = previousListItem.indent < item.indent

    return {
      ...item,
      metadata: JSON.stringify({
        index: isIndented ? 0 : previousIndex + 1,
        depth: isIndented ? depth + 1 : depth,
      }),
    }
  }

  const previousItem = value[index - 1]

  if (previousItem.type === 'numbered-list') {
    return {
      ...item,
      indent: previousItem.indent + 1,
      metadata: JSON.stringify({
        index: 0,
        depth: previousItem.indent + 1,
      }),
    }
  }

  return {
    ...item,
    indent: 0,
    metadata: JSON.stringify({
      index: 0,
      depth: 0,
    }),
  }

}

function applyBulletedListMetadata(value: ReactBlockTextDataItem[], index: number) {
  const item = value[index]
  const previousListItem = findPreviousListItem(value, index)

  if (previousListItem) return item

  const previousItem = value[index - 1]

  if (previousItem && previousItem.type === 'bulleted-list') {
    return {
      ...item,
      indent: Math.min(previousItem.indent + 1, item.indent),
    }
  }

  return {
    ...item,
    indent: 0,
  }
}

function findPreviousListItem(value: ReactBlockTextDataItem[], index: number) {
  const item = value[index]
  let lastIndent = item.indent

  for (let i = index - 1; i >= 0; i--) {
    if (value[i].indent > lastIndent) continue
    if (value[i].type !== item.type) return null
    if (value[i].indent === item.indent) return value[i]

    lastIndent = value[i].indent
  }

  return null
}

export default applyMetadatas
