// TODO
// x Rewrite for plugins
// - Handle copy/paste
// - Handle undo/redo
// - Handle drag/drop of multiple blocks
// - Handle mousedown event for start selection rect on root element, not in blocks
// - Handle scroll selection
// x Write header plugin
// x Write quote plugin
// x Write list plugin
// - Complete list plugin
// - Write code plugin
// - Write image plugin
// - Write table plugin (may need to set editorStates as an array)
// - Create inline menu and handle styling and block conversion
// - Write color plugin (meta plugin)
// - Handle block conversion on block menu
// - Fix / and backspace bug
// x Handle text conversion
// - AI plugin (meta plugin)
// x Separate package from app
// x Publish to npm
// x Fix multiline enter bug
// x Remove convertibleToTextTypes
// x Add isNextItemOfSameType to plugin API

import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

import textPlugin from '../plugins/text/plugin'

import type {
  BlockContentProps,
  BlockProps,
  ContextMenuData,
  DragData,
  EditorRefRegistry,
  ReactBlockTextDataItem,
  ReactBlockTextDataItemType,
  ReactBlockTextEditorStates,
  ReactBlockTextPluginOptions,
  ReactBlockTextProps,
  SelectionData,
  SelectionRectData,
  XY,
} from '../types'

import {
  ADD_ITEM_BUTTON_ID,
  BASE_SCROLL_SPEED,
  COMMANDS,
  DEFAULT_PRIMARY_COLOR,
  DRAG_ITEM_BUTTON_ID,
  SELECTION_RECT_SCROLL_OFFSET,
  VERSION,
} from '../constants'

import PrimaryColorContext from '../context/PrimaryColorContext'

import usePrevious from '../hooks/usePrevious'

import findParentWithId from '../utils/findParentWithId'
import findAttributeInParents from '../utils/findAttributeInParents'
import getRelativeMousePosition from '../utils/getRelativeMousePosition'
import appendItemData from '../utils/appendItemData'
import getContextMenuData from '../utils/getContextMenuData'
import forceContentFocus from '../utils/forceContentFocus'
import findSelectionRectIds from '../utils/findSelectionRectIds'
import findScrollParent from '../utils/findScrollParent'

import Block from './Block'
import BlockContentText from './BlockContentText'
import ContextMenu from './ContextMenu'
import SelectionRect from './SelectionRect'
import DragLayer from './DragLayer'

// Remove onUpArrow and onDownArrow deprecation warnings
ignoreWarnings([
  'Supplying an `onUpArrow`',
  'Supplying an `onDownArrow`',
])

// Not a state to avoid infinite render loops
// instanceId -> itemId -> editorRef
const editorRefs: Record<string, EditorRefRegistry> = {}
const selectionRefs: Record<string, Record<string, HTMLElement>> = {}

// Not a state for performance reasons
let isSelecting = false
let lastForceFocusTime = 0
let lastRelativeMousePosition: XY = { x: 0, y: 0 }
let scrollParentFrame = -1

function ReactBlockText({
  value: rawValue,
  onChange: rawOnChange,
  plugins: rawPlugins = [],
  readOnly,
  paddingTop,
  paddingBottom,
  paddingLeft,
  primaryColor,
  onSave,
}: ReactBlockTextProps) {
  const [editorStates, setEditorStates] = useState<ReactBlockTextEditorStates>({})

  /* ---
    VALUE PARSING
  --- */
  const value = useMemo<ReactBlockTextDataItem[]>(() => {
    try {
      return JSON.parse(rawValue)
    }
    catch (error) {
      return []
    }
  }, [rawValue])

  /* ---
    ONCHANGE VALUE STRINGIFICATION
  --- */
  const onChange = useCallback((nextValue: ReactBlockTextDataItem[]) => {
    rawOnChange?.(JSON.stringify(nextValue))
  }, [rawOnChange])

  /* ---
    HANDLE PLUGIN CHANGE
  --- */
  const handlePluginChange = useCallback((item: ReactBlockTextDataItem, editorState: EditorState) => {
    if (readOnly) return
    if (!(item && editorState)) return

    const index = value.findIndex(x => x.id === item?.id)

    if (index === -1) return

    setEditorStates(x => ({ ...x, [item.id]: editorState }))

    const nextValue = [...value]

    nextValue[index] = item

    onChange(nextValue)
  }, [readOnly, value, onChange])

  const pluginOptions = useMemo<ReactBlockTextPluginOptions>(() => ({
    onChange: handlePluginChange,
  }), [handlePluginChange])

  /* ---
    PLUGINS MERGING
  --- */
  const pluginsData = useMemo(() => (
    [
      ...textPlugin(),
      ...rawPlugins,
    ]
    .map(x => x(pluginOptions))
  ), [rawPlugins, pluginOptions])

  /* ---
    APPLY STYLES
  --- */
  const applyStyles = useCallback((item: ReactBlockTextDataItem, editorState: EditorState) => {
    const plugin = pluginsData.find(x => x.type === item.type)

    return plugin?.applyStyles?.(item, editorState) ?? editorState
  }, [pluginsData])

  /* ---
    APPLY METADATA
  --- */
  const applyMetadatas = useCallback((index: number, value: ReactBlockTextDataItem[], editorStates: ReactBlockTextEditorStates) => {
    let nextValue = [...value]

    pluginsData.forEach(plugin => {
      nextValue = plugin?.applyMetadatas?.(index, nextValue, editorStates) ?? nextValue
    })

    return nextValue
  }, [pluginsData])

  /* ---
    STATE
  --- */
  const rootRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(value.length ? -1 : 0)
  const [forceFocusIndex, setForceFocusIndex] = useState(-1)
  const [forceBlurIndex, setForceBlurIndex] = useState(-1)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [scrollIntoViewId, setScrollIntoViewId] = useState<string | null>(null)
  const [dragData, setDragData] = useState<DragData | null>(null)
  const [wasDragging, setWasDragging] = useState(false)
  const [isBlockMenuOpen, setIsBlockMenuOpen] = useState(false)
  const [contextMenuData, setContextMenuData] = useState<ContextMenuData | null>(null)
  const [selectionRect, setSelectionRect] = useState<SelectionRectData | null>(null)
  const [selectionData, setSelectionData] = useState<SelectionData | null>(null)
  const [refresh, forceRefresh] = useState(false)
  const [shouldTriggerRefresh, setShouldTriggerRefresh] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(0)

  const previousEditorStates = usePrevious(editorStates, refresh || shouldTriggerRefresh)

  // A unique instance id for the sake of editorRefs, so multiple instances can be used on the same page
  const instanceId = useMemo(() => nanoid(), [])

  // TODO
  // const last = Object.values(previousEditorStates).pop()
  // console.log(last?.getSelection().getFocusOffset(), refresh)

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
    REGISTER SELECTION REF
    We associate each selection outline with an id so that we can access it later
  --- */
  const registerSelectionRef = useCallback((id: string, ref: HTMLElement) => {
    if (!ref) return
    if (!selectionRefs[instanceId]) {
      selectionRefs[instanceId] = {}
    }

    selectionRefs[instanceId][id] = ref
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
        indent: 0,
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
    let nextValue = [...value]

    nextValue.splice(index + 1, 0, item)

    const nextEditorStates = { ...editorStates, [item.id]: editorState }

    nextValue = applyMetadatas(index + 1, nextValue, nextEditorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    setHoveredIndex(index + 1)
    setFocusedIndex(index + 1)
    setForceFocusIndex(index + 1)
    setScrollIntoViewId(item.id)
  }, [value, editorStates, onChange, createTextItem, applyMetadatas])

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

      const nextEditorStates = { [item.id]: editorState }
      const nextValue = applyMetadatas(index, [item], nextEditorStates)

      onChange(nextValue)
      setEditorStates(nextEditorStates)

      return
    }

    // Delete any item
    let nextValue = [...value]
    const [item] = nextValue.splice(index, 1)
    const nextEditorStates = { ...editorStates }

    delete nextEditorStates[item.id]

    nextValue = applyMetadatas(index, nextValue, nextEditorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    setHoveredIndex(-1)
  }, [value, editorStates, onChange, createTextItem, applyMetadatas])

  /* ---
    DUPLICATE ITEM
  --- */
  const handleDuplicateItem = useCallback((index: number) => {
    const item = value[index]

    if (!item) return

    const editorState = editorStates[item.id]

    if (!editorState) return

    let nextValue = [...value]
    const nextItem = { ...item, id: nanoid() }

    nextValue.splice(index + 1, 0, nextItem)

    const nextEditorStates = { ...editorStates, [nextItem.id]: editorState }

    nextValue = applyMetadatas(index + 1, nextValue, nextEditorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    setHoveredIndex(index + 1)
    setFocusedIndex(index + 1)
  }, [value, editorStates, onChange, applyMetadatas])

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

    const nextEditorState = applyStyles(item, editorState)
    const nextEditorStates = { ...editorStates, [id]: nextEditorState }

    setEditorStates(nextEditorStates)

    data = JSON.stringify(convertToRaw(nextEditorState.getCurrentContent()))

    if (data === item.data) return

    let nextValue = [...value]

    nextValue[index] = { ...nextValue[index], data }
    nextValue = applyMetadatas(index, nextValue, nextEditorStates)

    onChange(nextValue)

    const currentSelection = nextEditorState.getSelection()
    const block = nextEditorState.getCurrentContent().getBlockForKey(currentSelection.getStartKey())
    const text = block.getText()
    const lastWord = text.split(' ').pop() || ''
    const lastWordIncludesCommand = lastWord.includes('/')
    const lastChar = lastWord.slice(-1)

    // Toggle context menu with `/` command
    if (!contextMenuData && lastChar === '/') {
      setContextMenuData(getContextMenuData(editorRefs[instanceId], id, rootRef.current!))

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
  }, [value, editorStates, instanceId, contextMenuData, onChange, applyStyles, applyMetadatas])

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

    const pluginData = pluginsData.find(x => x.type === item.type)

    if (!pluginData) return 'not-handled'

    const selection = editorState.getSelection()
    let contentState = editorState.getCurrentContent()

    // If the block is empty and the plugin is convertible to text, we convert it
    if (contentState.getPlainText() === '' && pluginData?.isConvertibleToText) {
      const nextEditorStates = { ...editorStates }
      let nextValue = [...value]

      nextValue[index] = {
        ...nextValue[index],
        type: 'text',
        metadata: '',
        indent: Math.max(0, Math.min(nextValue[index].indent, 1)),
      }
      nextValue = applyMetadatas(index, nextValue, nextEditorStates)

      onChange(nextValue)
      setEditorStates(nextEditorStates)

      return 'handled'
    }

    // We want to split the block into two
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
        type: pluginData.isNewItemOfSameType ? item.type : 'text',
        indent: item.indent,
      },
      secondEditorState
    )

    secondEditorState = applyStyles(item, secondEditorState)

    const nextEditorStates = { ...editorStates, [item.id]: nextEditorState, [secondItem.id]: secondEditorState }
    let nextValue = [...value]

    nextValue[index] = appendItemData(item, nextEditorState)
    nextValue.splice(index + 1, 0, secondItem)

    nextValue = applyMetadatas(index, nextValue, nextEditorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    setFocusedIndex(index + 1)
    setHoveredIndex(-1)
    setScrollIntoViewId(secondItem.id)

    return 'handled'
  }, [value, editorStates, contextMenuData, pluginsData, onChange, applyStyles, applyMetadatas])

  /* ---
    BACKSPACE
    Handle backspace input, if necessary merge blocks
  --- */
  const handleBackspace = useCallback((index: number) => {
    const item = value[index]

    if (!item) return 'not-handled'

    const editorState = editorStates[item.id]

    if (!editorState) return 'not-handled'

    const pluginData = pluginsData.find(x => x.type === item.type)

    if (!pluginData) return 'not-handled'

    const contentState = editorState.getCurrentContent()
    const firstBlockKey = contentState.getFirstBlock().getKey()
    const selection = editorState.getSelection()

    if (!(selection.isCollapsed() && selection.getAnchorOffset() === 0 && selection.getAnchorKey() === firstBlockKey)) return 'not-handled'
    // If the selection is collapsed and at the beginning of the block, we merge the block with the previous one

    // If the item is indented, we unindent it
    if (item.indent > 0) {
      let nextValue = [...value]

      nextValue[index] = { ...nextValue[index], indent: item.indent - 1 }
      nextValue = applyMetadatas(index, nextValue, editorStates)

      onChange(nextValue)

      return 'handled'
    }

    // If the item is convertible to text, we convert it to a text item
    if (pluginData.isConvertibleToText) {
      let nextValue = [...value]

      nextValue[index] = {
        ...nextValue[index],
        type: 'text',
        metadata: '',
        indent: Math.max(0, Math.min(nextValue[index].indent, 1)),
      }
      nextValue = applyMetadatas(index, nextValue, editorStates)

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
    previousEditorState = applyStyles(item, previousEditorState)

    const nextEditorStates = { ...editorStates, [previousItem.id]: previousEditorState }

    delete nextEditorStates[item.id]

    let nextValue = [...value]

    // Update the previous item
    nextValue[index - 1] = appendItemData(previousItem, previousEditorState)
    // Delete the current item
    nextValue.splice(index, 1)
    // Update metadatas
    nextValue = applyMetadatas(index - 1, nextValue, nextEditorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    setFocusedIndex(index - 1)
    setHoveredIndex(-1)

    return 'handled'
  }, [value, editorStates, pluginsData, onChange, applyStyles, applyMetadatas])

  /* ---
    META BACKSPACE
    Handle delete block on Backspace + Meta or Ctrl
  --- */
  const handleMetaBackspace = useCallback(() => {
    if (focusedIndex <= 0) return

    const item = value[focusedIndex]

    if (!item) return

    const pluginData = pluginsData.find(x => x.type === item.type)

    if (!pluginData) return

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

    // If the item is indented, we unindent it
    if (item.indent > 0) {
      let nextValue = [...value]

      nextValue[focusedIndex] = { ...nextValue[focusedIndex], indent: item.indent - 1 }
      nextValue = applyMetadatas(focusedIndex, nextValue, editorStates)

      onChange(nextValue)

      return 'handled'
    }

    // If the item is convertible to text, we convert it to a text item
    if (pluginData.isConvertibleToText) {
      let nextValue = [...value]

      nextValue[focusedIndex] = {
        ...nextValue[focusedIndex],
        type: 'text',
        metadata: '',
        indent: Math.max(0, Math.min(nextValue[focusedIndex].indent, 1)),
      }
      nextValue = applyMetadatas(focusedIndex, nextValue, editorStates)

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
  }, [value, editorStates, previousEditorStates, pluginsData, focusedIndex, handleBackspace, handleDeleteItem, onChange, applyMetadatas])

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

    const nextEditorStates = { ...editorStates, [nextItem.id]: nextEditorState }

    delete nextEditorStates[item.id]

    let nextValue = [...value]

    // Update the next item
    nextValue[index + 1] = appendItemData(nextItem, nextEditorState)
    // Preserve first item type
    nextValue[index + 1].type = item.type
    // Delete the current item
    nextValue.splice(index, 1)
    // Update metadatas
    nextValue = applyMetadatas(index, nextValue, nextEditorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    setFocusedIndex(index)
    setHoveredIndex(-1)

    return 'handled'
  }, [value, editorStates, onChange, applyMetadatas])

  /* ---
    INDENT AND OUTDENT
  --- */
  const handleIndent = useCallback((index: number, isIndent: boolean) => {
    const item = value[index]

    if (!item) return 'not-handled'

    const pluginData = pluginsData.find(x => x.type === item.type)

    if (!pluginData) return 'not-handled'

    const previousItem = value[index - 1]
    let nextValue = [...value]

    nextValue[index] = {
      ...item,
      indent: Math.max(
        0,
        Math.min(
          pluginData?.maxIndent ?? 1,
          isIndent ? item.indent + 1 : item.indent - 1,
          (previousItem?.indent ?? 0) + 1
        )
      ),
    }
    nextValue = applyMetadatas(index, nextValue, editorStates)

    onChange(nextValue)

    return 'handled'
  }, [value, editorStates, pluginsData, onChange, applyMetadatas])

  /* ---
    BLOCK MOUSE DOWN
  --- */
  const handleBlockMouseDown = useCallback(() => {
    setSelectionData(null)
  }, [])

  /* ---
    FOCUS
  --- */
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index)
    setSelectionData(null)
  }, [])

  /* ---
    BLUR
  --- */
  const handleBlur = useCallback(() => {
    setSelectionData(null)
  }, [])

  /* ---
    FOCUS CONTENT
  --- */
  const handleFocusContent = useCallback((index: number, atStart = false, atEnd = false) => {
    const item = value[index]

    if (!item) return

    forceContentFocus(editorRefs[instanceId], item.id)

    if (!(atStart || atEnd)) return

    const editorState = editorStates[item.id]

    if (!editorState) return

    const contentState = editorState.getCurrentContent()
    let selection: SelectionState

    if (atStart) {
      selection = SelectionState.createEmpty(contentState.getFirstBlock().getKey())
    }
    else {
      const lastBlock = contentState.getLastBlock()

      selection = SelectionState.createEmpty(lastBlock.getKey()).merge({
        focusOffset: lastBlock.getText().length,
        anchorOffset: lastBlock.getText().length,
      })
    }

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

  const handleForceBlurContent = useCallback((index: number) => {
    setForceBlurIndex(index)
  }, [])

  /* ---
    BLUR ALL CONTENT
  --- */
  const handleBlurAllContent = useCallback(() => {
    const allEditorRefs = Object.values(editorRefs[instanceId] ?? {})

    allEditorRefs.forEach(editorRef => editorRef?.blur())
  }, [instanceId])

  /* ---
    ROOT DIV BLUR
  --- */
  const handleRootBlur = useCallback(() => {
    setSelectionData(null)
  }, [])

  /* ---
    DRAG
  --- */
  const handleDrag = useCallback((index: number, isTop: boolean | null) => {
    setDragData({ index, isTop })
  }, [])

  /* ---
    DRAG END
    Move items at the end of a drag session
  --- */
  const handleDragEnd = useCallback((dragIndex: number) => {
    setDragData(null)
    setFocusedIndex(-1)
    handleBlurAllContent()

    if (!dragData) return

    const { index, isTop } = dragData

    if (dragIndex === index) return

    const finalIndex = isTop ? index : index + 1
    let nextValue = [...value]
    let hoveredIndex = finalIndex

    if (dragIndex > finalIndex) {
      nextValue.splice(finalIndex, 0, value[dragIndex])
      nextValue.splice(dragIndex + 1, 1)
    }
    else {
      nextValue.splice(finalIndex, 0, value[dragIndex])
      nextValue.splice(dragIndex, 1)
      hoveredIndex--
    }

    nextValue = applyMetadatas(finalIndex, nextValue, editorStates)

    onChange(nextValue)
    setHoveredIndex(hoveredIndex)
  }, [value, editorStates, dragData, onChange, applyMetadatas, handleBlurAllContent])

  /* ---
    COPY
    Write selected items to clipboard
  --- */
  const handleWindowCopy = useCallback(() => {
    if (!(selectionData && selectionData.items.length)) return

    navigator.clipboard.writeText(JSON.stringify(selectionData.items))
  }, [selectionData])

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

    let nextValue = [...value]

    nextValue.splice(index, 1, appendItemData(item, nextEditorState))

    nextValue = applyMetadatas(index, nextValue, editorStates)

    onChange(nextValue)
  }, [value, editorStates, onChange, applyMetadatas])

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

    const nextEditorStates = { ...editorStates, [id]: nextEditorState }

    let nextValue = [...value]
    const index = nextValue.indexOf(item)
    nextValue.splice(index, 1, appendItemData({ ...item, type: command }, nextEditorState))

    nextValue = applyMetadatas(index, nextValue, editorStates)

    onChange(nextValue)
    setEditorStates(nextEditorStates)
    // Update previousEditorState to clear the command query from them
    setShouldTriggerRefresh(true)
  }, [value, editorStates, contextMenuData, onChange, applyMetadatas])

  /* ---
    BLOCK MENU CLOSE
  --- */
  const handleBlockMenuClose = useCallback(() => {
    setIsBlockMenuOpen(false)
    handleBlurAllContent()
  }, [handleBlurAllContent])

   /* ---
    SELECTION RECT CHANGE
  --- */
  const handleSelectionRect = useCallback((x: number, y: number) => {
    setSelectionRect(r => {
      if (!r) return null

      const nextSelectionRect = {
        ...r,
        top: Math.max(0, Math.min(r.anchorTop, y)),
        left: Math.max(0, Math.min(r.anchorLeft, x)),
        width: Math.max(2, Math.abs(x - r.anchorLeft)),
        height: Math.max(2, Math.abs(y - r.anchorTop)),
      }

      nextSelectionRect.selectedIds = findSelectionRectIds(selectionRefs[instanceId], nextSelectionRect)

      return nextSelectionRect
    })

    window.getSelection()?.removeAllRanges()
  }, [instanceId])

  /* ---
    SCROLL SPEED
    Set the current scroll speed based on the mouse position
  --- */
  const handleScrollSpeed = useCallback((_x: number, y: number) => {
    if (!rootRef.current) return

    const scrollParent = findScrollParent(rootRef.current)
    const { height: parentHeight, top: parentTop } = scrollParent.getBoundingClientRect()
    const { top: childTop } = rootRef.current.getBoundingClientRect()
    const relativeY = y + childTop - parentTop

    // const finalHeight = Math.min(parentHeight, window.innerHeight)
    console.log('relativeY', relativeY, parentHeight,)
    if (relativeY < SELECTION_RECT_SCROLL_OFFSET) {
      setScrollSpeed(BASE_SCROLL_SPEED * (relativeY - SELECTION_RECT_SCROLL_OFFSET) / SELECTION_RECT_SCROLL_OFFSET)

      return
    }

    if (parentHeight - relativeY < SELECTION_RECT_SCROLL_OFFSET) {
      setScrollSpeed(BASE_SCROLL_SPEED * (relativeY - parentHeight + SELECTION_RECT_SCROLL_OFFSET) / SELECTION_RECT_SCROLL_OFFSET)

      return
    }

    setScrollSpeed(0)
  }, [])

  /* ---
    PARENT SCROLL
  --- */
  const handleParentScroll = useCallback(() => {
    console.log('parentScroll')
    if (!(selectionRect && selectionRect.isSelecting)) return

    if (!rootRef.current) return

    // const scrollParent = findScrollParent(rootRef.current)

    // console.log('scrollParent.scrollTop', scrollParent.scrollTop)

    handleSelectionRect(lastRelativeMousePosition.x, lastRelativeMousePosition.y)
  }, [selectionRect, handleSelectionRect])

  /* ---
    ROOT MOUSE MOVE
    Set selection rect if selecting
  --- */
  const handleRootMouseMove = useCallback((event: ReactMouseEvent) => {
    if (!(selectionRect && selectionRect.isSelecting)) return

    const { x, y } = getRelativeMousePosition(rootRef.current!, event)

    lastRelativeMousePosition = { x, y }

    handleScrollSpeed(x, y)
    handleSelectionRect(x, y)
  }, [selectionRect, handleScrollSpeed, handleSelectionRect])

  /* ---
    ROOT MOUSE LEAVE
  --- */
  const handleRootMouseLeave = useCallback(() => {
    if (!(selectionRect && selectionRect.isSelecting)) return

    window.getSelection()?.removeAllRanges()
  }, [selectionRect])

  /* ---
    SINGLE BLOCK SELECTION
  --- */
  const handleSingleBlockSelection = useCallback((id: string) => {
    setSelectionRect({
      isSelecting: false,
      anchorTop: 0,
      anchorLeft: 0,
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      selectedIds: [id],
    })

    window.getSelection()?.removeAllRanges()
  }, [])

  /* ---
    RECT SELECTION START
  --- */
  const handleRectSelectionStart = useCallback((event: ReactMouseEvent) => {
    const { x, y } = getRelativeMousePosition(rootRef.current!, event)

    setSelectionRect({
      isSelecting: true,
      anchorTop: y,
      anchorLeft: x,
      top: y,
      left: x,
      width: 0,
      height: 0,
      selectedIds: [],
    })
  }, [])

  /* ---
    RECT SELECTION END
  --- */
  const handleRectSelectionEnd = useCallback(() => {
    setScrollSpeed(0)

    if (!selectionRect) return

    if (selectionRect.selectedIds.length) {
      setSelectionRect({
        ...selectionRect,
        isSelecting: false,
      })

      return
    }

    setSelectionRect(null)
  }, [selectionRect])

  /* ---
    MULTI BLOCK TEXT SELECTION END
    Triggered when a text selection ends
    Set selectedItems with the content of the selected blocks
    Trimmed at the beginning and end to fit to selection
    When selecting the editor goes into read-only mode, to allow selection between multiple contenteditable divs
    This handler is invoked at mouseup
  --- */
  const handleMultiBlockTextSelectionEnd = useCallback((id: string, blockKey: string, text: string) => {
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

    setSelectionData({
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
    if (selectionRect?.isSelecting) {
      handleRectSelectionEnd()
    }
    else {
      setSelectionRect(null)
    }

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
          handleMultiBlockTextSelectionEnd(dataReactBlockTextId, blockKey, text)
        }
      }
      // Force break a focus bug
      else {
        // Prevent force focus happening on block add button click
        if (findParentWithId(event.target as HTMLElement, ADD_ITEM_BUTTON_ID)) return

        setForceFocusIndex(hoveredIndex)
      }
    }
    catch (error) {
      //
    }
  }, [hoveredIndex, selectionRect, handleRectSelectionEnd, handleMultiBlockTextSelectionEnd])

  /* ---
    KEYDOWN
  --- */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Backspace' && (event.metaKey || event.ctrlKey)) {
      handleMetaBackspace()
    }

    // TODO: remove this if necessary
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
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

    if (command === COMMANDS.INDENT || command === COMMANDS.OUTDENT) {
      return handleIndent(index, command === COMMANDS.INDENT)
    }

    console.log('command not handled', command)

    return 'not-handled'
  }, [onSave, handleBackspace, handleDelete, handleIndent])

  /* ---
    INITIAL VALUE POPULATION
    To create the editorStates and apply styles
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
    forceContentFocus(editorRefs[instanceId], value[forceFocusIndex]?.id)
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
    SCROLL PARENT WHEN SELECTION RECT
  --- */
  useEffect(() => {
    cancelAnimationFrame(scrollParentFrame)

    if (!scrollSpeed) return

    const rootElement = rootRef.current

    if (!rootElement) return

    const scrollParent = findScrollParent(rootElement)
    console.log('scrollSpeed', scrollSpeed, scrollParent === document.documentElement)

    const loop = () => {
      scrollParentFrame = requestAnimationFrame(() => {
        scrollParent.scrollBy({
          top: scrollSpeed,
          behavior: 'auto',
        })
        loop()
      })
    }

    loop()
  }, [scrollSpeed])

  /* ---
    SCROLL PARENT TO UPDATE SELECTION RECT
  --- */
  useEffect(() => {
    if (!rootRef.current) return

    const scrollParent = findScrollParent(rootRef.current)

    scrollParent.addEventListener('scroll', handleParentScroll, { passive: true })

    return () => {
      scrollParent.removeEventListener('scroll', handleParentScroll)
    }
  }, [handleParentScroll])

  /* ---
    SCROLL WINDOW TO UPDATE SELECTION RECT
  --- */
  useEffect(() => {
    window.addEventListener('scroll', handleParentScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleParentScroll)
    }
  }, [handleParentScroll])

  /* ---
    SCROLL INTO VIEW
    Handle scrolling a specific block into view
  --- */
  useEffect(() => {
    if (!scrollIntoViewId) return

    setScrollIntoViewId(null)

    const element = selectionRefs[instanceId]?.[scrollIntoViewId]

    if (!element) return

    element.children[0].scrollIntoView({
      behavior: 'instant',
      inline: 'nearest',
      block: 'nearest',
    })
  }, [instanceId, scrollIntoViewId])

  /* ---
    DRAG SIDE EFFECT
    Prevent hoveredIndex from being set to dragIndex after dragging
  --- */
  useEffect(() => {
    setTimeout(() => {
      setWasDragging(!!dragData)
    }, 16) // 1 frame
  }, [dragData])

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
      if (findParentWithId(event.target as HTMLElement, DRAG_ITEM_BUTTON_ID)) return

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
    RENDER EDITOR
    Render the editor for each item of value
  --- */
  const renderEditor = useCallback((item: ReactBlockTextDataItem, index: number, array: any[]) => {
    if (!editorStates[item.id]) return null

    const plugin = pluginsData.find(plugin => plugin.type === item.type)

    if (!plugin) return null

    const commonProps = {
      item,
      index,
      pluginsData,
      focusContent: () => handleFocusContent(index),
      focusContentAtStart: () => handleFocusContent(index, true),
      focusNextContent: () => handleFocusContent(index + 1),
      blurContent: () => handleBlurContent(index),
      onRectSelectionMouseDown: handleRectSelectionStart,
    }

    const blockContentProps: BlockContentProps = {
      ...commonProps,
      BlockContentText,
      editorState: editorStates[item.id],
      readOnly: isSelecting || !!readOnly,
      focused: !dragData && index === focusedIndex,
      isSelecting,
      placeholder: "Start typing or press '/' for commands",
      fallbackPlaceholder: '',
      registerRef: ref => registerRef(item.id, ref),
      onChange: editorState => handleChange(item.id, editorState),
      onReturn: event => handleReturn(index, event),
      onUpArrow: event => handleUpArrow(index, event),
      onDownArrow: event => handleDownArrow(index, event),
      onFocus: () => handleFocus(index),
      onBlur: handleBlur,
      onPaste: () => handlePaste(index),
      onKeyCommand: command => handleKeyCommand(index, command),
      onBlockSelection: () => handleSingleBlockSelection(item.id),
      forceBlurContent: () => handleForceBlurContent(index),
    }

    const blockProps: Omit<BlockProps, 'children'> = {
      ...commonProps,
      readOnly: !!readOnly,
      selected: !!selectionRect?.selectedIds.includes(item.id),
      hovered: !dragData && index === hoveredIndex,
      isDraggingTop: dragData?.index === index
        ? index === array.length - 1
          ? dragData.isTop
          : dragData.isTop || null
        : dragData?.index === index - 1 && dragData.isTop === false
          ? true
          : null,
      paddingLeft,
      registerSelectionRef: ref => registerSelectionRef(item.id, ref),
      onAddItem: () => handleAddItem(index),
      onDeleteItem: () => handleDeleteItem(index),
      onDuplicateItem: () => handleDuplicateItem(index),
      onMouseDown: handleBlockMouseDown,
      onMouseMove: () => !wasDragging && setHoveredIndex(index),
      onMouseLeave: () => !wasDragging && setHoveredIndex(previous => previous === index ? -1 : previous),
      onDragStart: () => setDragData({ index, isTop: null }),
      onDrag: handleDrag,
      onDragEnd: () => handleDragEnd(index),
      onBlockMenuOpen: () => setIsBlockMenuOpen(true),
      onBlockMenuClose: handleBlockMenuClose,
      blockContentProps, // Pass block content props to block for drag preview display
    }

    const { BlockContent } = plugin

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
    pluginsData,
    editorStates,
    hoveredIndex,
    focusedIndex,
    dragData,
    wasDragging,
    selectionRect,
    registerRef,
    registerSelectionRef,
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
    handleDrag,
    handleDragEnd,
    handleBlockMenuClose,
    handleBlockMouseDown,
    handleFocusContent,
    handleBlurContent,
    handleForceBlurContent,
    handleRectSelectionStart,
    handleSingleBlockSelection,
    handleKeyCommand,
  ])

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
          onMouseMove={handleRootMouseMove}
          onMouseLeave={handleRootMouseLeave}
          className="relative"
        >
          <div
            onClick={() => handleFocusContent(0)}
            onMouseDown={handleRectSelectionStart}
            className="cursor-text"
            style={{ height: paddingTop ?? 0 }}
          />
          {value.map(renderEditor)}
          {!!contextMenuData && (
            <ContextMenu
              pluginsData={pluginsData}
              query={contextMenuData.query}
              top={contextMenuData.top}
              bottom={contextMenuData.bottom}
              left={contextMenuData.left}
              onClose={() => setContextMenuData(null)}
              onSelect={handleContextMenuSelect}
            />
          )}
          {!!selectionRect?.isSelecting && (
            <SelectionRect
              top={selectionRect.top}
              left={selectionRect.left}
              width={selectionRect.width}
              height={selectionRect.height}
            />
          )}
          {!!(
            (selectionRect?.isSelecting && selectionRect.width && selectionRect.height)
            || isBlockMenuOpen
          ) && (
            <div className="absolute inset-0 z-10" />
          )}
          <div
            onClick={() => handleFocusContent(value.length - 1, false, true)}
            onMouseDown={handleRectSelectionStart}
            className="cursor-text"
            style={{ height: paddingBottom ?? 0 }}
          />
        </div>
        <DragLayer pluginsData={pluginsData} />
      </PrimaryColorContext.Provider>
    </DndProvider>
  )
}

export default ReactBlockText
