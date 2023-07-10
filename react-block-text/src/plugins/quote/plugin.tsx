import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function quotePlugin(): ReactBlockTextPlugins {
  return [
    () => ({
      type: 'quote',
      title: 'Quote',
      label: 'Capture a quote.',
      shortcuts: 'citation',
      icon: <Icon />,
      isConvertibleToText: true,
      paddingTop: 5,
      paddingBottom: 5,
      iconsPaddingTop: 0,
      BlockContent,
    }),
  ]
}

export default quotePlugin
