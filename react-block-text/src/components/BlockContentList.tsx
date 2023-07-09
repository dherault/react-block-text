import { useMemo } from 'react'

import { BlockContentListMetadata, BlockContentProps } from '../types'

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
    <div className="flex items-start gap-3">
      <div className="-mt-[2px] ml-2 scale-[200%] flex-shrink-0 select-none">
        {label || depthToBullet[depth & depthToBullet.length]}
      </div>
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentList
