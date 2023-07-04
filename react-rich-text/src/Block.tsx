import { useRef } from 'react'
import { DraftHandleValue, Editor, EditorState } from 'draft-js'
import { useDrag, useDrop } from 'react-dnd'

import AddIcon from './icons/Add'
import DragIcon from './icons/Drag'

type BlockProps = {
  id: string
  index: number
  editorState: EditorState
  placeholder: string
  registerRef: (ref: any) => void
  onAddItem: () => void
  onChange: (editorState: EditorState) => void
  onReturn: (event: any) => DraftHandleValue
  onUpArrow: (event: any) => void
  onDownArrow: (event: any) => void
  onFocus: () => void
  onBlur: () => void
  onDnd: (dragIndex: number, hoverIndex: number) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

function Block({
  id,
  index,
  editorState,
  placeholder,
  registerRef,
  onAddItem,
  onChange,
  onReturn,
  onUpArrow,
  onDownArrow,
  onFocus,
  onBlur,
  onDnd,
}: BlockProps) {
  const dragRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: 'block',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!dragRef.current) return

      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = dragRef.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      // Time to actually perform the action
      onDnd(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'block',
    item: () => ({ id, index }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(dragRef)
  drop(preview(previewRef))

  const opacity = isDragging ? 0.01 : 1

  return (
    <div
      ref={previewRef}
      className="my-1 group w-full flex items-center gap-1 relative"
      data-handler-id={handlerId}
      style={{ opacity }}
    >
      <div
        className="p-1 h-full opacity-0 group-hover:opacity-100 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
        onClick={onAddItem}
      >
        <AddIcon width={18} />
      </div>
      <div
        ref={dragRef}
        className="py-1 h-full opacity-0 group-hover:opacity-100 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
      >
        <DragIcon width={18} />
      </div>
      <div className="flex-grow">
        <Editor
          ref={registerRef}
          editorState={editorState}
          onChange={onChange}
          handleReturn={onReturn}
          onUpArrow={onUpArrow}
          onDownArrow={onDownArrow}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default Block
