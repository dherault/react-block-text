import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function textPlugin(): ReactBlockTextPlugins {
  return [
    () => ({
      type: 'text',
      blockCategory: 'basic',
      title: 'Text',
      label: 'Just start writing with plain text.',
      shortcuts: 'txt',
      icon: <Icon />,
      BlockContent,
    }),
  ]
}

export default textPlugin
