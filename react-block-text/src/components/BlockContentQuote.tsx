import type { BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'

function BlockContentQuote(props: BlockContentProps) {
  return (
    <div className="flex h-full">
      <div
        onClick={props.onBlockSelection}
        onMouseDown={props.onRectSelectionMouseDown}
        className="w-[3px] bg-black flex-shrink-0"
      />
      <div
        onClick={props.onBlockSelection}
        onMouseDown={props.onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentQuote
