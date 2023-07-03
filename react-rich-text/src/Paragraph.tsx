import { useEffect, useState } from 'react'
import { Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { BlockProps } from './types'

function Paragraph({ value, onChange }: BlockProps) {
  const [editorState, setEditorState] = useState(() => EditorState.createWithContent(convertFromRaw(JSON.parse(value.data))))

  useEffect(() => {
    const data = JSON.stringify(convertToRaw(editorState.getCurrentContent()))

    if (data === value.data) return

    onChange({ ...value, data })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState, onChange])

  return (
    <Editor
      editorState={editorState}
      onChange={setEditorState}
    />
  )
}

export default Paragraph
