import { type EditorState, convertToRaw } from 'draft-js'

import type { ReactBlockTextDataItem } from '../types'

function appendItemData(item: Partial<ReactBlockTextDataItem>, editorState: EditorState) {
  return {
    metadata: '',
    ...item,
    data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
  } as ReactBlockTextDataItem
}

export default appendItemData
