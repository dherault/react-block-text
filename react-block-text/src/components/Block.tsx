import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import _ from 'clsx'
import type { XYCoord } from 'react-dnd'

import type { BlockContentProps, BlockProps, TopLeft } from '../types'

import { ADD_ITEM_BUTTON_ID, DRAG_ITEM_BUTTON_ID } from '../constants'

import PrimaryColorContext from '../context/PrimaryColorContext'

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
  quote: 5,
} as const

const typeToPaddingBottom = {
  text: 3,
  heading1: 9,
  heading2: 9,
  heading3: 9,
  todo: 3,
  'bulleted-list': 3,
  'numbered-list': 3,
  quote: 5,
} as const

const typeToIconsExtraPaddingTop = {
  text: 0,
  heading1: 6,
  heading2: 4,
  heading3: 1,
  todo: 0,
  'bulleted-list': 0,
  'numbered-list': 0,
  quote: 0,
} as const

const DRAG_INDICATOR_SIZE = 3

function Block({
  children,
  id,
  type,
  index,
  readOnly,
  selected,
  hovered,
  isDraggingTop,
  paddingLeft,
  registerSelectionRef,
  onAddItem,
  onDeleteItem,
  onDuplicateItem,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onRectSelectionMouseDown,
  onDragStart,
  onDrag,
  onDragEnd,
  onBlockMenuOpen,
  onBlockMenuClose,
  focusContent,
  focusContentAtStart,
  focusNextContent,
  blurContent,
  blockContentProps,
}: BlockProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const primaryColor = useContext(PrimaryColorContext)
  const [menuPosition, setMenuPosition] = useState<TopLeft | null>(null)

  const isEmpty = useMemo(() => (
    type === 'text'
    && !blockContentProps.editorState.getCurrentContent().getPlainText().length
  ), [type, blockContentProps.editorState])

  /* ---
    DRAG AND DROP
  --- */
  const [{ handlerId }, drop] = useDrop<
    BlockContentProps,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: 'block',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: BlockContentProps, monitor) {
      if (!dragRef.current) return

      const dragIndex = item.index
      const hoverIndex = index

      // Determine rectangle on screen
      const hoverBoundingRect = dragRef.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top
      const hoverMiddleY = hoverHeight / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset() as XYCoord

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      // Don't display a drag indicator if the dragged block is hovered in the middle
      const isMiddleOfSameIndex = dragIndex === hoverIndex && hoverClientY > hoverHeight / 3 && hoverClientY < hoverHeight * 2 / 3

      // Time to actually perform the action
      onDrag(hoverIndex, isMiddleOfSameIndex ? null : hoverClientY < hoverMiddleY)
    },
  }, [index, onDrag])

  const [, drag, preview] = useDrag({
    type: 'block',
    item() {
      onDragStart()

      return blockContentProps
    },
    end() {
      onDragEnd()
    },
  }, [onDragStart, onDragEnd])

  drag(dragRef)
  drop(rootRef)

  /* ---
    BLOCK MENU POSITIONING AND TRIGGER
  --- */
  const handleDragClick = useCallback(() => {
    if (!rootRef.current) return
    if (!dragRef.current) return

    const rootRect = rootRef.current.getBoundingClientRect()
    const dragRect = dragRef.current.getBoundingClientRect()

    setMenuPosition({
      top: dragRect.top - rootRect.top - 4,
      left: dragRect.left - rootRect.left + 12,
    })
    onBlockMenuOpen()
  }, [onBlockMenuOpen])

  const handleBlockMenuClose = useCallback(() => {
    setMenuPosition(null)
    onBlockMenuClose()
  }, [onBlockMenuClose])

  const isDraggingBottom = isDraggingTop === false

  useEffect(() => {
    preview(getEmptyImage())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---
    MAIN RETURN STATEMENT
  --- */
  return (
    <div
      ref={rootRef}
      id={id}
      data-react-block-text-id={id}
      data-handler-id={handlerId}
      className="flex"
      onMouseDown={() => !menuPosition && !readOnly && onMouseDown()}
      onMouseMove={() => !menuPosition && !readOnly && onMouseMove()}
      onMouseEnter={() => !menuPosition && !readOnly && onMouseMove()}
      onMouseLeave={() => !menuPosition && !readOnly && onMouseLeave()}
    >
      {/* padding left with click handler */}
      <div
        onClick={focusContentAtStart}
        onMouseDown={onRectSelectionMouseDown}
        className="cursor-text flex-shrink-0"
        style={{ width: paddingLeft }}
      />
      <div className="flex-grow flex relative">
        {/* Selection background element */}
        <div
          ref={registerSelectionRef}
          className="absolute rounded-sm z-0 transition-opacity"
          style={{
            top: typeToPaddingTop[type] - 2,
            bottom: typeToPaddingBottom[type] - 2,
            left: (contentRef.current?.offsetLeft ?? 0) - 4,
            right: 2,
            backgroundColor: primaryColor,
            opacity: !isEmpty && selected ? 0.15 : 0,
          }}
        >
          {/* Scroll into view offset element */}
          <div className="absolute -bottom-[64px] left-0" />
        </div>
        {/* Add and drag icons */}
        {!readOnly && (
          <div className="flex-shrink-0 flex flex-col">
            <div
              onClick={focusContentAtStart}
              onMouseDown={onRectSelectionMouseDown}
              className="flex-shrink-0 cursor-text"
              style={{ height: typeToPaddingTop[type] + typeToIconsExtraPaddingTop[type] }}
            />
            <div
              className="flex-shrink-0 flex items-center opacity-0 transition-opacity duration-300 text-gray-500"
              style={{ opacity: hovered ? 1 : 0 }}
            >
              <div
                id={ADD_ITEM_BUTTON_ID}
                className={_('p-1 hover:bg-gray-100 rounded cursor-pointer', {
                  'opacity-0': !!menuPosition,
                })}
                onClick={onAddItem}
              >
                <AddIcon width={18} />
              </div>
              <div
                ref={dragRef}
                id={DRAG_ITEM_BUTTON_ID}
                onClick={handleDragClick}
                onMouseDown={blurContent}
                className="py-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <DragIcon width={18} />
              </div>
            </div>
            <div
              onClick={focusContentAtStart}
              onMouseDown={onRectSelectionMouseDown}
              className="flex-grow cursor-text"
            />
          </div>
        )}
        {/* Separator/margin with click handler */}
        <div
          onClick={focusContentAtStart}
          onMouseDown={onRectSelectionMouseDown}
          className="w-1.5 h-full cursor-text z-10"
        />
        {/* Content */}
        <div
          ref={contentRef}
          className="flex-grow cursor-text z-10"
        >
          <div
            onClick={focusContent}
            onMouseDown={onRectSelectionMouseDown}
            className="transition-opacity duration-300"
            style={{
              height: DRAG_INDICATOR_SIZE,
              backgroundColor: primaryColor,
              opacity: isDraggingTop ? 0.4 : 0,
            }}
          />
          <div
            onClick={focusContent}
            onMouseDown={onRectSelectionMouseDown}
            style={{ height: typeToPaddingTop[type] - DRAG_INDICATOR_SIZE }}
          />
          <div style={{ height: `calc(100% - ${typeToPaddingTop[type] + typeToPaddingBottom[type]}px)` }}>
            {children}
          </div>
          <div
            onClick={focusNextContent}
            onMouseDown={onRectSelectionMouseDown}
            style={{ height: typeToPaddingBottom[type] - DRAG_INDICATOR_SIZE }}
          />
          <div
            onClick={focusNextContent}
            onMouseDown={onRectSelectionMouseDown}
            className="transition-opacity duration-200"
            style={{
              height: DRAG_INDICATOR_SIZE,
              backgroundColor: primaryColor,
              opacity: isDraggingBottom ? 0.4 : 0,
            }}
          />
        </div>
        {/* Block menu */}
        {!!menuPosition && (
          <BlockMenu
            onDeleteItem={onDeleteItem}
            onDuplicateItem={onDuplicateItem}
            onClose={handleBlockMenuClose}
            {...menuPosition}
          />
        )}
      </div>
    </div>
  )
}

export default Block
