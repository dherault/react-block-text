
import type { ReactBlockTextDataItem } from '../../../types'

function applyMetadatas(_index: number, value: ReactBlockTextDataItem[]) {
  return value.map((item, index) => {
    if (item.type !== 'numbered-list') return item

    const previousListItem = findPreviousListItem(value, item, index)

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

      try {
        const { depth } = JSON.parse(previousItem.metadata)

        return {
          ...item,
          metadata: JSON.stringify({
            index: 0,
            depth: depth + 1,
          }),
        }
      }
      catch (error) {
        return {
          ...item,
          metadata: JSON.stringify({
            index: 0,
            depth: 0,
          }),
        }
      }
    }
  })
}

function findPreviousListItem(value: ReactBlockTextDataItem[], item: ReactBlockTextDataItem, index: number) {
  for (let i = index - 1; i >= 0; i--) {
    if (value[i].type !== 'numbered-list') return null
    if (value[i].indent === item.indent) return value[i]
  }

  return null
}

export default applyMetadatas
