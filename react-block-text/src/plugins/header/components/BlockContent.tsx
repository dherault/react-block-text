import _ from 'clsx'

import type { BlockContentProps } from '../../../types'

function BlockContent(props: BlockContentProps) {
  const { item, BlockContentText } = props

  return (
    <div
      className={_({
        'text-3xl font-semibold': item.type === 'heading1',
        'text-2xl font-semibold': item.type === 'heading2',
        'text-xl font-semibold': item.type === 'heading3',
      })}
    >
      <BlockContentText {...props} />
    </div>
  )

}

export default BlockContent
