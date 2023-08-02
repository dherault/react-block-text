import type { BlockContentProps } from '../../../types'

import ImageSelector from './ImageSelector'

function BlockContent(props: BlockContentProps) {
  const { item } = props

  if (!item.metadata) {
    return (
      <ImageSelector />
    )
  }

  return (
    <div className="flex">
      {/* <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-[3px] bg-current flex-shrink-0"
      />
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div> */}
      Image
    </div>
  )
}

export default BlockContent
