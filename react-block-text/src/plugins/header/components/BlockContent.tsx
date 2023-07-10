import _ from 'clsx'

import type { BlockContentProps } from '../../../types'

function BlockContent(props: BlockContentProps) {
  const { type, BlockContentText } = props

  return (
    <div
      className={_({
        'text-3xl font-semibold': type === 'heading1',
        'text-2xl font-semibold': type === 'heading2',
        'text-xl font-semibold': type === 'heading3',
      })}
    >
      <BlockContentText {...props} />
    </div>
  )

}

export default BlockContent
