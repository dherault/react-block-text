import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function imagePlugin(): ReactBlockTextPlugins {
  return [
    () => ({
      type: 'image',
      blockCategory: 'media',
      title: 'Image',
      label: 'Upload or embed with a link.',
      shortcuts: 'img,photo,picture',
      icon: <Icon />,
      isConvertibleToText: false,
      paddingTop: 5,
      paddingBottom: 5,
      BlockContent,
    }),
  ]
}

export default imagePlugin
