import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
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
  previewElement: HTMLDivElement | null,
  dragElement: HTMLDivElement | null,
) {
  if (!initialOffset || !currentOffset || !previewElement || !dragElement) {
    return {
      opacity: 0,
      transition: 'opacity 150ms linear',
    }
  }

  // `previewTop` and `dragTop` allow offseting the preview by the top of the dragged block
  // In case multiple blocks are dragged, so that the preview stays aligned with the drag handle
  const { top: previewTop } = previewElement.getBoundingClientRect()
  const { top: dragTop } = dragElement.getBoundingClientRect()
  const { x, y } = currentOffset
  const transform = `translate(${x + 19}px, ${y - dragTop + previewTop - 3}px)`

  return {
    transform,
    WebkitTransform: transform,
    opacity: 0.4,
    transition: 'opacity 150ms linear',
  }
}

function DragLayer({ pluginsData, blockProps, dragIndex }: DragLayerProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [, forceRefresh] = useState(false)

  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as BlockProps,
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
  }))

  const renderSingleItem = useCallback((props: Omit<BlockProps, 'children'>, index: number, noPadding = false) => {
    const plugin = pluginsData.find(plugin => plugin.type === props.item.type)

    if (!plugin) return null

    const { BlockContent } = plugin

    return (
      <div
        key={props.item.id}
        ref={index === dragIndex ? dragRef : null}
      >
        <Block
          {...props}
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
      </div>
    )
  }, [pluginsData, dragIndex])

  const renderPreview = useCallback(() => {
    if (!blockProps.length) return renderSingleItem(item, 0, true)

    return blockProps.map((props, i) => renderSingleItem(props, i))
  }, [blockProps, item, renderSingleItem])

  useEffect(() => {
    if (!isDragging) return

    setTimeout(() => {
      forceRefresh(x => !x)
    }, 0)
  }, [isDragging])

  if (!isDragging) return null

  return (
    <div style={layerStyle}>
      <div
        ref={previewRef}
        style={getPreviewStyle(initialOffset, currentOffset, previewRef.current, dragRef.current)}
      >
        {renderPreview()}
      </div>
    </div>
  )
}

export default DragLayer
