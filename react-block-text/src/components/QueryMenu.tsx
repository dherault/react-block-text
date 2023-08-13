import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import _ from 'clsx'

import type { BlockCategory, QueryMenuIconProps, QueryMenuItemProps, QueryMenuProps } from '../types'

import { BLOCK_CATEGORY_TO_LABEL, QUERY_MENU_HEIGHT, QUERY_MENU_WIDTH } from '../constants'

const fuseOptions = {
  keys: ['title', 'label', 'shortcuts'],
  threshold: 0.3,
}

function QueryMenu({ pluginsData, query, top, bottom, left, onSelect, onClose }: QueryMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollIntoViewIndex, setScrollIntoViewIndex] = useState(-1)
  const [isHovering, setIsHovering] = useState(false)
  const fuse = useMemo(() => new Fuse(pluginsData, fuseOptions), [pluginsData])
  const results = useMemo(() => query ? fuse.search(query) : pluginsData.map(item => ({ item })), [pluginsData, query, fuse])
  const packs = useMemo(() => Object.keys(BLOCK_CATEGORY_TO_LABEL).map(blockCategory => ({
    blockCategory: blockCategory as BlockCategory,
    results: results.filter(result => result.item.blockCategory === blockCategory),
  })), [results])
  const flatPacks = useMemo(() => packs.reduce((acc, pack) => [...acc, ...pack.results], [] as any[]), [packs])

  /* ---
    ARROW UP, DOWN, ENTER, ESCAPE HANDLERS
  --- */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()

      const nextIndex = (activeIndex + 1) % flatPacks.length

      setActiveIndex(nextIndex)
      setScrollIntoViewIndex(nextIndex)
      setIsHovering(false)

      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      const nextIndex = activeIndex === -1 ? flatPacks.length - 1 : (activeIndex - 1 + flatPacks.length) % flatPacks.length

      setActiveIndex(nextIndex)
      setScrollIntoViewIndex(nextIndex)
      setIsHovering(false)

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (activeIndex !== -1 && flatPacks[activeIndex]) {
        onSelect(flatPacks[activeIndex].item.type)
      }

      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()

      onClose()
    }
  }, [flatPacks, activeIndex, onSelect, onClose])

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
      className="rbt-py-2 rbt-px-1 rbt-bg-white rbt-border rbt-shadow-xl rbt-rounded rbt-absolute rbt-z-50 rbt-overflow-y-auto"
      style={{
        top,
        bottom,
        left,
        width: QUERY_MENU_WIDTH,
        maxHeight: QUERY_MENU_HEIGHT,
      }}
    >
      {results.length > 0 && (
        <div className="rbt-mt-1 rbt-flex rbt-flex-col">
          {packs.map(({ blockCategory, results }) => !!results.length && (
            <Fragment key={blockCategory}>
              <div className="rbt-px-2 rbt-py-1 rbt-text-gray-400 rbt-text-xs">
                {BLOCK_CATEGORY_TO_LABEL[blockCategory]}
              </div>
              {results.map(result => {
                const index = flatPacks.indexOf(result)

                return (
                  <QueryMenuItem
                    key={result.item.title}
                    title={result.item.title}
                    label={result.item.label}
                    icon={result.item.icon}
                    active={index === activeIndex}
                    onMouseEnter={() => isHovering && setActiveIndex(index)}
                    onMouseLeave={() => isHovering && setActiveIndex(-1)}
                    onClick={() => onSelect(result.item.type)}
                    shouldScrollIntoView={index === scrollIntoViewIndex}
                    resetShouldScrollIntoView={() => setScrollIntoViewIndex(-1)}
                  />
                )
              })}
            </Fragment>
          )
          )}
        </div>
      )}
      {results.length === 0 && (
        <div className="rbt-px-2 rbt-py-1 rbt-text-gray-400 rbt-text-xs rbt-select-none">
          No results
        </div>
      )}
    </div>
  )
}

/* ---
  QUERY MENU ITEM
--- */
function QueryMenuItem({
  title,
  label,
  icon,
  active,
  shouldScrollIntoView,
  onClick,
  onMouseEnter,
  onMouseLeave,
  resetShouldScrollIntoView,
}: QueryMenuItemProps) {
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
      className={_('rbt-py-1 rbt-px-2 rbt-flex rbt-items-center rbt-gap-2 rbt-cursor-pointer rbt-rounded', {
        'rbt-bg-gray-100': active,
      })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <QueryMenuIcon>
        {icon}
      </QueryMenuIcon>
      <div>
        <div className="rbt-text-sm">{title}</div>
        <div className="rbt-mt-0.5 rbt-text-xs rbt-text-gray-400">{label}</div>
      </div>
    </div>
  )
}

/* ---
  QUERY MENU ICON
--- */
function QueryMenuIcon({ children }: QueryMenuIconProps) {
  return (
    <div className="rbt-px-2 rbt-py-1 rbt-font-['Arial'] rbt-bg-white rbt-border rbt-rounded rbt-w-12 rbt-h-12 rbt-border-gray-300 rbt-overflow-hidden">
      {children}
    </div>
  )
}

export default QueryMenu
