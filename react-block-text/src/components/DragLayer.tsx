import { type CSSProperties, useCallback } from 'react'
import type { XYCoord } from 'react-dnd'
import { useDragLayer } from 'react-dnd'

import type { BlockProps, DragLayerProps } from '../types'

import Block from './Block'

const layerStyle: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

function getPreviewStyle(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x + 19}px, ${y - 3}px)`

  return {
    transform,
    WebkitTransform: transform,
    opacity: 0.4,
  }
}

function DragLayer({ pluginsData, blockProps }: DragLayerProps) {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as BlockProps,
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
  }))

  const renderSingleItem = useCallback((props: Omit<BlockProps, 'children'>, noPadding = false) => {
    const plugin = pluginsData.find(plugin => plugin.type === props.item.type)

    if (!plugin) return null

    const { BlockContent } = plugin

    return (
      <Block
        {...props}
        key={props.item.id}
        readOnly
        selected={false}
        paddingLeft={0}
        noPadding={noPadding}
        isDraggingTop={null}
      >
        <BlockContent
          {...props.blockContentProps}
          readOnly
        />
      </Block>
    )
  }, [pluginsData])

  const renderPreview = useCallback(() => {
    if (!blockProps) return renderSingleItem(item, true)

    return blockProps.map(props => renderSingleItem(props))
  }, [blockProps, item, renderSingleItem])

  if (!isDragging) return null

  return (
    <div style={layerStyle}>
      <div
        style={getPreviewStyle(initialOffset, currentOffset)}
      >
        {renderPreview()}
      </div>
    </div>
  )
}

export default DragLayer
