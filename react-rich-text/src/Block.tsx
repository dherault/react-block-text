import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import AddIcon from './icons/Add'
import DragIcon from './icons/Drag'

import { BlockProps, DragItem } from './types'

function Block({
  children,
  readOnly,
  id,
  index,
  hovered,
  onAddItem,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
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
      onDrag(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'block',
    item() {
      onDragStart()

      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end(_item, monitor) {
      onDragEnd()

      if (!monitor.didDrop()) return

      onMouseEnter()
    },
  })

  drag(dragRef)
  drop(preview(previewRef))

  const opacity = isDragging ? 0.01 : 1

  return (
    <div
      ref={previewRef}
      className="py-1 w-full flex items-start gap-1 relative"
      data-handler-id={handlerId}
      style={{ opacity }}
      onMouseMove={onMouseEnter}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!readOnly && (
        <div
          className="flex-shrink-0 flex items-center gap-1 opacity-0 transition-opacity duration-300 text-gray-500"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div
            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
            onClick={onAddItem}
          >
            <AddIcon width={18} />
          </div>
          <div
            ref={dragRef}
            className="py-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <DragIcon width={18} />
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default Block
