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
    <div className="flex">
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="flex-shrink-0 select-none"
      >
        {item.metadata.length ? (
          <div
            className="ml-2 before:content-[attr(before)]"
            style={{
              width: 6 * label.length,
            }}
            // @ts-expect-error
            // eslint-disable-next-line react/no-unknown-property
            before={`${label}.`}
          />
        ) : (
          <div
            className="-my-[4px] ml-2 font-serif text-2xl before:content-[attr(before)]"
            // @ts-expect-error
            // eslint-disable-next-line react/no-unknown-property
            before={depthToBullet[item.indent % depthToBullet.length]}
          />
        )}
      </div>
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-3 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText
          {...props}
          fallbackPlaceholder="List"
        />
      </div>
    </div>
  )
}

export default BlockContentList
