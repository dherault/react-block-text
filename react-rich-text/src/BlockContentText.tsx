import { useCallback } from 'react'
import { Editor, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js'
import _ from 'clsx'

import { BlockContentTextProps } from './types'

const COMMANDS = {
  OPEN_MENU: 'open-menu',
  SAVE: 'save',
}

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
  onReturn,
  onBeforeInput,
  onUpArrow,
  onDownArrow,
  onFocus,
  onBlur,
}: BlockContentTextProps) {
  const handleKeyCommand = useCallback((command: string) => {
    console.log('command', command)

    if (command === COMMANDS.OPEN_MENU) {
      return 'not-handled'
    }

    return 'not-handled'
  }, [])

  return (
    <div className={_('flex-grow transition-all duration-75', {
      'text-4xl font-semibold': type === 'heading1',
      'text-3xl font-semibold': type === 'heading2',
      'text-xl font-semibold': type === 'heading3',
    })}
    >
      <Editor
        readOnly={readOnly}
        ref={registerRef}
        editorState={editorState}
        onChange={onChange}
        handleReturn={onReturn}
        handleBeforeInput={onBeforeInput}
        onUpArrow={onUpArrow}
        onDownArrow={onDownArrow}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={readOnly ? '' : focused ? typeToPlaceholder[type] : ''}
        keyBindingFn={bindKey}
        handleKeyCommand={handleKeyCommand}
      />
    </div>
  )
}

/* ---
  BIND KEYBOARD SHORTCUTS
--- */
function bindKey(event: any): string | null {
  // if (event.keyCode === 191 /* `/` key */ && !KeyBindingUtil.hasCommandModifier(event)) {
  //   return COMMANDS.OPEN_MENU
  // }

  if (event.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(event)) {
    return COMMANDS.SAVE
  }

  return getDefaultKeyBinding(event)
}

export default BlockContentText
