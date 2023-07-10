import type { BlockContentProps } from '../../../types'

function BlockContent(props: BlockContentProps) {
  const { BlockContentText } = props

  return (
    <BlockContentText {...props} />
  )

}

export default BlockContent
