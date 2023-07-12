import { useCallback } from 'react'

import type { BlockContentProps } from '../types'

import applyTodoStyle from '../utils/applyTodoStyle'

import Checkbox from './Checkbox'

function BlockContent(props: BlockContentProps) {
  const { item, editorState, readOnly, color, BlockContentText, onItemChange, forceBlurContent } = props

  const handleCheck = useCallback((checked: boolean) => {
    if (readOnly) return

    const nextItem = { ...item, metadata: checked ? 'true' : 'false' }
    const nextEditorState = applyTodoStyle(nextItem, editorState, false)

    onItemChange(nextItem, nextEditorState)

    // Blur the to-do on next render
    forceBlurContent()
  }, [readOnly, item, editorState, onItemChange, forceBlurContent])

  return (
    <div className="h-full flex">
      <div className="flex items-start">
        <Checkbox
          color={color}
          checked={item.metadata === 'true'}
          onCheck={handleCheck}
          className="flex-shrink-0"
          style={{ marginTop: 6 }}
        />
      </div>
      <div
        onClick={props.focusContentAtStart}
        onMouseDown={props.onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText
          {...props}
          fallbackPlaceholder="To-do"
        />
      </div>
    </div>
  )
}

export default BlockContent
