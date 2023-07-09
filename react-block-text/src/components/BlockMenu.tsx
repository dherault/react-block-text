import { useCallback, useEffect, useRef } from 'react'

import type { BlockMenuItemProps, BlockMenuProps } from '../types'

import { DRAG_ITEM_BUTTON_ID } from '../constants'

import hasParentWithId from '../utils/hasParentWithId'

import TrashIcon from '../icons/Trash'
import DuplicateIcon from '../icons/Duplicate'

function BlockMenu({ top, left, onDeleteItem, onDuplicateItem, onClose }: BlockMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  /* ---
    DELETE
  --- */
  const handleDeleteItem = useCallback(() => {
    onDeleteItem()
    onClose()
  }, [onDeleteItem, onClose])

  /* ---
    DUPLICATE
  --- */
  const handleDuplicateItem = useCallback(() => {
    onDuplicateItem()
    onClose()
  }, [onDuplicateItem, onClose])

  /* ---
    OUTSIDE CLICK
  --- */
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (hasParentWithId(event.target as HTMLElement, DRAG_ITEM_BUTTON_ID)) return
    if (!rootRef.current || rootRef.current.contains(event.target as Node)) return

    onClose()
  }, [onClose])

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick)

    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [handleOutsideClick])

  /* ---
    MAIN RETURN STATEMENT
  --- */
  return (
    <div
      ref={rootRef}
      className="p-1 bg-white border rounded shadow-xl absolute z-50 select-none"
      style={{
        top,
        left,
      }}
    >
      <BlockMenuItem
        icon={(
          <TrashIcon
            width={18}
          />
        )}
        label="Delete"
        onClick={handleDeleteItem}
      />
      <BlockMenuItem
        icon={(
          <DuplicateIcon
            width={16}
            className="scale-y-[-1]"
          />
        )}
        label="Duplicate"
        onClick={handleDuplicateItem}
      />
    </div>
  )
}

/* ---
  MENU ITEM COMPONENT
--- */
function BlockMenuItem({ icon, label, onClick }: BlockMenuItemProps) {
  return (
    <div
      onClick={onClick}
      className="py-1 px-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 rounded"
    >
      {icon}
      {label}
    </div>
  )
}

export default BlockMenu
