import type { HTMLAttributes, ReactNode } from 'react'
import type { DraftHandleValue, EditorState } from 'draft-js'

export type ReactBlockTextDataItemType = 'text' | 'heading1' | 'heading2' | 'heading3' | 'todo'

export type ReactBlockTextDataItem = {
  reactBlockTextVersion: string
  id: string
  type: ReactBlockTextDataItemType
  data: string
  metadata: string
}

export type ReactBlockTextData = ReactBlockTextDataItem[]

export type ReactBlockTextProps = {
  value: ReactBlockTextData
  readOnly?: boolean
  onChange: (value: ReactBlockTextData) => void
  onSave?: () => void
}

export type BlockProps = {
  children: ReactNode
  id: string
  type: ReactBlockTextDataItemType
  index: number
  readOnly: boolean
  hovered: boolean
  onAddItem: () => void
  onMouseDown: () => void
  onMouseMove: () => void
  onMouseLeave: () => void
  onDragStart: () => void
  onDrag: (dragIndex: number, hoverIndex: number) => void
  onDragEnd: () => void
  onDeleteItem: () => void
  focusContent: () => void
  focusNextContent: () => void
  blurContent: () => void
}

export type BlockContentProps = {
  type: ReactBlockTextDataItemType
  editorState: EditorState
  metadata: string
  readOnly: boolean
  focused: boolean
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

export type CheckboxProps = HTMLAttributes<HTMLDivElement> & {
  checked: boolean
  onCheck: (checked: boolean) => void
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

export type ReactBlockTextSelection = {
  items: ReactBlockTextDataItem[]
  startId: string
}
