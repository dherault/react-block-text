import type { ReactNode } from 'react'
import type { DraftHandleValue, EditorState } from 'draft-js'

export type ReactBlockTextDataItemType = 'text' | 'heading1' | 'heading2' | 'heading3'

export type ReactBlockTextDataItem = {
  reactBlockTextVersion: string
  id: string
  type: ReactBlockTextDataItemType
  data: string
}

export type ReactBlockTextData = ReactBlockTextDataItem[]

export type ReactBlockTextProps = {
  value: ReactBlockTextData
  readOnly?: boolean
  onChange: (value: ReactBlockTextData) => void
}

export type BlockProps = {
  children: ReactNode
  id: string
  type: ReactBlockTextDataItemType
  index: number
  readOnly: boolean
  hovered: boolean
  onAddItem: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onDragStart: () => void
  onDrag: (dragIndex: number, hoverIndex: number) => void
  onDragEnd: () => void
  onDelete: () => void
}

export type BlockContentTextProps = {
  type: ReactBlockTextDataItemType
  readOnly: boolean
  editorState: EditorState
  focused: boolean
  registerRef: (ref: any) => void
  onChange: (editorState: EditorState) => void
  onReturn: (event: any) => DraftHandleValue
  onUpArrow: (event: any) => void
  onDownArrow: (event: any) => void
  onFocus: () => void
  onBlur: () => void
  onCopy: () => void
  onPaste: () => DraftHandleValue
  onBackspace: () => DraftHandleValue
  onDelete: () => DraftHandleValue
}

export type ContextMenuProps = {
  query: string
  top: number
  left: number
  onSelect: (command: ReactBlockTextDataItemType) => void
  onClose: () => void
}

export type ContextMenuItemProps = {
  title: string
  label: string
  icon: ReactNode
  active: boolean
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
  onDelete: () => void
  onClose: () => void
}

export type BlockMenuItemProps = {
  icon: ReactNode
  label: string
  onClick: () => void
}

export type ContextMenuData = {
  id: string
  query: string
  top: number
  left: number
}

export interface DragItem {
  index: number
  id: string
  type: string
}

export type TopLeft = {
  top: number
  left: number
}
