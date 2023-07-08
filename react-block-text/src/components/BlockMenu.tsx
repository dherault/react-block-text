import { useCallback, useEffect, useRef } from 'react'

import { BlockMenuItemProps, BlockMenuProps } from '../types'

import TrashIcon from '../icons/Trash'

function BlockMenu({ top, left, onDelete, onClose }: BlockMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  /* ---
    DELETE
  --- */
  const handleDelete = useCallback(() => {
    onDelete()
    onClose()
  }, [onDelete, onClose])

  /* ---
    OUTSIDE CLICK
  --- */
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
      onClose()
    }
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
        onClick={handleDelete}
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
      className="p-1 w-full hover:bg-gray-100 cursor-pointer flex items-center gap-1 rounded"
      onClick={onClick}
    >
      {icon}
      <div className="text-sm">
        {label}
      </div>
    </div>
  )
}

export default BlockMenu
