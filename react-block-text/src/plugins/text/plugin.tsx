import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function textPlugin(): ReactBlockTextPlugins {
  return [
    () => ({
      type: 'text',
      title: 'Text',
      label: 'Just start writing with plain text.',
      shortcuts: 'txt',
      icon: <Icon />,
      paddingTop: 3,
      paddingBottom: 3,
      iconsPaddingTop: 0,
      BlockContent,
    }),
  ]
}

export default textPlugin
