import type { ReactNode } from 'react'
import type { DraftHandleValue, EditorState } from 'draft-js'

export type ReactRichTextData = ReactRichTextDataItem[]

export type ReactRichTextDataItemType = 'text' | 'heading1' | 'heading2' | 'heading3'

export type ReactRichTextDataItem = {
  id: string
  type: ReactRichTextDataItemType
  data: string
}

export type ReactRichTextProps = {
  value: ReactRichTextData
  onChange: (value: ReactRichTextData) => void
}

export type ContextMenuData = {
  id: string
  query: string
  top: number
  left: number
}

export type BlockProps = {
  id: string
  type: ReactRichTextDataItemType
  index: number
  editorState: EditorState
  hovered: boolean
  focused: boolean
  registerRef: (ref: any) => void
  onAddItem: () => void
  onChange: (editorState: EditorState) => void
  onBeforeInput: (chars: string) => DraftHandleValue
  onReturn: (event: any) => DraftHandleValue
  onUpArrow: (event: any) => void
  onDownArrow: (event: any) => void
  onFocus: () => void
  onBlur: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onDragStart: () => void
  onDrag: (dragIndex: number, hoverIndex: number) => void
  onDragEnd: () => void
}

export interface DragItem {
  index: number
  id: string
  type: string
}

export type ContextMenuProps = {
  query: string
  top: number
  left: number
  onSelect: (command: ReactRichTextDataItemType) => void
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
