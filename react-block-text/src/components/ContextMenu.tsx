import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import _ from 'clsx'

import { ContextMenuIconProps, ContextMenuItemProps, ContextMenuProps } from '../types'

import Checkbox from './Checkbox'

/* ---
  ITEMS OF THE CONTEXT MENU
--- */
const items = [
  {
    command: 'text',
    shortcuts: 'txt',
    title: 'Text',
    label: 'Just start writing with plain text',
    icon: (
      <TextIcon />
    ),
  },
  {
    command: 'heading1',
    title: 'Heading 1',
    shortcuts: 'h1',
    label: 'Big section heading',
    icon: (
      <HeadingIcon>
        H1
      </HeadingIcon>
    ),
  },
  {
    command: 'heading2',
    title: 'Heading 2',
    shortcuts: 'h2',
    label: 'Medium section heading',
    icon: (
      <HeadingIcon>
        H2
      </HeadingIcon>
    ),
  },
  {
    command: 'heading3',
    title: 'Heading 3',
    shortcuts: 'h3',
    label: 'Small section heading',
    icon: (
      <HeadingIcon>
        H3
      </HeadingIcon>
    ),
  },
  {
    command: 'todo',
    title: 'To-do list',
    shortcuts: 'todo',
    label: 'Track tasks with a to-do list',
    icon: (
      <TodoIcon />
    ),
  },
] as const

const fuseOptions = {
  keys: ['title', 'label', 'shortcuts'],
  threshold: 0.3,
}

function ContextMenu({ query, top, left, onSelect, onClose }: ContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState(0)
  const fuse = useMemo(() => new Fuse(items, fuseOptions), [])
  const results = useMemo(() => query ? fuse.search(query) : items.map(item => ({ item })), [fuse, query])

  /* ---
    ARROW UP, DOWN, ENTER, ESCAPE HANDLERS
  --- */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHoveredIndex(x => (x + 1) % results.length)

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHoveredIndex(x => x === -1 ? results.length - 1 : (x - 1 + results.length) % results.length)

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (hoveredIndex !== -1) {
        onSelect(results[hoveredIndex].item.command)
      }

      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()

      onClose()
    }
  }, [results, hoveredIndex, onSelect, onClose])

  /* ---
    OUTSIDE CLICK
  --- */
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
      onClose()
    }
  }, [onClose])

  /* ---
    WINDOW EVENT LISTENERS
  --- */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

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
      className="py-2 px-1 bg-white border shadow-xl rounded fixed z-50"
      style={{
        top,
        left,
      }}
    >
      <div className="px-2 py-1 text-gray-400 text-xs">
        Basic blocks
      </div>
      <div className="mt-1 flex flex-col">
        {results.map((result, i) => (
          <ContextMenuItem
            key={result.item.title}
            active={i === hoveredIndex}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(-1)}
            onClick={() => onSelect(result.item.command)}
            {...result.item}
          />
        ))}
      </div>
    </div>
  )
}

/* ---
  CONTEXT MENU ITEM
  And icons
--- */
function ContextMenuItem({ title, label, icon, active, onClick, onMouseEnter, onMouseLeave }: ContextMenuItemProps) {
  return (
    <div
      className={_('py-1 px-2 flex items-center gap-2 cursor-pointer rounded', {
        'bg-gray-100': active,
      })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
      <div className="w-full flex flex-col gap-1">
        <div className="border-b border-gray-300" />
        <div className="w-[75%] border-b border-gray-300" />
        <div className="w-[50%] border-b border-gray-300" />
      </div>
    </ContextMenuIcon>
  )
}

function TodoIcon() {
  return (
    <ContextMenuIcon>
      <div className="w-full h-full flex items-center justify-center gap-1">
        <div className="scale-[85%]">
          <Checkbox
            checked
            onCheck={() => {}}
          />
        </div>
        <div className="flex-grow flex flex-col gap-[0.2rem] -mr-1">
          <div className="border-b border-gray-300" />
          <div className="w-[50%] border-b border-gray-300" />
          <div className="w-[75%] border-b border-gray-300" />
        </div>
      </div>
    </ContextMenuIcon>
  )
}

export default ContextMenu
