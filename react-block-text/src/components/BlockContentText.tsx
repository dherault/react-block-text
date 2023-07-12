import { KeyboardEvent, useMemo } from 'react'
import { Editor, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js'

import type { BlockContentProps } from '../types'

import { COMMANDS } from '../constants'

function BlockContentText({
  pluginsData,
  readOnly,
  focused,
  isSelecting,
  editorState,
  placeholder,
  fallbackPlaceholder,
  registerRef,
  onChange,
  onKeyCommand,
  onReturn,
  onUpArrow,
  onDownArrow,
  onFocus,
  onBlur,
  onPaste,
}: BlockContentProps) {
  const styleMap = useMemo(() => (
    pluginsData.reduce((acc, plugin) => ({ ...acc, ...(plugin.styleMap ?? {}) }), {})
  ), [pluginsData])

  return (
    <Editor
      spellCheck
      ref={registerRef}
      readOnly={readOnly}
      editorState={editorState}
      onChange={onChange}
      handleReturn={onReturn}
      onUpArrow={onUpArrow}
      onDownArrow={onDownArrow}
      onFocus={onFocus}
      onBlur={onBlur}
      handlePastedText={onPaste}
      placeholder={readOnly ? isSelecting ? fallbackPlaceholder : '' : focused ? placeholder : fallbackPlaceholder}
      keyBindingFn={bindKey}
      handleKeyCommand={onKeyCommand}
      customStyleMap={styleMap}
    />
  )
}

/* ---
  BIND KEYBOARD SHORTCUTS
--- */
function bindKey(event: KeyboardEvent): string | null {
  if (event.key === 'Tab') {
    event.preventDefault()

    return event.shiftKey ? COMMANDS.OUTDENT : COMMANDS.INDENT
  }

  if (event.key === 's' && KeyBindingUtil.hasCommandModifier(event)) {
    return COMMANDS.SAVE
  }

  return getDefaultKeyBinding(event)
}

export default BlockContentText
