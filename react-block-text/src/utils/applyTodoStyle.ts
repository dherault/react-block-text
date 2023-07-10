import { EditorState, Modifier, SelectionState } from 'draft-js'

import { INLINE_STYLES } from '../constants'

function applyTodoStyle(editorState: EditorState, checked: boolean, skipSelection = false) {
  let currentSelection = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const firstBlock = contentState.getFirstBlock()
  const lastBlock = contentState.getLastBlock()
  const selection = SelectionState.createEmpty(firstBlock.getKey()).merge({
    anchorKey: firstBlock.getKey(),
    anchorOffset: 0,
    focusKey: lastBlock.getKey(),
    focusOffset: lastBlock.getText().length,
  })
  const modify = checked ? Modifier.applyInlineStyle : Modifier.removeInlineStyle
  const nextContentState = modify(contentState, selection, INLINE_STYLES.TODO_CHECKED)
  const nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style')

  if (skipSelection) return nextEditorState

  if (currentSelection.getAnchorOffset() !== currentSelection.getFocusOffset()) {
    currentSelection = currentSelection.merge({
      anchorOffset: currentSelection.getFocusOffset(),
    })
  }

  return EditorState.forceSelection(nextEditorState, currentSelection)
}

export default applyTodoStyle
