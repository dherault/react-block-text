import { type CSSProperties, useCallback } from 'react'
import type { XYCoord } from 'react-dnd'
import { useDragLayer } from 'react-dnd'

import type { BlockContentProps, DragLayerProps } from '../types'

const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`

  return {
    transform,
    WebkitTransform: transform,
    paddingLeft: 22,
    opacity: 0.4,
  }
}

function DragLayer({ plugins }: DragLayerProps) {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as BlockContentProps,
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
  }))

  const renderItem = useCallback(() => {
    const plugin = plugins.find(plugin => plugin.type === item.item.type)

    if (!plugin) return null

    const { BlockContent } = plugin

    return (
      <BlockContent
        {...item}
        readOnly
      />
    )
  }, [plugins, item])

  if (!isDragging) {
    return null
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(initialOffset, currentOffset)}
      >
        {renderItem()}
      </div>
    </div>
  )
}

export default DragLayer
