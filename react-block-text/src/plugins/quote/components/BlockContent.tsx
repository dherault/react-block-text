import type { BlockContentProps } from '../../../types'

function BlockContent(props: BlockContentProps) {
  const { onBlockSelection, onRectSelectionMouseDown, BlockContentText } = props

  return (
    <div className="flex h-full">
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-[3px] bg-black flex-shrink-0"
      />
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContent