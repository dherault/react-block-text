import type { BlockCategory } from './types'

export const VERSION = '1.0.0'

export const COMMANDS = {
  SAVE: 'SAVE',
  ARROW_UP: 'ARROW_UP',
  ARROW_DOWN: 'ARROW_DOWN',
  INDENT: 'INDENT',
  OUTDENT: 'OUTDENT',
}

export const INDENT_SIZE = 24

export const BLOCK_ICONS_WIDTH = 50

export const QUERY_MENU_WIDTH = 280

export const QUERY_MENU_HEIGHT = 322

export const ADD_ITEM_BUTTON_ID = 'react-block-text-add-item-button'

export const DRAG_ITEM_BUTTON_ID = 'react-block-text-drag-item-button'

export const DEFAULT_PRIMARY_COLOR = '#3b82f6'

export const DEFAULT_TEXT_COLOR = '#37352f'

export const SELECTION_RECT_SCROLL_OFFSET = 64

export const BASE_SCROLL_SPEED = 16

export const BLOCK_CATEGORY_TO_LABEL: Record<BlockCategory, string> = {
  basic: 'Basic blocks',
  media: 'Media',
  database: 'Database',
  advanced: 'Advanced blocks',
  inline: 'Inline',
  embed: 'Embeds',
}
