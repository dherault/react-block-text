import '../index.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  ContentBlock,
  ContentState,
  Editor,
  EditorState,
  Modifier,
  SelectionState,
  convertFromRaw,
  convertToRaw,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
// @ts-expect-error
import ignoreWarnings from 'ignore-warnings'

import {
  BlockContentProps,
  BlockProps,
  ContextMenuData,
  ReactBlockTextDataItem,
  ReactBlockTextDataItemType,
  ReactBlockTextProps,
  ReactBlockTextSelection,
} from '../types'

import {
  ADD_ITEM_BUTTON_ID,
  COMMANDS,
  CONTEXT_MENU_HEIGHT,
  DEFAULT_PRIMARY_COLOR,
  DRAG_ITEM_BUTTON_ID,
  INLINE_STYLES,
  VERSION,
} from '../constants'

import PrimaryColorContext from '../context/PrimaryColorContext'

import usePrevious from '../hooks/usePrevious'

import hasParentWithId from '../utils/hasParentWithId'

import Block from './Block'
import BlockContentText from './BlockContentText'
import BlockContentTodo from './BlockContentTodo'
import BlockContentList from './BlockContentList'
import BlockContentQuote from './BlockContentQuote'
import ContextMenu from './ContextMenu'

// Remove onUpArrow and onDownArrow deprecation warnings
ignoreWarnings([
  'Supplying an `onUpArrow`',
  'Supplying an `onDownArrow`',
])

const blockContentComponents = {
  text: BlockContentText,
  heading1: BlockContentText,
  heading2: BlockContentText,
  heading3: BlockContentText,
  todo: BlockContentTodo,
  'bulleted-list': BlockContentList,
  'numbered-list': BlockContentList,
  quote: BlockContentQuote,
}

const convertibleToTextTypes = ['todo', 'bulleted-list', 'numbered-list', 'quote']

// Not a state to avoid infinite render loops
// instanceId -> itemId -> editorRef
const editorRefs: Record<string, Record<string, Editor | null>> = {}

// Not a state for performance reasons
let isSelecting = false
let lastForceFocusTime = 0

function ReactBlockText({
  value: rawValue,
  readOnly,
  paddingLeft,
  primaryColor,
  onChange: rawOnChange,
  onSave,
}: ReactBlockTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  const value = useMemo<ReactBlockTextDataItem[]>(() => {
    try {
      return JSON.parse(rawValue)
    }
    catch (error) {
      return []
    }
  }, [rawValue])

  const onChange = useCallback((nextValue: ReactBlockTextDataItem[]) => {
    rawOnChange(JSON.stringify(nextValue))
  }, [rawOnChange])

  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({})
  const [focusedIndex, setFocusedIndex] = useState(value.length ? -1 : 0)
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  const [forceBlurIndex, setForceBlurIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false)
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData | null>(null)
  const [selection, setSelection] = useState<ReactBlockTextSelection | null>(null)
  const [refresh, forceRefresh] = useState(false)
  const [shouldTriggerRefresh, setShouldTriggerRefresh] = useState(false)

  const previousEditorStates = usePrevious(editorStates, refresh || shouldTriggerRefresh)

  // A unique instance id for the sake of editorRefs, so multiple instances can be used on the same page
  const instanceId = useMemo(() => nanoid(), [])

  // TODO
  const last = Object.values(previousEditorStates).pop()
  console.log(last?.getSelection().getFocusOffset(), refresh)

  /* ---
    REGISTER REF
    We associate each editor with an id so that we can access it later
  --- */
  const registerRef = useCallback((id: string, ref: Editor | null) => {
    if (!ref) return
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
    const item = appendItemData(
      {
        reactBlockTextVersion: VERSION,
        id: nanoid(),
        type: 'text',
      },
      editorState
    )

    return { editorState, item }
  }, [])

  /* ---
    ADD ITEM
    Add a text item to the editor
  --- */
  const handleAddItem = useCallback((index: number) => {
    const { editorState, item } = createTextItem()
    const nextValue = [...value]

    nextValue.splice(index + 1, 0, item)

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange(nextValue)
    setHoveredIndex(index + 1)
    setFocusedIndex(index + 1)
    setForceFocusIndex(index + 1)
  }, [value, onChange, createTextItem])

  /* ---
    DELETE ITEM
  --- */
  const handleDeleteItem = useCallback((index: number) => {
    // Delete only item
    if (value.length === 1) {
      const itemId = value[0].id

      const { editorState, item } = createTextItem()

      // Prevent flickering due to key change
      item.id = itemId

      setEditorStates({ [item.id]: editorState })
      onChange([item])

      return
    }

    // Delete any item
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
    DUPLICATE ITEM
  --- */
  const handleDuplicateItem = useCallback((index: number) => {
    const item = value[index]

    if (!item) return

    const editorState = editorStates[item.id]

    if (!editorState) return

    const nextItem = { ...item, id: nanoid() }

    value.splice(index + 1, 0, nextItem)

    onChange(value)
    setEditorStates(x => ({ ...x, [nextItem.id]: editorState }))
    setHoveredIndex(index + 1)
    setFocusedIndex(index + 1)
  }, [value, editorStates, onChange])

  /* ---
    CHANGE
    Handle editor value change
  --- */
  const handleChange = useCallback((id: string, editorState: EditorState) => {
    const index = value.findIndex(x => x.id === id)

    if (index === -1) return

    const item = value[index]
    let data = JSON.stringify(convertToRaw(editorState.getCurrentContent()))

    if (data === item.data) {
      setEditorStates(x => ({ ...x, [id]: editorState }))

      return
    }

    let nextEditorState = editorState

    if (item.type === 'todo') {
      nextEditorState = applyTodoStyle(nextEditorState, item.metadata === 'true')
    }

    setEditorStates(x => ({ ...x, [id]: nextEditorState }))

    data = JSON.stringify(convertToRaw(nextEditorState.getCurrentContent()))

    if (data === item.data) return

    const nextValue = [...value]

    nextValue[index] = { ...nextValue[index], data }

    onChange(nextValue)

    const currentSelection = nextEditorState.getSelection()
    const block = nextEditorState.getCurrentContent().getBlockForKey(currentSelection.getStartKey())
    const text = block.getText()
    const lastWord = text.split(' ').pop() || ''
    const lastWordIncludesCommand = lastWord.includes('/')
    const lastChar = lastWord.slice(-1)

    // Toggle context menu with `/` command
    if (!contextMenuData && lastChar === '/') {
      setContextMenuData(getContextMenuData(instanceId, id, rootRef.current!))

      return
    }

    if (contextMenuData && !lastWordIncludesCommand) {
      setContextMenuData(null)

      return
    }

    if (contextMenuData && lastWordIncludesCommand) {
      const query = lastWord.slice(lastWord.lastIndexOf('/') + 1)

      setContextMenuData(x => x ? ({ ...x, query }) : null) // Due to side effects the ternary is mandatory here
    }
  }, [value, instanceId, contextMenuData, onChange])

  /* ---
    TO-DO CHECK
  --- */
  const handleCheck = useCallback((index: number, checked: boolean) => {
    if (readOnly) return

    const item = value[index]

    if (!item) return

    const editorState = editorStates[item.id]

    if (!editorState) return

    const nextEditorState = applyTodoStyle(editorState, checked)

    setEditorStates(x => ({ ...x, [item.id]: nextEditorState }))

    const nextValue = [...value]

    nextValue[index] = { ...nextValue[index], metadata: checked ? 'true' : 'false' }

    onChange(nextValue)

    // Blur the to-do on next render
    setForceBlurIndex(index)
  }, [value, readOnly, editorStates, onChange])

  /* ---
    UP ARROW
    Handle up arrow, to move between editor instances
    Although this causes a warning in the console (suppressed), I found it to be the only way to make it work
  --- */
  const handleUpArrow = useCallback((index: number, event: any) => {
    if (index === 0) return

    if (contextMenuData) {
      event.preventDefault()

      return
    }

    const editorState = editorStates[value[index]?.id]
    const previousEditorState = editorStates[value[index - 1]?.id]

    if (!(editorState && previousEditorState)) return

    const selection = editorState.getSelection()
    const firstBlock = editorState.getCurrentContent().getFirstBlock()
    const isFirstBlock = firstBlock.getKey() === selection.getFocusKey()

    if (!isFirstBlock) return
    // If on the first block, we focus the previous block
    // The caret position must be conserved

    const firstBlockText = firstBlock.getText()
    const indexOfCarriageReturn = firstBlockText.indexOf('\n')
    const focusOffset = selection.getFocusOffset()

    // If within a multiline block and not on the first line, we do nothing
    if (indexOfCarriageReturn !== -1 && focusOffset > indexOfCarriageReturn) return

    // Find the position of the caret and apply the selection to the previous block
    const previousLastBlock = previousEditorState.getCurrentContent().getLastBlock()
    const lines = previousLastBlock.getText().split('\n')
    const lastLine = lines.pop() ?? ''
    const otherLinesLength = lines.length ? lines.join(' ').length + 1 : 0 // Space replaces carriage return
    const offset = otherLinesLength + Math.min(focusOffset, lastLine.length)
    const previousSelection = SelectionState.createEmpty(previousLastBlock.getKey()).merge({
      anchorOffset: offset,
      focusOffset: offset,
    })
    const updatedPreviousEditorState = EditorState.forceSelection(previousEditorState, previousSelection)

    setEditorStates(x => ({ ...x, [value[index - 1].id]: updatedPreviousEditorState }))
    setFocusedIndex(index - 1)
    setHoveredIndex(-1)

    event.preventDefault()
  }, [value, editorStates, contextMenuData])

  /* ---
    DOWN ARROW
    Handle down arrow, to move between editor instances
    Although this causes a warning in the console (suppressed), I found it to be the only way to make it work
  --- */
  const handleDownArrow = useCallback((index: number, event: any) => {
    if (index === value.length - 1) return

    if (contextMenuData) {
      event.preventDefault()

      return
    }

    const editorState = editorStates[value[index]?.id]
    const nextEditorState = editorStates[value[index + 1]?.id]

    if (!(editorState && nextEditorState)) return

    const selection = editorState.getSelection()
    const lastBlock = editorState.getCurrentContent().getLastBlock()
    const isLastBlock = lastBlock.getKey() === selection.getFocusKey()

    if (!isLastBlock) return
    // If on the last block, we focus the next block
    // The caret position must be conserved

    const lastBlockText = lastBlock.getText()
    const indexOfLastCarriageReturn = lastBlockText.lastIndexOf('\n')
    const focusOffset = selection.getFocusOffset()

    // If within a multiline block and not on the last line, we do nothing
    if (indexOfLastCarriageReturn !== -1 && focusOffset <= indexOfLastCarriageReturn) return

    // Find the position of the caret and apply the selection to the previous block
    const nextFirstBlock = nextEditorState.getCurrentContent().getFirstBlock()
    const firstLine = nextFirstBlock.getText().split('\n')[0] ?? ''
    const offset = Math.min(focusOffset - indexOfLastCarriageReturn - 1, firstLine.length)
    const nextSelection = SelectionState.createEmpty(nextFirstBlock.getKey()).merge({
      anchorOffset: offset,
      focusOffset: offset,
    })
    const updatedNextEditorState = EditorState.forceSelection(nextEditorState, nextSelection)

    setEditorStates(x => ({ ...x, [value[index + 1].id]: updatedNextEditorState }))
    setFocusedIndex(index + 1)
    setHoveredIndex(-1)

    event.preventDefault()
  }, [value, editorStates, contextMenuData])

  /* ---
    RETURN
    Handle carriage return
    If necessary, split block into two
  --- */
  const handleReturn = useCallback((index: number, event: any) => {
    if (contextMenuData) {
      event.preventDefault()

      return 'handled'
    }

    // On shift key we let the block break line normally
    if (event.shiftKey) return 'not-handled'

    const item = value[index]

    if (!item) return 'not-handled'

    const editorState = editorStates[item.id]

    if (!editorState) return 'not-handled'

    // We want to split the block into two
    const selection = editorState.getSelection()
    let contentState = editorState.getCurrentContent()
    const firstBlock = contentState.getFirstBlock()
    const lastBlock = contentState.getLastBlock()
    const isBackward = selection.getIsBackward()
    let offset = 0 // How much text we removed before splitting into two blocks

    // If the selection is not collapsed, we remove the selected text
    if (!selection.isCollapsed()) {
      offset = Math.abs(selection.getAnchorOffset() - selection.getFocusOffset())
      contentState = Modifier.removeRange(contentState, selection, isBackward ? 'backward' : 'forward')
    }

    // Now we consider two selections: one to keep (in the second block) and one to remove (in the first block)
    const selectionToKeep = new SelectionState({
      anchorKey: firstBlock.getKey(),
      anchorOffset: 0,
      focusKey: isBackward ? selection.getFocusKey() : selection.getAnchorKey(),
      focusOffset: isBackward ? selection.getFocusOffset() : selection.getAnchorOffset(),
    })
    const selectionToRemove = new SelectionState({
      anchorKey: isBackward ? selection.getAnchorKey() : selection.getFocusKey(),
      anchorOffset: (isBackward ? selection.getAnchorOffset() : selection.getFocusOffset()) - offset,
      focusKey: lastBlock.getKey(),
      focusOffset: lastBlock.getText().length,
    })

    // We create a new block after the current one that splits the data into two
    // Then we focus it
    const nextFirstContentState = Modifier.removeRange(contentState, selectionToRemove, 'forward')
    const nextSecondContentState = Modifier.removeRange(contentState, selectionToKeep, 'forward')
    const nextEditorState = EditorState.push(editorState, nextFirstContentState, 'change-block-data')

    const emptySelection = SelectionState.createEmpty(nextSecondContentState.getFirstBlock().getKey())
    let secondEditorState = EditorState.forceSelection(EditorState.createWithContent(nextSecondContentState), emptySelection)
    const secondItem: ReactBlockTextDataItem = appendItemData(
      {
        reactBlockTextVersion: VERSION,
        id: nanoid(),
        type: item.type === 'todo' || item.type === 'bulleted-list' || item.type === 'numbered-list'
          ? item.type // Create a todo after a todo, same for lists
          : 'text',
      },
      secondEditorState
    )

    if (secondItem.type === 'todo') {
      secondEditorState = applyTodoStyle(secondEditorState, secondItem.metadata === 'true')
    }

    setEditorStates(x => ({ ...x, [item.id]: nextEditorState, [secondItem.id]: secondEditorState }))

    const nextValue = [...value]

    nextValue[index] = appendItemData(item, nextEditorState)
    nextValue.splice(index + 1, 0, secondItem)

    onChange(nextValue)
    setFocusedIndex(index + 1)
    setHoveredIndex(-1)

    return 'handled'
  }, [value, editorStates, contextMenuData, onChange])

  /* ---
    BACKSPACE
    Handle backspace input, if necessary merge blocks
  --- */
  const handleBackspace = useCallback((index: number) => {
    const item = value[index]

    if (!item) return 'not-handled'

    const editorState = editorStates[item.id]

    if (!editorState) return 'not-handled'

    const contentState = editorState.getCurrentContent()
    const firstBlockKey = contentState.getFirstBlock().getKey()
    const selection = editorState.getSelection()

    if (!(selection.isCollapsed() && selection.getAnchorOffset() === 0 && selection.getAnchorKey() === firstBlockKey)) return 'not-handled'
    // If the selection is collapsed and at the beginning of the block, we merge the block with the previous one

    // If the item is a todo, a quote or a list, we convert it to a text item
    if (convertibleToTextTypes.includes(item.type)) {
      const nextValue = [...value]

      nextValue[index] = { ...nextValue[index], type: 'text', metadata: '' }

      onChange(nextValue)

      return 'handled'
    }

    // Otherwise we merge the blocks
    const previousItem = value[index - 1]

    if (!previousItem) return 'not-handled'

    let previousEditorState = editorStates[previousItem.id]

    if (!previousEditorState) return 'not-handled'

    let previousContent = previousEditorState.getCurrentContent()
    const previousLastBlock = previousContent.getLastBlock()
    // The first block text will be merged with the last block of the previous item
    const firstBlock = contentState.getFirstBlock()
    // The other block will be added to the previous item
    // Modify keys to avoid duplicates
    const otherBlocks = contentState
      .getBlocksAsArray()
      .slice(1)
      .map(block => new ContentBlock(block.set('key', nanoid())))
    const offset = previousLastBlock.getText().length
    // The end result selection will be at the end of the previous item
    const previousSelection = SelectionState.createEmpty(previousLastBlock.getKey()).merge({
      anchorOffset: offset,
      focusOffset: offset,
    })

    previousContent = Modifier.insertText(previousContent, previousSelection, firstBlock.getText())
    previousContent = ContentState.createFromBlockArray([
      ...previousContent.getBlocksAsArray(),
      ...otherBlocks,
    ])
    previousEditorState = EditorState.push(previousEditorState, previousContent, 'change-block-data')
    previousEditorState = EditorState.forceSelection(previousEditorState, previousSelection)

    if (previousItem.type === 'todo') {
      previousEditorState = applyTodoStyle(previousEditorState, previousItem.metadata === 'true')
    }

    setEditorStates(x => {
      const nextEditorStates = { ...x }

      // Update the previous item's editor state
      nextEditorStates[previousItem.id] = previousEditorState

      // Delete the current item's editor state
      delete nextEditorStates[item.id]

      return nextEditorStates
    })

    const nextValue = [...value]

    // Update the previous item
    nextValue[index - 1] = appendItemData(previousItem, previousEditorState)
    // Delete the current item
    nextValue.splice(index, 1)

    onChange(nextValue)
    setFocusedIndex(index - 1)
    setHoveredIndex(-1)

    return 'handled'
  }, [value, editorStates, onChange])

  /* ---
    META BACKSPACE
    Handle delete block on Backspace + Meta or Ctrl
  --- */
  const handleMetaBackspace = useCallback(() => {
    if (focusedIndex <= 0) return

    const item = value[focusedIndex]

    if (!item) return

    // If in the previous state the first block is not empty, we don't delete the current item
    // Because it means that the user has deleted a block
    const previousEditorState = previousEditorStates[item.id]

    if (previousEditorState) {
      const previousFirstBlock = previousEditorState.getCurrentContent().getFirstBlock()

      if (previousFirstBlock.getText().length > 0) {
        // We refresh to update previousEditorStates
        forceRefresh(x => !x)

        // But we can merge it with the previous one
        const previousSelection = previousEditorState.getSelection()

        console.log('focusOffset', previousSelection.getFocusOffset())
        // If the selection is at the beggining of the first block
        if (previousSelection.isCollapsed() && previousSelection.getFocusOffset() === 0 && previousSelection.getAnchorKey() === previousFirstBlock.getKey()) {
          console.log('merge')
          handleBackspace(focusedIndex)
        }

        return
      }
    }

    // If the item is a todo, a quote or a list, we convert it to a text item
    if (convertibleToTextTypes.includes(item.type)) {
      const nextValue = [...value]

      nextValue[focusedIndex] = { ...nextValue[focusedIndex], type: 'text', metadata: '' }

      onChange(nextValue)

      return
    }

    const editorState = editorStates[item.id]

    if (!editorState) return

    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const nBlocks = contentState.getBlockMap().size
    const firstBlockTextLength = contentState.getFirstBlock().getText().length

    if (!(selection.isCollapsed() && selection.getFocusOffset() === 0 && nBlocks <= 1 && firstBlockTextLength === 0)) return
    // If the selection if at the beginning of the only empty block, we delete the current item

    handleDeleteItem(focusedIndex)
    setFocusedIndex(focusedIndex - 1)
    setForceFocusIndex(focusedIndex - 1)

    // Then we put the caret at the end of the previous item
    const previousItem = value[focusedIndex - 1]

    if (!previousItem) return

    let nextPreviousEditorState = editorStates[previousItem.id]

    if (!nextPreviousEditorState) return

    const previousLastBlock = nextPreviousEditorState.getCurrentContent().getLastBlock()
    const previousLastBlockLength = previousLastBlock.getText().length
    const nextPreviousSelection = SelectionState.createEmpty(previousLastBlock.getKey()).merge({
      focusOffset: previousLastBlockLength,
      anchorOffset: previousLastBlockLength,
    })
    nextPreviousEditorState = EditorState.forceSelection(nextPreviousEditorState, nextPreviousSelection)

    setEditorStates(x => ({ ...x, [previousItem.id]: nextPreviousEditorState }))
  }, [value, editorStates, previousEditorStates, focusedIndex, handleBackspace, handleDeleteItem, onChange])

  /* ---
    DELETE
    Handle delete input, if necessary merge blocks
  --- */
  const handleDelete = useCallback((index: number) => {
    const item = value[index]

    if (!item) return 'not-handled'

    const editorState = editorStates[item.id]

    if (!editorState) return 'not-handled'

    const selection = editorState.getSelection()
    const lastBlock = editorState.getCurrentContent().getLastBlock()
    const lastBlockTextLength = lastBlock.getText().length

    if (!(selection.isCollapsed() && selection.getAnchorOffset() === lastBlockTextLength && selection.getAnchorKey() === lastBlock.getKey())) return 'not-handled'
    // If the selection is collapsed and at the end of the block, we merge the block with the next one

    const nextItem = value[index + 1]

    if (!nextItem) return 'not-handled'

    let nextEditorState = editorStates[nextItem.id]

    if (!nextEditorState) return 'not-handled'

    let nextContent = nextEditorState.getCurrentContent()
    const nextFirstBlock = nextContent.getFirstBlock()
    // The last block text will be merged with the first block of the next item
    // The other block will be added to the next item
    // Modify keys to avoid duplicates
    const otherBlocks = editorState.getCurrentContent()
      .getBlocksAsArray()
      .slice(0, -1)
      .map(block => new ContentBlock(block.set('key', nanoid())))
    // The end result selection will be at the beginning of the next item, at lastBlockTextLength
    const nextSelection = SelectionState.createEmpty(nextFirstBlock.getKey()).merge({
      anchorOffset: lastBlockTextLength,
      focusOffset: lastBlockTextLength,
    })
    const nextSelectionToInsert = SelectionState.createEmpty(nextFirstBlock.getKey()).merge({
      anchorOffset: 0,
      focusOffset: 0,
    })

    nextContent = Modifier.insertText(nextContent, nextSelectionToInsert, lastBlock.getText())
    nextContent = ContentState.createFromBlockArray([
      ...otherBlocks,
      ...nextContent.getBlocksAsArray(),
    ])
    nextEditorState = EditorState.push(nextEditorState, nextContent, 'change-block-data')
    nextEditorState = EditorState.forceSelection(nextEditorState, nextSelection)

    setEditorStates(x => {
      const nextEditorStates = { ...x }

      // Update the next item's editor state
      nextEditorStates[nextItem.id] = nextEditorState

      // Delete the current item's editor state
      delete nextEditorStates[item.id]

      return nextEditorStates
    })

    const nextValue = [...value]

    // Update the next item
    nextValue[index + 1] = appendItemData(nextItem, nextEditorState)
    // Preserve first item type
    nextValue[index + 1].type = item.type
    // Delete the current item
    nextValue.splice(index, 1)

    onChange(nextValue)
    setFocusedIndex(index)
    setHoveredIndex(-1)

    return 'handled'
  }, [value, editorStates, onChange])

  /* ---
    BLOCK MOUSE DOWN
  --- */
  const handleBlockMouseDown = useCallback(() => {
    setSelection(null)
  }, [])

  /* ---
    DRAG
    Handle editor move via drag and drop
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
    FOCUS
  --- */
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index)
    setSelection(null)
  }, [])

  /* ---
    BLUR
  --- */
  const handleBlur = useCallback(() => {
    setSelection(null)
  }, [])

  /* ---
    FOCUS CONTENT
  --- */
  const handleFocusContent = useCallback((index: number, atStart = false) => {
    const item = value[index]

    if (!item) return

    forceContentFocus(instanceId, item.id)

    if (!atStart) return

    const editorState = editorStates[item.id]

    if (!editorState) return

    const selection = SelectionState.createEmpty(editorState.getCurrentContent().getFirstBlock().getKey())
    const nextEditorState = EditorState.forceSelection(editorState, selection)

    setEditorStates(x => ({ ...x, [item.id]: nextEditorState }))
  }, [value, editorStates, instanceId])

  /* ---
    BLUR CONTENT
  --- */
  const handleBlurContent = useCallback((index: number) => {
    const item = value[index]

    if (!item) return

    editorRefs[instanceId][item.id]?.blur()
  }, [value, instanceId])

  /* ---
    BLUR ALL CONTENT
  --- */
  const handleBlurAllContent = useCallback(() => {
    const allEditorRefs = Object.values(editorRefs[instanceId])

    allEditorRefs.forEach(editorRef => editorRef?.blur())
  }, [instanceId])

  /* ---
    COPY
    Write selected items to clipboard
  --- */
  const handleWindowCopy = useCallback(() => {
    if (!(selection && selection.items.length)) return

    navigator.clipboard.writeText(JSON.stringify(selection.items))
  }, [selection])

  /* ---
    PASTE
    Handle paste of text, ~images, files~ or blocks
  --- */
  const handlePasteText = useCallback((index: number, text: string) => {
    const item = value[index]

    if (!item) return

    const editorState = editorStates[item.id]

    if (!editorState) return

    const contentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), text)

    const nextEditorState = EditorState.push(editorState, contentState, 'insert-characters')

    setEditorStates(x => ({ ...x, [item.id]: nextEditorState }))

    const nextValue = [...value]

    nextValue.splice(index, 1, appendItemData(item, nextEditorState))

    onChange(nextValue)
  }, [value, editorStates, onChange])

  const handlePasteItems = useCallback((index: number, items: ReactBlockTextDataItem[]) => {
    console.log('handlePasteItems', index, items)
    // const item = value[index]

    // if (!item) return

    // const editorState = editorStates[item.id]

    // if (!editorState) return

    // }, [value, editorStates])
  }, [])

  const handleActualPaste = useCallback(async (index: number) => {
    const data = await window.navigator.clipboard.readText()

    let parsedData = null

    try {
      parsedData = JSON.parse(data)
    }
    catch (error) {
      //
    }

    if (Array.isArray(parsedData) && parsedData[0] && typeof parsedData[0].reactBlockTextVersion === 'string') {
      handlePasteItems(index, parsedData)
    }
    else {
      handlePasteText(index, data)
    }
  }, [handlePasteText, handlePasteItems])

  // Passed to editor component
  const handlePaste = useCallback((index: number) => {
    handleActualPaste(index)

    return 'handled'
  }, [handleActualPaste])

  /* ---
    CONTEXT MENU SELECT
    Handle context menu item selection after `/` then `enter` or click
  --- */
  const handleContextMenuSelect = useCallback((command: ReactBlockTextDataItemType) => {
    setContextMenuData(null)

    const { id } = contextMenuData!
    const item = value.find(x => x.id === id)

    if (!item) return
    if (item.type === command) return

    const editorState = editorStates[id]

    if (!editorState) return

    const currentSelection = editorState.getSelection()
    const blockKey = currentSelection.getStartKey()
    const block = editorState.getCurrentContent().getBlockForKey(blockKey)
    const originalOffset = currentSelection.getFocusOffset()
    let blockText = block.getText()
    let offset = originalOffset

    // Remove text after `/`
    while (blockText[offset - 1] !== '/') {
      offset--
      blockText = blockText.slice(0, -1)
    }

    // Remove '/'
    blockText = blockText.slice(0, -1)
    offset--

    // The command query to remove
    const selectionStateToRemove = SelectionState.createEmpty(blockKey).merge({
      focusOffset: originalOffset,
      anchorOffset: offset,
    })
    // The selection after the removal of the command query
    const selectionStateToApply = SelectionState.createEmpty(blockKey).merge({
      focusOffset: offset,
      anchorOffset: offset,
    })
    const nextContent = Modifier.removeRange(editorState.getCurrentContent(), selectionStateToRemove, 'forward')
    let nextEditorState = EditorState.push(editorState, nextContent, 'change-block-data')

    nextEditorState = EditorState.forceSelection(nextEditorState, selectionStateToApply)

    setEditorStates(x => ({ ...x, [id]: nextEditorState }))

    const nextValue = [...value]

    nextValue.splice(nextValue.indexOf(item), 1, appendItemData({ ...item, type: command }, nextEditorState))

    onChange(nextValue)

    // Update previousEditorState to clear the command query from them
    setShouldTriggerRefresh(true)
  }, [value, editorStates, contextMenuData, onChange])

  /* ---
    MULTI BLOCK SELECTION
    Set selectedItems with the content of the selected blocks
    Trimmed at the beginning and end to fit to selection
    When selecting the editor goes into read-only mode, to allow selection between multiple contenteditable divs
    This handler is invoked at mouseup
  --- */
  const handleMultiBlockSelection = useCallback((id: string, blockKey: string, text: string) => {
    const itemIndex = value.findIndex(x => x.id === id)

    if (itemIndex === -1) return

    // Find blockIndex, the index of the start block for the selected text
    const editorState = editorStates[id]
    let blockIndex = -1

    if (!editorState) return

    editorState.getCurrentContent().getBlocksAsArray().forEach((block, blockI) => {
      if (block.getKey() === blockKey) {
        blockIndex = blockI
      }
    })

    // Find selected blocks
    const selected: ReactBlockTextDataItem[] = []
    // The text that has been selected
    let textToCut = text
    let complete = false

    value.forEach((item, valueI) => {
      if (complete) return
      if (itemIndex > valueI) return

      const editorState = editorStates[item.id]

      if (!editorState) {
        selected.push(item)

        return
      }

      let nextEditorState = editorState

      // If a block matches the text to cut, extract it and add it to the selection
      editorState.getCurrentContent().getBlocksAsArray().forEach((block, blockI) => {
        if (complete) return
        if (itemIndex === valueI && blockIndex < blockI) return

        const blockText = block.getText()

        // Slice the block text from the beginning
        for (let i = 0; i < blockText.length; i++) {
          const lastBlock = blockText.length >= textToCut.length
          let selectionStateToRemove = SelectionState.createEmpty(block.getKey())

          // If it is the last block, slice the block text from the end too to take partial block selection into account
          if (lastBlock) {
            for (let j = i; j < blockText.length; j++) {
              const blockTextSlice = blockText.slice(i, j + 1)

              if (textToCut === blockTextSlice) {
                textToCut = textToCut.slice(blockTextSlice.length)

                selectionStateToRemove = selectionStateToRemove.merge({
                  anchorOffset: j + 1,
                  focusOffset: blockTextSlice.length + 1,
                })
              }
            }
          }
          // If not the last block, the text to cut must start with the block text slice for the block to be accepted
          else {
            const blockTextSlice = blockText.slice(i)

            if (textToCut.startsWith(blockTextSlice)) {
              textToCut = textToCut.slice(blockTextSlice.length)

              selectionStateToRemove = selectionStateToRemove.merge({
                anchorOffset: 0,
                focusOffset: i,
              })
            }
          }

          const nextContent = Modifier.removeRange(editorState.getCurrentContent(), selectionStateToRemove, 'forward')
          nextEditorState = EditorState.push(nextEditorState, nextContent, 'change-block-data')

          if (textToCut.length === 0) {
            complete = true
            break
          }
        }
      })

      selected.push(appendItemData(item, nextEditorState))
    })

    setSelection({
      items: selected,
      startId: id,
    })
  }, [value, editorStates])

  /* ---
    MULTI BLOCK SELECTION MOUSE UP
    Handle the mouse up event when selecting multiple blocks
    If the selection is not empty, set the selected items
  --- */
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isSelecting) return

    isSelecting = false

    forceRefresh(x => !x)

    try {
      const range = window.getSelection()?.getRangeAt(0)
      const text = range?.toString()

      if (range && text) {
        const parentElement = range.startContainer.parentElement!

        const dataOffsetKey = findAttributeInParents(parentElement, 'data-offset-key')
        const dataReactBlockTextId = findAttributeInParents(parentElement, 'data-react-block-text-id')

        if (!(dataOffsetKey && dataReactBlockTextId)) return

        const blockKey = dataOffsetKey.split('-')[0]

        if (blockKey) {
          handleMultiBlockSelection(dataReactBlockTextId, blockKey, text)
        }
      }
      // Force break a focus bug
      else {
        // Prevent force focus happening on block add button click
        if (hasParentWithId(event.target as HTMLElement, ADD_ITEM_BUTTON_ID)) return

        setForceFocusIndex(hoveredIndex)
      }
    }
    catch (error) {
      //
    }
  }, [handleMultiBlockSelection, hoveredIndex])

  /* ---
    ROOT DIV BLUR
  --- */
  const handleRootBlur = useCallback(() => {
    setSelection(null)
  }, [])

  /* ---
    KEYDOWN
  --- */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Backspace' && (event.metaKey || event.ctrlKey)) {
      handleMetaBackspace()
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      console.log('arrow')
      setShouldTriggerRefresh(true)

      setTimeout(() => {
        setShouldTriggerRefresh(true)
      }, 1)
    }
  }, [handleMetaBackspace])

  /* ---
    OUTSIDE CLICK
  --- */
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
      handleRootBlur()
      handleBlurAllContent()
    }
  }, [handleRootBlur, handleBlurAllContent])

  /* ---
    HANDLE KEY COMMANDS
    Respond to the editor's key-bound commands
  --- */
  const handleKeyCommand = useCallback((index: number, command: string) => {
    if (command === COMMANDS.SAVE) {
      onSave?.()

      return 'handled'
    }

    if (command === 'backspace') {
      return handleBackspace(index)
    }

    if (command === 'delete') {
      return handleDelete(index)
    }

    return 'not-handled'
  }, [onSave, handleBackspace, handleDelete])

  /* ---
    RENDER EDITOR
    Render the editor for each item of value
  --- */
  const renderEditor = useCallback((item: ReactBlockTextDataItem, index: number) => {
    if (!editorStates[item.id]) return null

    const blockProps: Omit<BlockProps, 'children'> = {
      id: item.id,
      type: item.type,
      index,
      readOnly: !!readOnly,
      hovered: !isDragging && index === hoveredIndex,
      paddingLeft,
      onAddItem: () => handleAddItem(index),
      onDeleteItem: () => handleDeleteItem(index),
      onDuplicateItem: () => handleDuplicateItem(index),
      onMouseDown: handleBlockMouseDown,
      onMouseMove: () => setHoveredIndex(index),
      onMouseLeave: () => setHoveredIndex(previous => previous === index ? -1 : previous),
      onDragStart: () => setIsDragging(true),
      onDrag: handleDrag,
      onDragEnd: () => setIsDragging(false),
      onBlockMenuOpen: () => setIsBlockMenuOpen(true),
      onBlockMenuClose: () => setIsBlockMenuOpen(false),
      focusContent: () => handleFocusContent(index),
      focusContentAtStart: () => handleFocusContent(index, true),
      focusNextContent: () => handleFocusContent(index + 1),
      blurContent: () => handleBlurContent(index),
    }

    const blockContentProps: BlockContentProps = {
      type: item.type,
      editorState: editorStates[item.id],
      metadata: item.metadata,
      readOnly: isSelecting || !!readOnly,
      focused: !isDragging && index === focusedIndex,
      isSelecting,
      registerRef: ref => registerRef(item.id, ref),
      onChange: editorState => handleChange(item.id, editorState),
      onReturn: event => handleReturn(index, event),
      onUpArrow: event => handleUpArrow(index, event),
      onDownArrow: event => handleDownArrow(index, event),
      onFocus: () => handleFocus(index),
      onBlur: handleBlur,
      onPaste: () => handlePaste(index),
      onCheck: checked => handleCheck(index, checked),
      onKeyCommand: command => handleKeyCommand(index, command),
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
    paddingLeft,
    editorStates,
    hoveredIndex,
    focusedIndex,
    isDragging,
    handleAddItem,
    handleDeleteItem,
    handleDuplicateItem,
    handleChange,
    handleReturn,
    handleUpArrow,
    handleDownArrow,
    handleFocus,
    handleBlur,
    handlePaste,
    handleCheck,
    handleDrag,
    handleBlockMouseDown,
    handleFocusContent,
    handleBlurContent,
    handleKeyCommand,
    registerRef,
  ])

  /* ---
    INITIAL VALUE POPULATION
  --- */
  useEffect(() => {
    if (!(Array.isArray(value) && value.length)) return

    const editorStates = value.map(item => ({
      item,
      editorState: item.data
        ? EditorState.createWithContent(convertFromRaw(JSON.parse(item.data)))
        : EditorState.createEmpty(),
    }))
    .reduce((acc, x) => ({ ...acc, [x.item.id]: applyStyles(x.item, x.editorState) }), {})

    setEditorStates(editorStates)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---
    NO VALUE LENGTH
    Create a text item if there is no value
  --- */
  useEffect(() => {
    if (value.length) return
    if (readOnly) return

    const { editorState, item } = createTextItem()

    setEditorStates(x => ({ ...x, [item.id]: editorState }))
    onChange([item])
    setFocusedIndex(0)
  }, [value, readOnly, onChange, createTextItem])

  /* ---
    READ ONLY UPDATE
    Update the editor states based on value if readOnly
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
    Handle forcing focus on a specific block
  --- */
  useEffect(() => {
    if (readOnly) return
    if (forceFocusIndex === -1) return
    if (lastForceFocusTime + 3 * 16 > Date.now()) return

    lastForceFocusTime = Date.now()

    setForceFocusIndex(-1)
    forceContentFocus(instanceId, value[forceFocusIndex]?.id)
  }, [value, readOnly, instanceId, forceFocusIndex, editorStates])

  /* ---
    FORCE BLUR
    Handle forcing blur on a specific block
  --- */
  useEffect(() => {
    if (readOnly) return
    if (forceBlurIndex === -1) return

    setForceBlurIndex(-1)

    const item = value[forceBlurIndex]

    if (!item) return

    editorRefs[instanceId][item.id]?.blur()
  }, [value, readOnly, instanceId, forceBlurIndex])

  /* ---
    FORCE REFRESH
  --- */
  useEffect(() => {
    if (!shouldTriggerRefresh) return

    forceRefresh(x => !x)
  }, [shouldTriggerRefresh])

  /* ---
    MULTI BLOCK SELECTION EVENTS
    Handle multi block selection by adding two listeners: mouseup and mousemove
    mouseup will check if the selection is valid and call handleMultiBlockSelection
    mousemove will trigger the selecting state if the mouse is down
  --- */
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseUp])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Start selection only if the mouse is down
      if (event.buttons !== 1) return
      // Prevent selection on drag
      if (hasParentWithId(event.target as HTMLElement, DRAG_ITEM_BUTTON_ID)) return

      isSelecting = true
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  /* ---
    KEYDOWN EVENT
  --- */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  /* ---
    OUTSIDE CLICK EVENT
  --- */
  useEffect(() => {
    window.addEventListener('click', handleOutsideClick)

    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [handleOutsideClick])

  /* ---
    COPY EVENT
  --- */
  useEffect(() => {
    window.addEventListener('copy', handleWindowCopy)

    return () => {
      window.removeEventListener('copy', handleWindowCopy)
    }
  }, [handleWindowCopy])

  /* ---
    MAIN RETURN STATEMENT
  --- */
  if (typeof rawValue !== 'string') throw new Error('ReactBlockText value prop must be a string')

  return (
    <DndProvider backend={HTML5Backend}>
      <PrimaryColorContext.Provider value={primaryColor ?? DEFAULT_PRIMARY_COLOR}>
        <div
          ref={rootRef}
          onBlur={handleRootBlur}
          className="relative"
        >
          {value.map(renderEditor)}
          {!!contextMenuData && (
            <ContextMenu
              query={contextMenuData.query}
              top={contextMenuData.top}
              bottom={contextMenuData.bottom}
              left={contextMenuData.left}
              onClose={() => setContextMenuData(null)}
              onSelect={handleContextMenuSelect}
            />
          )}
          {isBlockMenuOpen && (
            <div className="absolute inset-0 z-10" />
          )}
        </div>
      </PrimaryColorContext.Provider>
    </DndProvider>
  )
}

/* ---
  GET CONTEXT MENU DATA
  Get the context menu position based on the current selection
--- */
function getContextMenuData(instanceId: string, id: string, rootElement: HTMLElement): ContextMenuData | null {
  const range = window.getSelection()?.getRangeAt(0)?.cloneRange()

  if (!range) return null

  range.collapse(true)

  const rects = range.getClientRects()
  const rootRect = rootElement.getBoundingClientRect()

  if (rects.length) {
    return {
      id,
      query: '',
      left: rects[0].right - rootRect.left - 6,
      ...getContextMenuYPosition(rects[0], rootRect, rootElement.offsetTop, false),
    }
  }

  const editorRef = editorRefs[instanceId][id]

  if (!editorRef) return null

  const editorRects = editorRef.editorContainer?.getClientRects()

  if (!editorRects?.length) return null

  return {
    id,
    query: '',
    left: editorRects[0].left - rootRect.left - 2,
    ...getContextMenuYPosition(editorRects[0], rootRect, rootElement.offsetTop, true),
  }
}

function getContextMenuYPosition(rect: DOMRectReadOnly, rootRect: DOMRect, rootOffsetTop: number, isEditorRect: boolean) {
  const top = (isEditorRect ? rect.top + 24 : rect.bottom + 4) - rootRect.top

  if (top + rootOffsetTop + CONTEXT_MENU_HEIGHT < window.innerHeight) return { top }

  const bottom = rootRect.height - rect.top + rootRect.top + 4

  return { bottom }
}

/* ---
  APPEND ITEM DATA
--- */
function appendItemData(item: Partial<ReactBlockTextDataItem>, editorState: EditorState) {
  return {
    metadata: '',
    ...item,
    data: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
  } as ReactBlockTextDataItem
}

/* ---
  FIND ATTRIBUTE IN PARENTS
--- */
function findAttributeInParents(element: HTMLElement, attribute: string) {
  if (element.hasAttribute(attribute)) return element.getAttribute(attribute)

  if (!element.parentElement) return null

  return findAttributeInParents(element.parentElement, attribute)
}

/* ---
  APPLY TO-DO STYLE
--- */
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

/* ---
  APPLY ANY STYLE
--- */
function applyStyles(item: ReactBlockTextDataItem, editorState: EditorState) {
  if (item.type === 'todo') return applyTodoStyle(editorState, item.metadata === 'true', true)

  return editorState
}

/* ---
  FORCE CONTENT FOCUS
--- */
function forceContentFocus(instanceId: string, id: string) {
  if (!editorRefs[instanceId]?.[id]) return
  if (editorRefs[instanceId][id]?.editorContainer?.contains(document.activeElement)) return

  editorRefs[instanceId][id]?.focus()
}

export default ReactBlockText
