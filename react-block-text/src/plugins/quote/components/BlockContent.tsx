import type { BlockContentProps } from '../../../types'

function BlockContent(props: BlockContentProps) {
  const { onBlockSelection, onRectSelectionMouseDown, BlockContentText } = props

  return (
    <div className="rbt-flex">
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="rbt-w-[3px] rbt-bg-current rbt-flex-shrink-0"
      />
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="rbt-w-2 rbt-flex-shrink-0"
      />
      <div className="rbt-flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContent
