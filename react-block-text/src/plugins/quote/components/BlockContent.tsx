import type { BlockContentProps } from '../../../types'

function BlockContent(props: BlockContentProps) {
  const { onBlockSelection, onRectSelectionMouseDown, BlockContentText } = props

  return (
    <div className="rbt-flex">
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="rbt-w-[3px] rbt-bg-current rbt-shrink-0"
      />
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="rbt-w-2 rbt-shrink-0"
      />
      <div className="rbt-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContent
