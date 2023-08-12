import { useMemo } from 'react'
import { toRoman } from 'roman-numerals'
import { toAbc } from 'abc-list'

import type { BlockContentProps } from '../../../types'

const depthToBullet = ['•', '◦', '▪']

function BlockContentList(props: BlockContentProps) {
  const { item, onBlockSelection, onRectSelectionMouseDown, BlockContentText } = props

  const { index, depth } = useMemo(() => {
    try {
      const { index, depth } = JSON.parse(item.metadata)

      return { index, depth }
    }
    catch {
      return { index: 0, depth: 0 }
    }
  }, [item.metadata])

  const label = useMemo(() => {
    const cycledDepth = depth % 3

    if (cycledDepth === 0) return `${index + 1}`
    if (cycledDepth === 1) return toAbc(index)

    return toRoman(index + 1).toLowerCase()
  }, [index, depth])

  return (
    <div className="rbt-flex">
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="rbt-shrink-0 rbt-select-none"
      >
        {item.metadata.length ? (
          <div
            className="rbt-ml-2 before:rbt-content-[attr(data-before)]"
            style={{
              width: 6 * label.length,
            }}
            data-before={`${label}.`}
          />
        ) : (
          <div
            className="-rbt-my-[4px] rbt-ml-2 rbt-font-serif rbt-text-2xl before:rbt-content-[attr(data-before)]"
            data-before={depthToBullet[item.indent % depthToBullet.length]}
          />
        )}
      </div>
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="rbt-w-3 rbt-shrink-0"
      />
      <div className="rbt-grow">
        <BlockContentText
          {...props}
          fallbackPlaceholder="List"
        />
      </div>
    </div>
  )
}

export default BlockContentList
