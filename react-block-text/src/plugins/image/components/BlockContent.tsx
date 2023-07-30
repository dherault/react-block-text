import type { BlockContentProps } from '../types'

function BlockContent(props: BlockContentProps) {
  const { item } = props

  console.log('item', item)

  return (
    <div className="flex">
      {/* <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-[3px] bg-current flex-shrink-0"
      />
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div> */}
      Image
    </div>
  )
}

export default BlockContent
