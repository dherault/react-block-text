import { KeyboardEvent } from 'react'
import { Editor, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js'
import _ from 'clsx'

import { BlockContentTextProps } from '../types'

import { COMMANDS } from '../constants'

const typeToPlaceholder = {
  text: "Start typing or press '/' for commands",
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
} as const

function BlockContentText({
  readOnly,
  type,
  focused,
  editorState,
  registerRef,
  onChange,
  onKeyCommand,
  onReturn,
  onUpArrow,
  onDownArrow,
  onFocus,
  onBlur,
  onPaste,
}: BlockContentTextProps) {
  /* ---
    MAIN RETURN STATEMENT
  --- */
  return (
    <div
      className={_({
        'text-3xl font-semibold': type === 'heading1',
        'text-2xl font-semibold': type === 'heading2',
        'text-xl font-semibold': type === 'heading3',
      })}
    >
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
        placeholder={readOnly ? '' : focused ? typeToPlaceholder[type] : ''}
        keyBindingFn={bindKey}
        handleKeyCommand={onKeyCommand}
      />
    </div>
  )
}

/* ---
  BIND KEYBOARD SHORTCUTS
--- */
function bindKey(event: KeyboardEvent): string | null {
  if (event.key === 's' && KeyBindingUtil.hasCommandModifier(event)) {
    return COMMANDS.SAVE
  }

  return getDefaultKeyBinding(event)
}

export default BlockContentText
