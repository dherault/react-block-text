import type { CSSProperties, ComponentType, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { DraftHandleValue, Editor, EditorState } from 'draft-js'

export type ReactBlockTextDataItemType = 'text' | string

export type ReactBlockTextDataItem = {
  reactBlockTextVersion: string
  id: string
  type: ReactBlockTextDataItemType
  data: string
  metadata: string
}

export type ReactBlockTextData = ReactBlockTextDataItem[]

export type ReactBlockTextOnChange = (item: ReactBlockTextDataItem, editorState: EditorState) => void

export type ReactBlockTextPluginOptions = {
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
  paddingTop: number
  paddingBottom: number
  iconsPaddingTop: number
  styleMap?: Record<string, CSSProperties>
  applyStyles?: (item: ReactBlockTextDataItem, editorState: EditorState) => EditorState
  BlockContent: ComponentType<BlockContentProps>
}

export type ReactBlockTextPlugin = (options: ReactBlockTextPluginOptions) => ReactBlockTextPluginData

export type ReactBlockTextPlugins = ReactBlockTextPlugin[]

export type ReactBlockTextProps = {
  value: string
  plugins?: ReactBlockTextPlugins
  readOnly?: boolean
  paddingTop?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string
  primaryColor?: string | null
  onChange?: (value: string) => void
  onSave?: () => void
}

export type BlockProps = {
  children: ReactNode
  pluginsData: ReactBlockTextPluginData[]
  id: string
  type: ReactBlockTextDataItemType
  index: number
  readOnly: boolean
  selected: boolean
  hovered: boolean
  paddingLeft?: number | string
  isDraggingTop: boolean | null
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
  metadata: string
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
  focusNextContent: () => void
  blurContent: () => void
  forceBlurContent: () => void
}

export type ContextMenuProps = {
  pluginsData: ReactBlockTextPluginData[]
  query: string
  top?: number
  bottom?: number
  left: number
  onSelect: (command: ReactBlockTextDataItemType) => void
  onClose: () => void
}

export type ContextMenuItemProps = {
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

export type ContextMenuIconProps = {
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
}

export type SelectionRectProps = {
  top: number
  left: number
  width: number
  height: number
}

export type ContextMenuData = {
  id: string
  query: string
  top?: number
  bottom?: number
  left: number
}

export type TopLeft = {
  top: number
  left: number
}

export type SelectionData = {
  items: ReactBlockTextDataItem[]
  startId: string
}

export type SelectionRectData = SelectionRectProps & {
  isSelecting: boolean
  anchorTop: number
  anchorLeft: number
  selectedIds: string[]
}

export type DragData = {
  index: number
  isTop: boolean | null
}

export type EditorRefRegistry = Record<string, Editor | null>
