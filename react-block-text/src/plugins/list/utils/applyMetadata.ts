import type { ReactBlockTextDataItem } from '../../../types'

function applyMetadatas(_index: number, value: ReactBlockTextDataItem[]) {
  let lastIndex = -1

  return value.map(item => {
    if (item.type !== 'numbered-list') {
      lastIndex = -1

      return item
    }

    lastIndex++

    return {
      ...item,
      metadata: JSON.stringify({ label: `${lastIndex + 1}.`, depth: 0 }),
    }
  })
}

export default applyMetadatas
