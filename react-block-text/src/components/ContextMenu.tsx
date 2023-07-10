import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import _ from 'clsx'

import type { ContextMenuIconProps, ContextMenuItemProps, ContextMenuProps } from '../types'

import { CONTEXT_MENU_HEIGHT } from '../constants'

const fuseOptions = {
  keys: ['title', 'label', 'shortcuts'],
  threshold: 0.3,
}

function ContextMenu({ plugins, query, top, bottom, left, onSelect, onClose }: ContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollIntoViewIndex, setScrollIntoViewIndex] = useState(-1)
  const [isHovering, setIsHovering] = useState(false)
  const fuse = useMemo(() => new Fuse(plugins, fuseOptions), [plugins])
  const results = useMemo(() => query ? fuse.search(query) : plugins.map(item => ({ item })), [plugins, query, fuse])

  /* ---
    ARROW UP, DOWN, ENTER, ESCAPE HANDLERS
  --- */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()

      const nextIndex = (activeIndex + 1) % results.length

      setActiveIndex(nextIndex)
      setScrollIntoViewIndex(nextIndex)
      setIsHovering(false)

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      const nextIndex = activeIndex === -1 ? results.length - 1 : (activeIndex - 1 + results.length) % results.length

      setActiveIndex(nextIndex)
      setScrollIntoViewIndex(nextIndex)
      setIsHovering(false)

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (activeIndex !== -1 && results[activeIndex]) {
        onSelect(results[activeIndex].item.type)
      }

      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()

      onClose()
    }
  }, [results, activeIndex, onSelect, onClose])

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
      onMouseMove={() => setIsHovering(true)}
      className="py-2 px-1 bg-white border shadow-xl rounded absolute z-50 overflow-y-auto"
      style={{
        top,
        bottom,
        left,
        maxHeight: CONTEXT_MENU_HEIGHT,
      }}
    >
      <div className="px-2 py-1 text-gray-400 text-xs">
        Basic blocks
      </div>
      <div className="mt-1 flex flex-col">
        {results.map((result, i) => (
          <ContextMenuItem
            key={result.item.title}
            title={result.item.title}
            label={result.item.label}
            icon={result.item.icon}
            active={i === activeIndex}
            onMouseEnter={() => isHovering && setActiveIndex(i)}
            onMouseLeave={() => isHovering && setActiveIndex(-1)}
            onClick={() => onSelect(result.item.type)}
            shouldScrollIntoView={i === scrollIntoViewIndex}
            resetShouldScrollIntoView={() => setScrollIntoViewIndex(-1)}
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
function ContextMenuItem({
  title,
  label,
  icon,
  active,
  shouldScrollIntoView,
  onClick,
  onMouseEnter,
  onMouseLeave,
  resetShouldScrollIntoView,
}: ContextMenuItemProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldScrollIntoView) return
    if (!rootRef.current) return

    rootRef.current.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    })

    resetShouldScrollIntoView()
  }, [shouldScrollIntoView, resetShouldScrollIntoView])

  return (
    <div
      ref={rootRef}
      className={_('py-1 px-2 flex items-center gap-2 cursor-pointer rounded', {
        'bg-gray-100': active,
      })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ContextMenuIcon>
        {icon}
      </ContextMenuIcon>
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

export default ContextMenu
