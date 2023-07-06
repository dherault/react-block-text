import { useCallback, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Editor, EditorState, SelectionState, convertToRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { BlockProps, ContextMenuData, ReactRichTextDataItem, ReactRichTextProps } from './types'

import Block from './Block'
import ContextMenu from './ContextMenu'

// Not a state to avoid infinite render loops
const editorRefs: Record<string, Editor | null> = {}

function ReactRichText({ value, onChange }: ReactRichTextProps) {
  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({})
  const [focusedIndex, setFocusedIndex] = useState(value.length ? -1 : 0)
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData | null>(null)

  const registerRef = useCallback((id: string, ref: Editor | null) => {
    editorRefs[id] = ref
  }, [])

  const handleAddItem = useCallback((index: number) => {
    const editorState = EditorState.createEmpty()
    const item: ReactRichTextDataItem = {
      id: nanoid(),
      type: 'text',
      data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    }
    const nextValue = [...value]

    nextValue.splice(index + 1, 0, item)

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange(nextValue)
    setForceFocusIndex(index + 1)
    setHoveredIndex(-1)
  }, [value, onChange])

  const handleChange = useCallback((id: string, editorState: EditorState) => {
    setEditorStates(x => ({ ...x, [id]: editorState }))

    const currentSelection = editorState.getSelection()
    const block = editorState.getCurrentContent().getBlockForKey(currentSelection.getStartKey())
    const text = block.getText()

    const lastWord = text.split(' ').pop() || ''
    const lastWordIncludesCommand = lastWord.includes('/')
    const lastChar = lastWord.slice(-1)

    if (!contextMenuData && lastChar === '/') {
      setContextMenuData(getContextMenuData(id))

      return
    }

    if (contextMenuData && !lastWordIncludesCommand) {
      setContextMenuData(null)

      return
    }

    if (contextMenuData && lastWordIncludesCommand) {
      const query = lastWord.slice(lastWord.lastIndexOf('/') + 1)

      setContextMenuData(x => x ? ({ ...x!, query }) : null) // Due to side effects the ternary is mandatory here
    }
  }, [contextMenuData])

  const handleBeforeInput = useCallback((id: string, chars: string) => {
    console.log()

    return 'not-handled'
  }, [])

  const handleReturn = useCallback((index: number, event: any) => {
    if (contextMenuData) {
      event.preventDefault()

      return 'handled'
    }

    if (event.shiftKey) return 'not-handled'

    handleAddItem(index)

    return 'handled'
  }, [contextMenuData, handleAddItem])

  const handleUpArrow = useCallback((index: number, event: any) => {
    if (index === 0) return
    if (!editorRefs[value[index - 1]?.id]) return

    if (contextMenuData) {
      event.preventDefault()

      return
    }

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
  }, [value, editorStates, contextMenuData])

  const handleDownArrow = useCallback((index: number, event: any) => {
    if (index === value.length - 1) return
    if (!editorRefs[value[index + 1]?.id]) return

    if (contextMenuData) {
      event.preventDefault()

      return
    }

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
  }, [value, editorStates, contextMenuData])

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

  const handleContextMenuSelect = useCallback((command: string) => {
    console.log('command', command)
    setContextMenuData(null)

    const { id } = contextMenuData!
    const item = value.find(x => x.id === id)

    if (!item) return
    if (item.type === command) return

    console.log('change type', command)
  }, [value, contextMenuData])

  const renderEditor = useCallback((item: ReactRichTextDataItem, index: number) => {
    if (!editorStates[item.id]) return null

    const props: BlockProps = {
      id: item.id,
      index,
      editorState: editorStates[item.id],
      hovered: !isDragging && index === hoveredIndex,
      focused: !isDragging && index === focusedIndex,
      registerRef: ref => registerRef(item.id, ref),
      onAddItem: () => handleAddItem(index),
      onChange: editorState => handleChange(item.id, editorState),
      onBeforeInput: chars => handleBeforeInput(item.id, chars),
      onReturn: event => handleReturn(index, event),
      onUpArrow: event => handleUpArrow(index, event),
      onDownArrow: event => handleDownArrow(index, event),
      onFocus: () => setFocusedIndex(index),
      onBlur: () => handleBlur(index),
      onMouseEnter: () => setHoveredIndex(index),
      onMouseLeave: () => setHoveredIndex(previous => previous === index ? -1 : previous),
      onDragStart: () => setIsDragging(true),
      onDrag: handleDrag,
      onDragEnd: () => setIsDragging(false),
    }

    return (
      <Block
        key={item.id}
        {...props}
      />
    )
  }, [
    editorStates,
    isDragging,
    hoveredIndex,
    focusedIndex,
    handleAddItem,
    handleChange,
    handleBeforeInput,
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
      type: 'text',
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
      <div className="w-full relative">
        {value.map(renderEditor)}
        {!!contextMenuData && (
          <ContextMenu
            query={contextMenuData.query}
            top={contextMenuData.top}
            left={contextMenuData.left}
            onClose={() => setContextMenuData(null)}
            onSelect={handleContextMenuSelect}
          />
        )}
      </div>
    </DndProvider>
  )
}

function getContextMenuData(id: string): ContextMenuData | null {
  const range = window.getSelection()?.getRangeAt(0)?.cloneRange()

  if (!range) return null

  range.collapse(true)

  const rects = range.getClientRects()

  if (rects.length) {
    return {
      id,
      query: '',
      top: rects[0].bottom + 4,
      left: rects[0].right,
    }
  }

  const editorRef = editorRefs[id]

  if (!editorRef) return null

  const editorRects = editorRef.editorContainer?.getClientRects()

  if (!editorRects?.length) return null

  return {
    id,
    query: '',
    top: editorRects[0].top + 24,
    left: editorRects[0].left,
  }
}

export default ReactRichText
