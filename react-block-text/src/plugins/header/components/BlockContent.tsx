import _ from 'clsx'

import type { BlockContentProps } from '../../../types'

const typeToPlaceholder = {
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
}

function BlockContent(props: BlockContentProps) {
  const { item, BlockContentText } = props

  const placeholder = typeToPlaceholder[item.type as keyof typeof typeToPlaceholder]

  return (
    <div
      className={_('rbt-font-semibold', {
        'rbt-text-3xl': item.type === 'heading1',
        'rbt-text-2xl': item.type === 'heading2',
        'rbt-text-xl': item.type === 'heading3',
      })}
    >
      <BlockContentText
        {...props}
        placeholder={placeholder}
        fallbackPlaceholder={placeholder}
      />
    </div>
  )
}

export default BlockContent
