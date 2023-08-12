import { useCallback, useEffect, useRef } from 'react'

import type { BlockMenuItemProps, BlockMenuProps } from '../types'

import { DRAG_ITEM_BUTTON_ID } from '../constants'

import findParentWithId from '../utils/findParentWithId'

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
    if (findParentWithId(event.target as HTMLElement, DRAG_ITEM_BUTTON_ID)) return
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
      className="rbt-p-1 rbt-bg-white rbt-border rbt-rounded rbt-shadow-xl rbt-absolute rbt-z-50 rbt-select-none"
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
      className="rbt-py-1 rbt-px-2 hover:rbt-bg-gray-100 rbt-cursor-pointer rbt-flex rbt-items-center rbt-gap-2 rbt-rounded"
    >
      {icon}
      {label}
    </div>
  )
}

export default BlockMenu
