import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function quotePlugin(): ReactBlockTextPlugins {
  return [
    () => ({
      type: 'quote',
      blockCategory: 'basic',
      title: 'Quote',
      label: 'Capture a quote.',
      shortcuts: 'citation',
      icon: <Icon />,
      isConvertibleToText: true,
      paddingTop: 5,
      paddingBottom: 5,
      BlockContent,
    }),
  ]
}

export default quotePlugin
