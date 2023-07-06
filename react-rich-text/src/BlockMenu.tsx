import { BlockMenuProps } from './types'

function BlockMenu({ top, left }: BlockMenuProps) {
  return (
    <div
      className="p-2
      bg-white border rounded shadow-xl absolute z-50"
      style={{
        top,
        left,
      }}
    >
      BlockMenu
    </div>
  )
}

export default BlockMenu
