import type { ReactBlockTextPlugins } from '../../types'

import Icon from './components/Icon'
import BlockContent from './components/BlockContent'

function textPlugin(): ReactBlockTextPlugins {
  return [
    {
      type: 'text',
      title: 'Text',
      label: 'Just start writing with plain text.',
      shortcuts: 'txt',
      icon: <Icon />,
      isConvertibleToText: true,
      paddingTop: 3,
      paddingBottom: 3,
      iconsPaddingTop: 0,
      BlockContent,
    },
  ]
}

export default textPlugin
