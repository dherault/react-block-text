import { useCallback, useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import { Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js'

// import { MergeFunction, ReactRichTextData, ReactRichTextDataItem } from './types'
import { ReactRichTextData, ReactRichTextDataItem } from './types'

type ReactRichTextProps = {
  value: ReactRichTextData
  onChange: (value: ReactRichTextData) => void
}

// Not a state to avoid infinite render loops
const editorRefs: Record<string, Editor | null> = {}

function ReactRichText({ value, onChange }: ReactRichTextProps) {
  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({})
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  // const [mergeRegistry, setMergeRegistry] = useState<Record<string, MergeFunction>>({})

  // const createItemData = useCallback(() => ({
  //   id: nanoid(),
  //   type: 'paragraph' as const,
  //   data: JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent())),
  // }), [])

  const registerRef = useCallback((id: string, ref: Editor | null) => {
    editorRefs[id] = ref
  }, [])

  const handleReturn = useCallback((index: number, event: any) => {
    if (event.shiftKey) return 'not-handled'

    const editorState = EditorState.createEmpty()
    const item: ReactRichTextDataItem = {
      id: nanoid(),
      data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    }
    const nextValue = [...value]

    nextValue.splice(index + 1, 0, item)

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange(nextValue)
    setForceFocusIndex(index + 1)

    return 'handled'
  }, [value, onChange])

  const renderEditor = useCallback((item: ReactRichTextDataItem, index: number) => {
    if (!editorStates[item.id]) return null

    return (
      <div
        className="w-full border-b border-blue-400"
        key={item.id}
      >
        <Editor
          ref={ref => registerRef(item.id, ref)}
          editorState={editorStates[item.id]}
          onChange={editorState => setEditorStates(x => ({ ...x, [item.id]: editorState }))}
          handleReturn={event => handleReturn(index, event)}
        />
      </div>
    )
  }, [editorStates, handleReturn, registerRef])

  useEffect(() => {
    if (value.length) return

    const editorState = EditorState.createEmpty()
    const item: ReactRichTextDataItem = {
      id: nanoid(),
      data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    }

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange([item])
  }, [value, onChange])

  useEffect(() => {
    if (forceFocusIndex === -1) return

    setForceFocusIndex(-1)

    if (!editorRefs[value[forceFocusIndex]?.id]) return

    editorRefs[value[forceFocusIndex].id]?.focus()
  }, [value, forceFocusIndex])

  // const handleChange = useCallback((index: number, item: ReactRichTextDataItem) => {
  //   const nextValue = [...value]

  //   nextValue[index] = item

  //   onChange(nextValue)
  // }, [value, onChange])

  // const handleCreateBlock = useCallback((index: number) => {
  //   const nextValue = [...value]

  //   nextValue.splice(index + 1, 0, lastBlockData)

  //   onChange(nextValue)
  //   setForceFocusIndex(index + 1)
  // }, [value, lastBlockData, onChange])

  // const handleRegisterMergeFunction = useCallback((id: string, fn: MergeFunction) => {
  //   setMergeRegistry(x => ({ ...x, [id]: fn }))
  // }, [])

  // const handleMergeWithPrevious = useCallback((index: number) => {
  //   if (index === 0) return false

  //   const item = value[index]
  //   const previousItem = value[index - 1]

  //   if (item.type === 'paragraph' && previousItem.type === 'paragraph') {
  //     const itemData = convertFromRaw(JSON.parse(item.data)).getBlockMap()

  //     return !!mergeRegistry[previousItem.id]?.(itemData)
  //   }

  //   // ...
  //   return false
  // }, [value, mergeRegistry])

  if (!Array.isArray(value)) throw new Error('ReactRichText value prop must be an array')

  return (
    <div className="w-full border">
      {value.map(renderEditor)}
    </div>
  )
}

export default ReactRichText
