import { useMemo } from 'react'

import type { BlockContentListMetadata, BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'

const depthToBullet = [
  '•',
  '◦',
  '▪',
]

function BlockContentList(props: BlockContentProps) {
  const { label, depth } = useMemo<BlockContentListMetadata>(() => {
    try {
      const { label, depth } = JSON.parse(props.metadata)

      return { label, depth }
    }
    catch {
     //
    }

    return {
      label: '',
      depth: 0,
    }
  }, [props.metadata])

  return (
    <div className="flex">
      <div
        onClick={props.onBlockSelection}
        onMouseDown={props.onRectSelectionMouseDown}
        className="flex-shrink-0"
      >
        <div className="-mt-[2px] ml-2 scale-[200%]  select-none">
          {label || depthToBullet[depth & depthToBullet.length]}
        </div>
      </div>
      <div
        onClick={props.onBlockSelection}
        onMouseDown={props.onRectSelectionMouseDown}
        className="w-3 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentList
