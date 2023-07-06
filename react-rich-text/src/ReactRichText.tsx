import { useCallback, useEffect, useMemo, useState } from 'react'
import { nanoid } from 'nanoid'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Editor, EditorState, Modifier, SelectionState, convertFromRaw, convertToRaw } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { BlockContentTextProps, BlockProps, ContextMenuData, ReactRichTextDataItem, ReactRichTextDataItemType, ReactRichTextProps } from './types'

import Block from './Block'
import BlockContentText from './BlockContentText'
import ContextMenu from './ContextMenu'

const blockContentComponents = {
  text: BlockContentText,
  heading1: BlockContentText,
  heading2: BlockContentText,
  heading3: BlockContentText,
}

// Not a state to avoid infinite render loops
const editorRefs: Record<string, Record<string, Editor | null>> = {}

function ReactRichText({ value, readOnly, onChange }: ReactRichTextProps) {
  const instanceId = useMemo(() => nanoid(), [])
  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({})
  const [focusedIndex, setFocusedIndex] = useState(value.length ? -1 : 0)
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData | null>(null)

  /* ---
    REGISTER REF
  --- */
  const registerRef = useCallback((id: string, ref: Editor | null) => {
    if (!editorRefs[instanceId]) {
      editorRefs[instanceId] = {}
    }

    editorRefs[instanceId][id] = ref
  }, [instanceId])

  /* ---
    CREATE TEXT ITEM
  --- */
  const createTextItem = useCallback(() => {
    const editorState = EditorState.createEmpty()
    const item: ReactRichTextDataItem = {
      id: nanoid(),
      type: 'text',
      data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    }

    return { editorState, item }
  }, [])

  /* ---
    ADD ITEM
  --- */
  const handleAddItem = useCallback((index: number) => {
    const { editorState, item } = createTextItem()
    const nextValue = [...value]

    nextValue.splice(index + 1, 0, item)

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange(nextValue)
    setForceFocusIndex(index + 1)
    setHoveredIndex(-1)
  }, [value, onChange, createTextItem])

  /* ---
    DELETE ITEM
  --- */
  const handleDeleteItem = useCallback((index: number) => {
    if (value.length === 1) {
      const itemId = value[0].id

      const { editorState, item } = createTextItem()

      // Prevent flickering due to key change
      item.id = itemId

      setEditorStates({ [item.id]: editorState })
      onChange([item])

      return
    }

    const nextValue = [...value]

    const [item] = nextValue.splice(index, 1)

    onChange(nextValue)
    setHoveredIndex(-1)
    setEditorStates(x => {
      const nextEditorStates = { ...x }

      delete nextEditorStates[item.id]

      return nextEditorStates
    })
  }, [value, onChange, createTextItem])

  /* ---
    CHANGE
  --- */
  const handleChange = useCallback((id: string, editorState: EditorState) => {
    setEditorStates(x => ({ ...x, [id]: editorState }))

    const data = JSON.stringify(convertToRaw(editorState.getCurrentContent()))

    const nextValue = [...value]

    nextValue.find(x => x.id === id)!.data = data

    onChange(nextValue)

    const currentSelection = editorState.getSelection()
    const block = editorState.getCurrentContent().getBlockForKey(currentSelection.getStartKey())
    const text = block.getText()

    const lastWord = text.split(' ').pop() || ''
    const lastWordIncludesCommand = lastWord.includes('/')
    const lastChar = lastWord.slice(-1)

    if (!contextMenuData && lastChar === '/') {
      setContextMenuData(getContextMenuData(instanceId, id))

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
  }, [value, instanceId, contextMenuData, onChange])

  /* ---
    BEFORE INPUT
  --- */
  const handleBeforeInput = useCallback((id: string, chars: string) => {
    console.log()

    return 'not-handled'
  }, [])

  /* ---
    RETURN
  --- */
  const handleReturn = useCallback((index: number, event: any) => {
    if (contextMenuData) {
      event.preventDefault()

      return 'handled'
    }

    if (event.shiftKey) return 'not-handled'

    handleAddItem(index)

    return 'handled'
  }, [contextMenuData, handleAddItem])

  /* ---
    UP ARROW
  --- */
  const handleUpArrow = useCallback((index: number, event: any) => {
    if (index === 0) return
    if (!editorRefs[instanceId]?.[value[index - 1]?.id]) return

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
  }, [value, instanceId, editorStates, contextMenuData])

  /* ---
    DOWN ARROWW
  --- */
  const handleDownArrow = useCallback((index: number, event: any) => {
    if (index === value.length - 1) return
    if (!editorRefs[instanceId]?.[value[index + 1]?.id]) return

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
  }, [value, instanceId, editorStates, contextMenuData])

  /* ---
    BLUR
  --- */
  const handleBlur = useCallback((index: number) => {
    setFocusedIndex(previous => value.length === 1 ? 0 : previous === index ? -1 : previous)
  }, [value?.length])

  /* ---
    DRAG
  --- */
  const handleDrag = useCallback((dragIndex: number, hoverIndex: number) => {
    const nextValue = [...value]
    const [dragItem] = nextValue.splice(dragIndex, 1)

    nextValue.splice(hoverIndex, 0, dragItem)

    onChange(nextValue)
    setFocusedIndex(-1)
    setHoveredIndex(-1)
  }, [value, onChange])

  /* ---
    CONTEXT MENU SELECT
  --- */
  const handleContextMenuSelect = useCallback((command: ReactRichTextDataItemType) => {
    console.log('command', command)
    setContextMenuData(null)

    const { id } = contextMenuData!
    const item = value.find(x => x.id === id)

    if (!item) return
    if (item.type === command) return

    console.log('change type', command)

    const editorState = editorStates[id]
    const currentSelection = editorState.getSelection()
    const blockKey = currentSelection.getStartKey()
    const block = editorState.getCurrentContent().getBlockForKey(blockKey)
    const originalOffset = currentSelection.getFocusOffset()
    let blockText = block.getText()
    let offset = originalOffset

    while (blockText[offset - 1] !== '/') {
      offset--
      blockText = blockText.slice(0, -1)
    }

    // Remove '/'
    blockText = blockText.slice(0, -1)
    offset--

    const selectionStateToRemove = SelectionState.createEmpty(blockKey).merge({
      focusOffset: originalOffset,
      anchorOffset: offset,
    })
    const selectionStateToApply = SelectionState.createEmpty(blockKey).merge({
      focusOffset: offset,
      anchorOffset: offset,
    })
    const nextContent = Modifier.removeRange(editorState.getCurrentContent(), selectionStateToRemove, 'backward')
    let nextEditorState = EditorState.push(editorState, nextContent, 'change-block-data')

    nextEditorState = EditorState.forceSelection(nextEditorState, selectionStateToApply)

    setEditorStates(x => ({ ...x, [id]: nextEditorState }))

    const nextValue = [...value]
    const data = JSON.stringify(convertToRaw(nextEditorState.getCurrentContent()))

    nextValue.splice(nextValue.indexOf(item), 1, { ...item, type: command, data })

    onChange(nextValue)
  }, [value, editorStates, contextMenuData, onChange])

  /* ---
    RENDER EDITOR
  --- */
  const renderEditor = useCallback((item: ReactRichTextDataItem, index: number) => {
    if (!editorStates[item.id]) return null

    const blockProps: Omit<BlockProps, 'children'> = {
      id: item.id,
      type: item.type,
      index,
      readOnly: !!readOnly,
      hovered: !isDragging && index === hoveredIndex,
      onAddItem: () => handleAddItem(index),
      onMouseEnter: () => setHoveredIndex(index),
      onMouseLeave: () => setHoveredIndex(previous => previous === index ? -1 : previous),
      onDragStart: () => setIsDragging(true),
      onDrag: handleDrag,
      onDragEnd: () => setIsDragging(false),
      onDelete: () => handleDeleteItem(index),
    }

    const blockContentProps: BlockContentTextProps = {
      type: item.type,
      readOnly: !!readOnly,
      editorState: editorStates[item.id],
      focused: !isDragging && index === focusedIndex,
      registerRef: ref => registerRef(item.id, ref),
      onChange: editorState => handleChange(item.id, editorState),
      onBeforeInput: chars => handleBeforeInput(item.id, chars),
      onReturn: event => handleReturn(index, event),
      onUpArrow: event => handleUpArrow(index, event),
      onDownArrow: event => handleDownArrow(index, event),
      onFocus: () => setFocusedIndex(index),
      onBlur: () => handleBlur(index),
    }

    const BlockContent = blockContentComponents[item.type]

    return (
      <Block
        key={item.id}
        {...blockProps}
      >
        <BlockContent {...blockContentProps} />
      </Block>
    )
  }, [
    readOnly,
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
    handleDeleteItem,
    registerRef,
  ])

  /* ---
    NO VALUE LENGTH
  --- */
  useEffect(() => {
    if (value.length) return
    if (readOnly) return

    const editorState = EditorState.createEmpty()
    const item: ReactRichTextDataItem = {
      id: nanoid(),
      type: 'text',
      data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    }

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange([item])
  }, [value, readOnly, onChange])

  /* ---
    READ ONLY UPDATE
  --- */
  useEffect(() => {
    if (!readOnly) return

    const nextEditorStates = value.map(item => ({
      id: item.id,
      editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(item.data))),
    }))
    .reduce((acc, item) => ({ ...acc, [item.id]: item.editorState }), {})

    setEditorStates(nextEditorStates)
  }, [readOnly, value])

  /* ---
    FORCE FOCUS
  --- */
  useEffect(() => {
    if (readOnly) return
    if (forceFocusIndex === -1) return

    console.log('forcing focus')

    setForceFocusIndex(-1)

    if (!editorRefs[instanceId]?.[value[forceFocusIndex]?.id]) return

    editorRefs[instanceId][value[forceFocusIndex].id]?.focus()
  }, [value, readOnly, instanceId, forceFocusIndex, editorStates])

  /* ---
    MAIN RETURN STATEMENT
  --- */
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

/* ---
  GET CONTEXT MENU DATA
--- */
function getContextMenuData(instanceId: string, id: string): ContextMenuData | null {
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

  const editorRef = editorRefs[instanceId][id]

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
