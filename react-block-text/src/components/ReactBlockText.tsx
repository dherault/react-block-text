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

import {
  BlockContentTextProps,
  BlockProps,
  ContextMenuData,
  ReactBlockTextDataItem,
  ReactBlockTextDataItemType,
  ReactBlockTextProps,
  ReactBlockTextSelection,
} from '../types'

import { COMMANDS, VERSION } from '../constants'

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
// instanceId -> itemId -> editorRef
const editorRefs: Record<string, Record<string, Editor | null>> = {}

// Not a state for performance reasons
let isSelecting = false

function ReactBlockText({ value, readOnly, onChange, onSave }: ReactBlockTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  const [editorStates, setEditorStates] = useState<Record<string, EditorState>>({})
  const [focusedIndex, setFocusedIndex] = useState(value.length ? -1 : 0)
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData | null>(null)
  const [selection, setSelection] = useState<ReactBlockTextSelection | null>(null)
  const [, forceRerender] = useState(false)

  // A unique instance id for the sake of editorRefs, so multiple instances can be used on the same page
  const instanceId = useMemo(() => nanoid(), [])

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
    setForceFocusIndex(index + 1)
    setHoveredIndex(index + 1)
    setFocusedIndex(index + 1)
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
    CHANGE
    Handle editor value change
  --- */
  const handleChange = useCallback((id: string, editorState: EditorState) => {
    setEditorStates(x => ({ ...x, [id]: editorState }))

    const data = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    const nextValue = [...value]
    const index = nextValue.findIndex(x => x.id === id)

    if (index === -1) return

    nextValue[index] = { ...nextValue[index], data }

    onChange(nextValue)

    const currentSelection = editorState.getSelection()
    const block = editorState.getCurrentContent().getBlockForKey(currentSelection.getStartKey())
    const text = block.getText()
    const lastWord = text.split(' ').pop() || ''
    const lastWordIncludesCommand = lastWord.includes('/')
    const lastChar = lastWord.slice(-1)

    // Toggle context menu with `/` command
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
    const secondEditorState = EditorState.forceSelection(EditorState.createWithContent(nextSecondContentState), emptySelection)
    const secondItem: ReactBlockTextDataItem = appendItemData(
      {
        reactBlockTextVersion: VERSION,
        id: nanoid(),
        type: 'text',
      },
      secondEditorState
    )

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
    UP ARROW
    Handle up arrow, to move between editor instances
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
    const isFirstline = firstBlock.getKey() === selection.getFocusKey()

    if (!isFirstline) return

    const firstBlockText = firstBlock.getText()
    const indexOfCarriageReturn = firstBlockText.indexOf('\n')
    const focusOffset = selection.getFocusOffset()

    if (indexOfCarriageReturn !== -1 && selection.getFocusOffset() > indexOfCarriageReturn) return

    const previousLastBlock = previousEditorState.getCurrentContent().getLastBlock()
    const previousLastBlockText = previousLastBlock.getText()
    const lines = previousLastBlockText.split('\n')
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
    const isLastLine = lastBlock.getKey() === selection.getFocusKey()

    if (!isLastLine) return

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

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index)
    setSelection(null)
  }, [])

  /* ---
    BLUR
  --- */
  const handleBlur = useCallback(() => {
    // setFocusedIndex(previous => value.length === 1 ? 0 : previous === index ? -1 : previous)
    setSelection(null)
  }, [])

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

  const handleFocusContent = useCallback((index: number) => {
    const item = value[index]

    if (!item) return

    editorRefs[instanceId][item.id]?.focus()
  }, [instanceId, value])

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
    console.log('paste text', index, text)

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
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return

    isSelecting = false

    forceRerender(x => !x)

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
        setForceFocusIndex(focusedIndex)
      }
    }
    catch (error) {
      //
    }
  }, [handleMultiBlockSelection, focusedIndex])

  /* ---
    ROOT DIV BLUR
  --- */
  const handleRootBlur = useCallback(() => {
    setSelection(null)
  }, [])

  /* ---
    OUTSIDE CLICK
  --- */
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
      handleRootBlur()
    }
  }, [handleRootBlur])

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
      onAddItem: () => handleAddItem(index),
      onDeleteItem: () => handleDeleteItem(index),
      onMouseDown: handleBlockMouseDown,
      onMouseMove: () => setHoveredIndex(index),
      onMouseLeave: () => setHoveredIndex(previous => previous === index ? -1 : previous),
      onDragStart: () => setIsDragging(true),
      onDrag: handleDrag,
      onDragEnd: () => setIsDragging(false),
      focusContent: () => handleFocusContent(index),
      focusNextContent: () => handleFocusContent(index + 1),
    }

    const blockContentProps: BlockContentTextProps = {
      type: item.type,
      readOnly: isSelecting || !!readOnly,
      editorState: editorStates[item.id],
      focused: !isDragging && index === focusedIndex,
      registerRef: ref => registerRef(item.id, ref),
      onChange: editorState => handleChange(item.id, editorState),
      onReturn: event => handleReturn(index, event),
      onUpArrow: event => handleUpArrow(index, event),
      onDownArrow: event => handleDownArrow(index, event),
      onFocus: () => handleFocus(index),
      onBlur: handleBlur,
      onPaste: () => handlePaste(index),
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
    editorStates,
    hoveredIndex,
    focusedIndex,
    isDragging,
    handleAddItem,
    handleDeleteItem,
    handleChange,
    handleReturn,
    handleUpArrow,
    handleDownArrow,
    handleFocus,
    handleBlur,
    handlePaste,
    handleDrag,
    handleBlockMouseDown,
    handleFocusContent,
    handleKeyCommand,
    registerRef,
  ])

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

    setForceFocusIndex(-1)

    if (!editorRefs[instanceId]?.[value[forceFocusIndex]?.id]) return

    editorRefs[instanceId][value[forceFocusIndex].id]?.focus()
  }, [value, readOnly, instanceId, forceFocusIndex, editorStates])

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
      if (event.buttons !== 1) return

      isSelecting = true
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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
  if (!Array.isArray(value)) throw new Error('ReactBlockText value prop must be an array')

  return (
    <DndProvider backend={HTML5Backend}>
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
  Get the context menu position based on the current selection
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

/* ---
  APPEND ITEM DATA
--- */
function appendItemData(item: Partial<ReactBlockTextDataItem>, editorState: EditorState) {
  return {
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

export default ReactBlockText
