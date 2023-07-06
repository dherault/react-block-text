type ContextMenuProps = {
  query: string
  top: number
  left: number
}

function ContextMenu({ query, top, left }: ContextMenuProps) {
  return (
    <div
      className="p-2 bg-white border shadow-xl fixed"
      style={{
        top,
        left,
      }}
    >
      {query}
    </div>
  )
}

export default ContextMenu
