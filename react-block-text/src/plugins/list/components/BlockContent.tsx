import { useMemo } from 'react'

import type { BlockContentProps } from '../../../types'
import type { BlockContentListMetadata } from '../types'

const depthToBullet = [
  '•',
  '◦',
  '▪',
]

function BlockContentList(props: BlockContentProps) {
  const { metadata, onBlockSelection, onRectSelectionMouseDown, BlockContentText } = props

  const { label, depth } = useMemo<BlockContentListMetadata>(() => {
    try {
      const { label, depth } = JSON.parse(metadata)

      return { label, depth }
    }
    catch {
     //
    }

    return {
      label: '',
      depth: 0,
    }
  }, [metadata])

  return (
    <div className="flex">
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="flex-shrink-0 select-none"
      >
        {label ? (
          <div
            className="ml-2"
            style={{
              width: 6 * label.length,
            }}
          >
            {label}
          </div>
        ) : (
          <div className="-mt-[2px] ml-2 scale-[200%]">
            {depthToBullet[depth & depthToBullet.length]}
          </div>
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
