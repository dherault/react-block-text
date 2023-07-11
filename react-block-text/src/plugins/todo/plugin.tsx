import type { ReactBlockTextPlugins } from '../../types'

import { DEFAULT_PRIMARY_COLOR } from '../../constants'

import type { PluginOptions } from './types'

import { INLINE_STYLES } from './constants'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'
import applyTodoStyle from './utils/applyTodoStyle'

function todoPlugin(options?: PluginOptions): ReactBlockTextPlugins {
  const color = options?.color || DEFAULT_PRIMARY_COLOR

  return [
    ({ onChange }) => ({
      type: 'todo',
      title: 'To-do list',
      label: 'Track tasks with a to-do list.',
      shortcuts: 'todo',
      icon: <Icon color={color || DEFAULT_PRIMARY_COLOR} />,
      isConvertibleToText: true,
      isNewItemOfSameType: true,
      paddingTop: 5,
      paddingBottom: 5,
      iconsPaddingTop: 0,
      styleMap: {
        [INLINE_STYLES.TODO_CHECKED]: {
          color: '#9ca3af',
          textDecoration: 'line-through',
          textDecorationThickness: 'from-font',
        },
      },
      applyStyles: applyTodoStyle,
      BlockContent: props => (
        <BlockContent
          {...props}
          onItemChange={onChange}
          color={color || DEFAULT_PRIMARY_COLOR}
        />
      ),
    }),
  ]
}

export default todoPlugin
