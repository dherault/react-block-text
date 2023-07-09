import type { HTMLAttributes, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { DraftHandleValue, EditorState } from 'draft-js'

export type ReactBlockTextDataItemType = 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'todo'
  | 'bulleted-list'
  | 'numbered-list'
  | 'quote'

export type ReactBlockTextDataItem = {
  reactBlockTextVersion: string
  id: string
  type: ReactBlockTextDataItemType
  data: string
  metadata: string
}

export type ReactBlockTextData = ReactBlockTextDataItem[]

export type ReactBlockTextProps = {
  value: string
  readOnly?: boolean
  paddingTop?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string
  primaryColor?: string | null
  onChange: (value: string) => void
  onSave?: () => void
}

export type BlockProps = {
  children: ReactNode
  id: string
  type: ReactBlockTextDataItemType
  index: number
  readOnly: boolean
  hovered: boolean
  paddingLeft?: number | string
  isDraggingTop: boolean | null
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
  type: ReactBlockTextDataItemType
  index: number
  editorState: EditorState
  metadata: string
  readOnly: boolean
  focused: boolean
  isSelecting: boolean
  registerRef: (ref: any) => void
  onChange: (editorState: EditorState) => void
  onKeyCommand: (command: string) => DraftHandleValue
  onReturn: (event: any) => DraftHandleValue
  onUpArrow: (event: any) => void
  onDownArrow: (event: any) => void
  onFocus: () => void
  onBlur: () => void
  onPaste: () => DraftHandleValue
  onCheck: (checked: boolean) => void
}

export type ContextMenuProps = {
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

export type CheckboxProps = HTMLAttributes<HTMLDivElement> & {
  checked: boolean
  onCheck: (checked: boolean) => void
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

export type SelectionRectData = {
  top: number
  left: number
  width: number
  height: number
}

export type BlockContentListMetadata = {
  label: string
  depth: number
}

export type DragData = {
  index: number
  isTop: boolean | null
}
