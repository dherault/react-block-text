import { useCallback, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import AddIcon from './icons/Add'
import DragIcon from './icons/Drag'

import { BlockProps, DragItem, TopLeft } from './types'
import BlockMenu from './BlockMenu'

const typeToPaddingTop = {
  heading1: 24,
  heading2: 16,
  heading3: 12,
} as const

const typeToPaddingBottom = {
  heading1: 8,
  heading2: 8,
  heading3: 8,
} as const

function Block({
  children,
  readOnly,
  id,
  type,
  index,
  hovered,
  onAddItem,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  onDelete,
}: BlockProps) {
  const dragRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<TopLeft | null>(null)

  /* ---
    DRAG AND DROP
  --- */
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

  /* ---
    BLOCK MENU POSITIONING AND TRIGGER
  --- */
  const handleDragClick = useCallback(() => {
    if (!previewRef.current) return
    if (!dragRef.current) return

    const previewRect = previewRef.current.getBoundingClientRect()
    const dragRect = dragRef.current.getBoundingClientRect()

    console.log({
      top: dragRect.top - previewRect.top,
      left: dragRect.left - previewRect.left,
    })

    setMenuPosition({
      top: dragRect.top - previewRect.top - 4,
      left: dragRect.left - previewRect.left,
    })
  }, [])

  /* ---
    MAIN RETURN STATEMENT
  --- */
  return (
    <div
      ref={previewRef}
      data-handler-id={handlerId}
      className="w-full flex items-start gap-1 relative"
      style={{
        opacity,
        paddingTop: typeToPaddingTop[type as keyof typeof typeToPaddingTop] ?? 4,
        paddingBottom: typeToPaddingBottom[type as keyof typeof typeToPaddingBottom] ?? 4,
      }}
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
            onClick={handleDragClick}
            className="py-1 hover:bg-gray-100 rounded cursor-pointer"
          >
            <DragIcon width={18} />
          </div>
        </div>
      )}
      {!!menuPosition && (
        <BlockMenu
          onDelete={onDelete}
          onClose={() => setMenuPosition(null)}
          {...menuPosition}
        />
      )}
      <div className="flex-grow">
        {children}
      </div>
    </div>
  )
}

export default Block
