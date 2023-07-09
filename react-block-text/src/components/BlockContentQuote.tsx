import { BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'

function BlockContentQuote(props: BlockContentProps) {
  return (
    <div className="flex gap-2 h-full">
      <div className="w-[3px] bg-black flex-shrink-0" />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentQuote
