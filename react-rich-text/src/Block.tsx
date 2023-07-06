import { useCallback, useRef } from 'react'
import { Editor, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js'
import { useDrag, useDrop } from 'react-dnd'

import AddIcon from './icons/Add'
import DragIcon from './icons/Drag'

import { BlockProps, DragItem } from './types'

const COMMANDS = {
  OPEN_MENU: 'open-menu',
  SAVE: 'save',
}

function Block({
  id,
  index,
  editorState,
  hovered,
  focused,
  registerRef,
  onAddItem,
  onChange,
  onBeforeInput,
  onReturn,
  onUpArrow,
  onDownArrow,
  onFocus,
  onBlur,
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

  const handleKeyCommand = useCallback((command: string) => {
    console.log('command', command)

    if (command === COMMANDS.OPEN_MENU) {
      return 'not-handled'
    }

    return 'not-handled'
  }, [])

  return (
    <div
      ref={previewRef}
      className="py-1 w-full flex items-center gap-1 relative"
      data-handler-id={handlerId}
      style={{ opacity }}
      onMouseMove={onMouseEnter}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
      <div className="flex-grow">
        <Editor
          ref={registerRef}
          editorState={editorState}
          onChange={onChange}
          handleReturn={onReturn}
          handleBeforeInput={onBeforeInput}
          onUpArrow={onUpArrow}
          onDownArrow={onDownArrow}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={focused ? "Start typing or press '/' for commands" : ''}
          keyBindingFn={bindKey}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  )
}

function bindKey(event: any): string | null {
  // if (event.keyCode === 191 /* `/` key */ && !KeyBindingUtil.hasCommandModifier(event)) {
  //   return COMMANDS.OPEN_MENU
  // }

  if (event.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(event)) {
    return COMMANDS.SAVE
  }

  return getDefaultKeyBinding(event)
}

export default Block
