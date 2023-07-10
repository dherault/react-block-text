import type { EditorState } from 'draft-js'

import type { ReactBlockTextDataItem } from '../types'

import applyTodoStyle from './applyTodoStyle'

function applyStyles(item: ReactBlockTextDataItem, editorState: EditorState) {
  if (item.type === 'todo') return applyTodoStyle(editorState, item.metadata === 'true', true)

  return editorState
}

export default applyStyles
