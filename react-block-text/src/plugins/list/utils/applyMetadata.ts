import type { ReactBlockTextDataItem } from '../../../types'

function applyMetadatas(_index: number, value: ReactBlockTextDataItem[]) {
  return value.map((item, index) => {
    if (item.type === 'numbered-list') return applyNumberedListMetadata(value, item, index)
    if (item.type === 'bulleted-list') return applyBulletedListMetadata(value, item, index)

    return item
  })
}

function applyNumberedListMetadata(value: ReactBlockTextDataItem[], item: ReactBlockTextDataItem, index: number) {
  const previousListItem = findPreviousListItem(value, item, index, 'numbered-list')

  try {
    const { index, depth } = JSON.parse(previousListItem!.metadata)
    const isIndented = previousListItem!.indent < item.indent

    return {
      ...item,
      metadata: JSON.stringify({
        index: isIndented ? 0 : index + 1,
        depth: isIndented ? depth + 1 : depth,
      }),
    }
  }
  catch (error) {
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
}

function applyBulletedListMetadata(value: ReactBlockTextDataItem[], item: ReactBlockTextDataItem, index: number) {
  const previousListItem = findPreviousListItem(value, item, index, 'bulleted-list')

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

function findPreviousListItem(value: ReactBlockTextDataItem[], item: ReactBlockTextDataItem, index: number, type: string) {
  for (let i = index - 1; i >= 0; i--) {
    if (value[i].type !== type) return null
    if (value[i].indent === item.indent) return value[i]
  }

  return null
}

export default applyMetadatas
