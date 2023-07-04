import { useCallback, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Editor, EditorState, SelectionState, convertToRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { ReactRichTextData, ReactRichTextDataItem } from './types'

import Block from './Block'

type ReactRichTextProps = {
  value: ReactRichTextData
  onChange: (value: ReactRichTextData) => void
}

// Not a state to avoid infinite render loops
const editorRefs: Record<string, Editor | null> = {}

function ReactRichText({ value, onChange }: ReactRichTextProps) {
  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({})
  const [focusedIndex, setFocusedIndex] = useState(value.length ? -1 : 0)
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)

  const registerRef = useCallback((id: string, ref: Editor | null) => {
    editorRefs[id] = ref
  }, [])

  const handleAddItem = useCallback((index: number) => {
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
    setHoveredIndex(-1)
  }, [value, onChange])

  const handleReturn = useCallback((index: number, event: any) => {
    if (event.shiftKey) return 'not-handled'

    handleAddItem(index)

    return 'handled'
  }, [handleAddItem])

  const handleUpArrow = useCallback((index: number, event: any) => {
    if (index === 0) return
    if (!editorRefs[value[index - 1]?.id]) return

    const editorState = editorStates[value[index].id]
    const selection = editorState.getSelection()
    const firstline = editorState.getCurrentContent().getFirstBlock().getKey() === selection.getFocusKey()

    if (!firstline) return

    const previousEditorState = editorStates[value[index - 1].id]
    const previousFirstBlock = previousEditorState.getCurrentContent().getLastBlock()
    const anchorOffset = Math.min(selection.getAnchorOffset(), previousFirstBlock.getLength())
    const previousSelection = SelectionState.createEmpty(previousFirstBlock.getKey()).merge({
      anchorOffset,
      focusOffset: anchorOffset,
    })
    const updatedPreviousEditorState = EditorState.forceSelection(previousEditorState, previousSelection)

    setEditorStates(x => ({ ...x, [value[index - 1].id]: updatedPreviousEditorState }))
    setFocusedIndex(index - 1)
    setHoveredIndex(-1)

    event.preventDefault()
  }, [value, editorStates])

  const handleDownArrow = useCallback((index: number, event: any) => {
    if (index === value.length - 1) return
    if (!editorRefs[value[index + 1]?.id]) return

    const editorState = editorStates[value[index].id]
    const selection = editorState.getSelection()
    const lastLine = editorState.getCurrentContent().getLastBlock().getKey() === selection.getFocusKey()

    if (!lastLine) return

    const nextEditorState = editorStates[value[index + 1].id]
    const nextLastBlock = nextEditorState.getCurrentContent().getLastBlock()
    const anchorOffset = Math.min(selection.getAnchorOffset(), nextLastBlock.getLength())
    const nextSelection = SelectionState.createEmpty(nextLastBlock.getKey()).merge({
      anchorOffset,
      focusOffset: anchorOffset,
    })
    const updatedNextEditorState = EditorState.forceSelection(nextEditorState, nextSelection)

    setEditorStates(x => ({ ...x, [value[index + 1].id]: updatedNextEditorState }))
    setFocusedIndex(index + 1)
    setHoveredIndex(-1)

    event.preventDefault()
  }, [value, editorStates])

  const handleBlur = useCallback((index: number) => {
    setFocusedIndex(previous => value.length === 1 ? 0 : previous === index ? -1 : previous)
  }, [value?.length])

  const handleDrag = useCallback((dragIndex: number, hoverIndex: number) => {
    const nextValue = [...value]
    const [dragItem] = nextValue.splice(dragIndex, 1)

    nextValue.splice(hoverIndex, 0, dragItem)

    onChange(nextValue)
    setFocusedIndex(-1)
    setHoveredIndex(-1)
  }, [value, onChange])

  const renderEditor = useCallback((item: ReactRichTextDataItem, index: number) => {
    if (!editorStates[item.id]) return null

    return (
      <Block
        key={item.id}
        id={item.id}
        index={index}
        editorState={editorStates[item.id]}
        hovered={!isDragging && index === hoveredIndex}
        focused={!isDragging && index === focusedIndex}
        registerRef={ref => registerRef(item.id, ref)}
        onAddItem={() => handleAddItem(index)}
        onChange={editorState => setEditorStates(x => ({ ...x, [item.id]: editorState }))}
        onReturn={event => handleReturn(index, event)}
        onUpArrow={event => handleUpArrow(index, event)}
        onDownArrow={event => handleDownArrow(index, event)}
        onFocus={() => setFocusedIndex(index)}
        onBlur={() => handleBlur(index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(previous => previous === index ? -1 : previous)}
        onDragStart={() => setIsDragging(true)}
        onDrag={handleDrag}
        onDragEnd={() => setIsDragging(false)}
      />
    )
  }, [
    editorStates,
    isDragging,
    hoveredIndex,
    focusedIndex,
    handleAddItem,
    handleReturn,
    handleUpArrow,
    handleDownArrow,
    handleBlur,
    handleDrag,
    registerRef,
  ])

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

    console.log('forcing focus')

    setForceFocusIndex(-1)

    if (!editorRefs[value[forceFocusIndex]?.id]) return

    editorRefs[value[forceFocusIndex].id]?.focus()
  }, [value, forceFocusIndex, editorStates])

  if (!Array.isArray(value)) throw new Error('ReactRichText value prop must be an array')

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full">
        {value.map(renderEditor)}
      </div>
    </DndProvider>
  )
}

export default ReactRichText
