import { BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'

function BlockContentQuote(props: BlockContentProps) {
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="w-[3px] h-full bg-black" />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentQuote
