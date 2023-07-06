import { useCallback } from 'react'

import { BlockMenuItemProps, BlockMenuProps } from './types'

import TrashIcon from './icons/Trash'

function BlockMenu({ top, left, onDelete, onClose }: BlockMenuProps) {
  const handleDelete = useCallback(() => {
    onDelete()
    onClose()
  }, [onDelete, onClose])

  return (
    <div
      className="p-1 bg-white border rounded shadow-xl absolute z-50"
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
