import { ReactNode, useMemo } from 'react'
import Fuse from 'fuse.js'

type ContextMenuProps = {
  query: string
  top: number
  left: number
}

type ContextMenuItemProps = {
  title: string
  label: string
  icon: ReactNode
}

type ContextMenuIconProps = {
  children: ReactNode
}

const items: ContextMenuItemProps[] = [
  {
    title: 'Text',
    label: 'Just start writing with plain text',
    icon: (
      <TextIcon />
    ),
  },
  {
    title: 'Heading 1',
    label: 'Big section heading',
    icon: (
      <HeadingIcon>
        H1
      </HeadingIcon>
    ),
  },
  {
    title: 'Heading 2',
    label: 'Medium section heading',
    icon: (
      <HeadingIcon>
        H2
      </HeadingIcon>
    ),
  },
  {
    title: 'Heading 3',
    label: 'Small section heading',
    icon: (
      <HeadingIcon>
        H3
      </HeadingIcon>
    ),
  },
]

const fuseOptions = {
  keys: ['title', 'label'],
  threshold: 0.3,
}

function ContextMenu({ query, top, left }: ContextMenuProps) {
  const fuse = useMemo(() => new Fuse(items, fuseOptions), [])

  const results = useMemo(() => query ? fuse.search(query) : items.map(item => ({ item })), [fuse, query])

  return (
    <div
      className="p-2 bg-white border shadow-xl rounded fixed"
      style={{
        top,
        left,
      }}
    >
      <div className="text-gray-400 text-xs">
        Basic blocks
      </div>
      <div className="mt-2 flex flex-col">
        {results.map(result => (
          <ContextMenuItem
            key={result.item.title}
            {...result.item}
          />
        ))}
      </div>
    </div>
  )
}

function ContextMenuItem({ title, label, icon }: ContextMenuItemProps) {
  return (
    <div className="p-1 flex items-center gap-2">
      {icon}
      <div>
        <div className="text-sm">{title}</div>
        <div className="mt-0.5 text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
}

function ContextMenuIcon({ children }: ContextMenuIconProps) {
  return (
    <div className="px-2 py-1 bg-white border rounded w-12 h-12 border-gray-300">
      {children}
    </div>
  )
}

function PlaceholderTextIcon() {
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="border-b border-gray-300" />
      <div className="w-[75%] border-b border-gray-300" />
      <div className="w-[50%] border-b border-gray-300" />
    </div>
  )
}

function TextIcon() {
  return (
    <ContextMenuIcon>
      <div className="w-full h-full flex items-center justify-center font-serif text-xl">
        Aa
      </div>
    </ContextMenuIcon>
  )
}

function HeadingIcon({ children }: ContextMenuIconProps) {
  return (
    <ContextMenuIcon>
      <div className="font-serif">
        {children}
      </div>
      <PlaceholderTextIcon />
    </ContextMenuIcon>
  )
}

export default ContextMenu
