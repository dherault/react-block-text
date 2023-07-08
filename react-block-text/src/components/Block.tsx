import { useCallback, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import { BlockProps, DragItem, TopLeft } from '../types'

import AddIcon from '../icons/Add'
import DragIcon from '../icons/Drag'

import BlockMenu from './BlockMenu'

const typeToPaddingTop = {
  text: 3,
  heading1: 24,
  heading2: 18,
  heading3: 12,
  todo: 3,
  'bulleted-list': 3,
  'numbered-list': 3,
} as const

const typeToPaddingBottom = {
  text: 3,
  heading1: 9,
  heading2: 9,
  heading3: 9,
  todo: 3,
  'bulleted-list': 3,
  'numbered-list': 3,
} as const

const typeToIconsExtraPaddingTop = {
  text: 0,
  heading1: 5,
  heading2: 3,
  heading3: 2,
  todo: 0,
  'bulleted-list': 0,
  'numbered-list': 0,
} as const

function Block({
  children,
  readOnly,
  id,
  type,
  index,
  hovered,
  onAddItem,
  onDeleteItem,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  focusContent,
  focusNextContent,
  blurContent,
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

      onMouseMove()
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
      data-react-block-text-id={id}
      className="w-full flex gap-1"
      style={{ opacity }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {!readOnly && (
        <div className="flex-shrink-0">
          <div
            style={{ height: typeToPaddingTop[type] + typeToIconsExtraPaddingTop[type] }}
          />
          <div
            className="flex items-center gap-1 opacity-0 transition-opacity duration-300 text-gray-500"
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
              onMouseDown={blurContent}
              className="py-1 hover:bg-gray-100 rounded cursor-pointer"
            >
              <DragIcon width={18} />
            </div>
          </div>
        </div>
      )}
      <div className="flex-grow cursor-text">
        <div
          onClick={focusContent}
          style={{ height: typeToPaddingTop[type] }}
        />
        {children}
        <div
          onClick={focusNextContent}
          style={{ height: typeToPaddingBottom[type] }}
        />
      </div>
      {!!menuPosition && (
        <BlockMenu
          onDelete={onDeleteItem}
          onClose={() => setMenuPosition(null)}
          {...menuPosition}
        />
      )}
    </div>
  )
}

export default Block
