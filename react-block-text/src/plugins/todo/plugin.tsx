import type { ReactBlockTextPlugins } from '../../types'

import { INLINE_STYLES } from './constants'

import applyTodoStyle from './utils/applyTodoStyle'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function todoPlugin(): ReactBlockTextPlugins {
  return [
    ({ onChange }) => ({
      type: 'todo',
      blockCategory: 'basic',
      title: 'To-do list',
      label: 'Track tasks with a to-do list.',
      shortcuts: 'todo',
      icon: <Icon />,
      isConvertibleToText: true,
      isNewItemOfSameType: true,
      paddingTop: 5,
      paddingBottom: 5,
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
        />
      ),
    }),
  ]
}

export default todoPlugin
