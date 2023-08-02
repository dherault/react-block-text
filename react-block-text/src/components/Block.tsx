import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import _ from 'clsx'
import type { XYCoord } from 'react-dnd'

import type { BlockProps, DragAndDropCollect, TopLeft } from '../types'

import { ADD_ITEM_BUTTON_ID, BLOCK_ICONS_WIDTH, DRAG_ITEM_BUTTON_ID, INDENT_SIZE } from '../constants'

import ColorsContext from '../context/ColorsContext'

import AddIcon from '../icons/Add'
import DragIcon from '../icons/Drag'

import BlockMenu from './BlockMenu'

const DRAG_INDICATOR_SIZE = 3
const DRAG_TYPE = 'block'

function Block(props: BlockProps) {
  const {
    children,
    pluginsData,
    item,
    index,
    readOnly,
    selected,
    hovered,
    isDraggingTop,
    paddingLeft: rawPaddingLeft,
    paddingRight: rawPaddingRight,
    noPadding = false,
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
    focusContentAtEnd,
    focusNextContent,
    blurContent,
    blockContentProps,
  } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { primaryColor, primaryColorTransparent } = useContext(ColorsContext)
  const [menuPosition, setMenuPosition] = useState<TopLeft | null>(null)

  const plugin = useMemo(() => pluginsData.find(plugin => plugin.type === item.type), [pluginsData, item])
  const isEmpty = useMemo(() => (
    item.type === 'text'
    && !blockContentProps.editorState.getCurrentContent().getPlainText().length
  ), [item, blockContentProps.editorState])
  const paddingTop = useMemo(() => noPadding ? 0 : plugin?.paddingTop ?? 3, [noPadding, plugin])
  const paddingBottom = useMemo(() => noPadding ? 0 : plugin?.paddingBottom ?? 3, [noPadding, plugin])
  const paddingLeft = useMemo(() => noPadding ? 0 : rawPaddingLeft ?? 0, [noPadding, rawPaddingLeft])
  const paddingRight = useMemo(() => noPadding ? 0 : rawPaddingRight ?? 0, [noPadding, rawPaddingRight])
  const indentWidth = useMemo(() => item.indent * INDENT_SIZE, [item.indent])
  const iconsWidth = useMemo(() => readOnly ? 0 : BLOCK_ICONS_WIDTH, [readOnly])

  /* ---
    DRAG AND DROP
    The `item` is the props of the dragged block
  --- */
  const [{ handlerId }, drop] = useDrop<BlockProps, void, DragAndDropCollect>({
    accept: DRAG_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(dragItem, monitor) {
      if (!dragRef.current) return

      const dragIndex = dragItem.index
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
      const isMiddleOfSameIndex = dragIndex === hoverIndex
        && hoverClientY > hoverHeight / 3
        && hoverClientY < hoverHeight * 2 / 3

      // Time to actually perform the action
      onDrag(hoverIndex, isMiddleOfSameIndex ? null : hoverClientY < hoverMiddleY)
    },
  })

  const [, drag, preview] = useDrag({
    type: DRAG_TYPE,
    item() {
      onDragStart()

      return props
    },
    end() {
      onDragEnd()
    },
  })

  drag(dragRef)
  drop(rootRef)

  /* ---
    BLOCK MENU POSITIONING ON OPEN
  --- */
  const handleDragClick = useCallback(() => {
    if (!rootRef.current) return
    if (!dragRef.current) return

    const rootRect = rootRef.current.getBoundingClientRect()
    const dragRect = dragRef.current.getBoundingClientRect()

    setMenuPosition({
      top: dragRect.top - rootRect.top - 4,
      left: dragRect.left - rootRect.left + 24 - paddingLeft + BLOCK_ICONS_WIDTH,
    })
    onBlockMenuOpen()
  }, [paddingLeft, onBlockMenuOpen])

  /* ---
    BLOCK MENU CLOSE
  --- */
  const handleBlockMenuClose = useCallback(() => {
    setMenuPosition(null)
    onBlockMenuClose()
  }, [onBlockMenuClose])

  /* ---
    USE EMPTY IMAGE FOR DND PREVIEW
  --- */
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
      id={item.id}
      data-react-block-text-id={item.id}
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
        style={{ width: Math.max((paddingLeft ?? 0) - iconsWidth, 0) + indentWidth }}
      />
      <div className="flex-grow flex relative">
        {/* Selection background element */}
        <div
          ref={registerSelectionRef}
          className="absolute rounded-sm transition-opacity z-0"
          style={{
            top: paddingTop - 2,
            bottom: paddingBottom - 2,
            left: (contentRef.current?.offsetLeft || 0) - indentWidth - 4,
            right: 2,
            backgroundColor: primaryColorTransparent,
            opacity: !isEmpty && selected ? 1 : 0,
          }}
        >
          {/* Scroll into view offset element */}
          <div className="absolute -bottom-[64px] left-0" />
        </div>
        {/* Add and drag icons */}
        {!readOnly && (
          <div className="flex-shrink-0 flex">
            <div className="flex-shrink-0 flex flex-col">
              <div
                onClick={focusContentAtStart}
                onMouseDown={onRectSelectionMouseDown}
                className="flex-shrink-0 cursor-text"
                style={{ height: paddingTop + (plugin?.iconsPaddingTop ?? 0) - 1 }}
              />
              <div
                className="flex-shrink-0 flex items-center opacity-0 transition-opacity duration-300 text-gray-400"
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
            {/* Separator/margin with click handler */}
            <div
              onClick={focusContentAtStart}
              onMouseDown={onRectSelectionMouseDown}
              className="w-1.5 h-full cursor-text flex-shrink-0"
            />
          </div>
        )}
        {/* Content */}
        <div
          ref={contentRef}
          className="flex-grow cursor-text"
        >
          {!noPadding && (
            <>
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
                style={{ height: paddingTop - DRAG_INDICATOR_SIZE }}
              />
            </>
          )}
          <div style={{ height: `calc(100% - ${paddingTop + paddingBottom}px)` }}>
            {children}
          </div>
          {!noPadding && (
            <>
              <div
                onClick={focusNextContent}
                onMouseDown={onRectSelectionMouseDown}
                style={{ height: paddingBottom - DRAG_INDICATOR_SIZE }}
              />
              <div
                onClick={focusNextContent}
                onMouseDown={onRectSelectionMouseDown}
                className="transition-opacity duration-200"
                style={{
                  height: DRAG_INDICATOR_SIZE,
                  backgroundColor: primaryColor,
                  opacity: isDraggingTop === false ? 0.4 : 0,
                }}
              />
            </>
          )}
        </div>
        {/* Separator/margin with click handler */}
        {!readOnly && (
          <div
            onClick={focusContentAtStart}
            onMouseDown={onRectSelectionMouseDown}
            className="w-1.5 h-full cursor-text flex-shrink-0"
          />
        )}
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
      {/* padding right with click handler */}
      <div
        onClick={focusContentAtEnd}
        onMouseDown={onRectSelectionMouseDown}
        className="cursor-text flex-shrink-0"
        style={{ width: paddingRight ?? 0 }}
      />
    </div>
  )
}

export default Block
