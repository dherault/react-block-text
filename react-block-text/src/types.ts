import type { CSSProperties, ComponentType, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { DraftHandleValue, Editor, EditorState } from 'draft-js'

export type ReactBlockTextDataItemType = 'text' | string

export type ReactBlockTextDataItem = {
  reactBlockTextVersion: string
  id: string
  type: ReactBlockTextDataItemType
  data: string
  metadata: string
  indent: number
}

export type ReactBlockTextData = ReactBlockTextDataItem[]

export type ReactBlockTextOnChange = (item: ReactBlockTextDataItem, editorState: EditorState) => void

export type ReactBlockTextPluginOptions = {
  primaryColor: string
  onChange: ReactBlockTextOnChange
}

export type ReactBlockTextPluginData = {
  type: string
  title: string
  label: string
  shortcuts: string
  icon: ReactNode
  isConvertibleToText?: boolean
  isNewItemOfSameType?: boolean
  maxIndent?: number // default: 0
  paddingTop?: number // default: 3
  paddingBottom?: number // default: 3
  iconsPaddingTop?: number // default: 0
  styleMap?: Record<string, CSSProperties>
  applyStyles?: (item: ReactBlockTextDataItem, editorState: EditorState) => EditorState
  applyMetadatas?: (index: number, value: ReactBlockTextDataItem[], editorStates: ReactBlockTextEditorStates) => ReactBlockTextDataItem[]
  BlockContent: ComponentType<BlockContentProps>
}

export type ReactBlockTextPlugin = (options: ReactBlockTextPluginOptions) => ReactBlockTextPluginData

export type ReactBlockTextPlugins = ReactBlockTextPlugin[]

export type ReactBlockTextEditorStates = Record<string, EditorState>

export type ReactBlockTextProps = {
  value: string
  plugins?: ReactBlockTextPlugins
  readOnly?: boolean
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  primaryColor?: string | null
  textColor?: string | null
  onChange?: (value: string) => void
  onSave?: () => void
}

export type BlockProps = {
  children: ReactNode
  pluginsData: ReactBlockTextPluginData[]
  item: ReactBlockTextDataItem
  index: number
  readOnly: boolean
  selected: boolean
  hovered: boolean
  isDraggingTop: boolean | null
  paddingLeft?: number
  paddingRight?: number
  noPadding?: boolean
  registerSelectionRef: (ref: any) => void
  onAddItem: () => void
  onDeleteItem: () => void
  onDuplicateItem: () => void
  onMouseDown: () => void
  onMouseMove: () => void
  onMouseLeave: () => void
  onRectSelectionMouseDown: (event: ReactMouseEvent) => void
  onDragStart: () => void
  onDrag: (index: number, isTop: boolean | null) => void
  onDragEnd: () => void
  onBlockMenuOpen: () => void
  onBlockMenuClose: () => void
  focusContent: () => void
  focusContentAtStart: () => void
  focusContentAtEnd: () => void
  focusNextContent: () => void
  blurContent: () => void
  blockContentProps: BlockContentProps
}

export type BlockContentProps = {
  BlockContentText: ComponentType<BlockContentProps>
  pluginsData: ReactBlockTextPluginData[]
  item: ReactBlockTextDataItem
  index: number
  editorState: EditorState
  readOnly: boolean
  focused: boolean
  isSelecting: boolean
  placeholder: string
  fallbackPlaceholder: string
  registerRef: (ref: any) => void
  onChange: (editorState: EditorState) => void
  onKeyCommand: (command: string) => DraftHandleValue
  onReturn: (event: any) => DraftHandleValue
  onUpArrow: (event: any) => void
  onDownArrow: (event: any) => void
  onFocus: () => void
  onBlur: () => void
  onPaste: () => DraftHandleValue
  onBlockSelection: () => void
  onRectSelectionMouseDown: (event: ReactMouseEvent) => void
  focusContent: () => void
  focusContentAtStart: () => void
  focusContentAtEnd: () => void
  focusNextContent: () => void
  blurContent: () => void
  forceBlurContent: () => void
}

export type BlockCommonProps = {
  [K in keyof BlockProps & keyof BlockContentProps]: BlockProps[K] | BlockContentProps[K]
}

export type QueryMenuProps = {
  pluginsData: ReactBlockTextPluginData[]
  query: string
  top?: number
  bottom?: number
  left: number
  onSelect: (command: ReactBlockTextDataItemType) => void
  onClose: () => void
}

export type QueryMenuItemProps = {
  title: string
  label: string
  icon: ReactNode
  active: boolean
  shouldScrollIntoView: boolean
  resetShouldScrollIntoView: () => void
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export type QueryMenuIconProps = {
  children: ReactNode
}

export type BlockMenuProps = {
  top: number
  left: number
  onDeleteItem: () => void
  onDuplicateItem: () => void
  onClose: () => void
}

export type BlockMenuItemProps = {
  icon: ReactNode
  label: string
  onClick: () => void
}

export type DragLayerProps = {
  pluginsData: ReactBlockTextPluginData[]
  blockProps: Omit<BlockProps, 'children'>[]
  dragIndex: number
}

export type SelectionRectProps = {
  top: number
  left: number
  width: number
  height: number
}

export type QueryMenuData = {
  id: string
  query: string
  top?: number
  bottom?: number
  left: number
  noSlash?: boolean
}

export type TopLeft = {
  top: number
  left: number
}

export type SelectionTextData = {
  items: ReactBlockTextDataItem[]
  startId: string
  text: string
}

export type SelectionRectData = SelectionRectProps & {
  isSelecting: boolean
  anchorTop: number
  anchorLeft: number
  selectedIds: string[]
}

export type DragData = {
  dragIndex: number
  dropIndex: number
  isTop: boolean | null
}

export type EditorRefRegistry = Record<string, Editor | null>

export type XY = {
  x: number
  y: number
}

export type DragAndDropCollect = {
  handlerId: string | symbol | null
}

export type ArrowData = {
  isTop: boolean
  index: number
  offset: number
}
