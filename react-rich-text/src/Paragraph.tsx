import { useCallback, useEffect, useRef, useState } from 'react'
import { BlockMap, Editor, EditorState, KeyBindingUtil, convertFromRaw, convertToRaw, getDefaultKeyBinding } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { BlockProps } from './types'

function bindKey(event: any): string | null {
  // console.log('event', event)

  // if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
  //   return 'myeditor-save';
  // }

  if (event.keyCode === 8 /* `backspace` key */ && !KeyBindingUtil.hasCommandModifier(event)) {
    return 'backspace'
  }

  return getDefaultKeyBinding(event)
}

function Paragraph({
  value,
  forceFocus,
  cancelForceFocus,
  onChange,
  onCreateBlock,
  onMergeWithPrevious,
  registerMergeFunction,
}: BlockProps) {
  const editorRef = useRef<Editor>(null)
  const [editorState, setEditorState] = useState(() => EditorState.createWithContent(convertFromRaw(JSON.parse(value.data))))

  const handleReturn = useCallback((event: any) => {
    if (event.shiftKey) return 'not-handled'

    onCreateBlock()

    return 'handled'
  }, [onCreateBlock])

  const handleBeforeInput = useCallback((event: any) => {
    console.log('event', event)

    return 'not-handled'
  }, [])

  const handleKeyCommand = useCallback((command: string) => {
    console.log('command', command)

    if (command === 'backspace' && editorState.isSelectionAtStartOfContent()) {
      onMergeWithPrevious()

      return 'handled'
    }

    return 'not-handled'
  }, [editorState, onMergeWithPrevious])

  const handleArrowUp = useCallback((event: any) => {
    console.log('event', event)
  }, [])

  const handleMergeWithNext = useCallback((blockMap: BlockMap) => {
    console.log('blockMap', blockMap)

    return true
  }, [])

  useEffect(() => {
    const data = JSON.stringify(convertToRaw(editorState.getCurrentContent()))

    if (data === value.data) return

    onChange({ ...value, data })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState, onChange])

  useEffect(() => {
    registerMergeFunction(handleMergeWithNext)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!forceFocus) return

    editorRef.current?.focus()

    cancelForceFocus()
  }, [forceFocus, cancelForceFocus])

  return (
    <div className="border border-blue-500">
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={setEditorState}
        handleReturn={handleReturn}
        handleBeforeInput={handleBeforeInput}
        handleKeyCommand={handleKeyCommand}
        onUpArrow={handleArrowUp}
        keyBindingFn={bindKey}
      />
    </div>
  )
}

export default Paragraph
