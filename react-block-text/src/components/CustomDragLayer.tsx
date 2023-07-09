import { type CSSProperties, useCallback } from 'react'
import type { XYCoord } from 'react-dnd'
import { useDragLayer } from 'react-dnd'

import { BlockContentProps } from '../types'

import blockContentComponents from '../blockContentComponents'

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

function CustomDragLayer() {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
    item: monitor.getItem() as BlockContentProps,
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  const renderItem = useCallback(() => {
    const BlockContentComponent = blockContentComponents[item.type]

    return (
      <BlockContentComponent
        {...item}
        readOnly
      />
    )
  }, [item])

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

export default CustomDragLayer
