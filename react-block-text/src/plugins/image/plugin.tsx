import type { ReactBlockTextPlugins } from '../../types'

import type { PluginOptions } from './types'
import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

function imagePlugin(options: PluginOptions): ReactBlockTextPlugins {
  if (typeof options.onSubmitFile !== 'function') throw new Error('Image plugin: you must provide a "onSubmitFile" function to handle file uploads.')
  if (typeof options.onSubmitUrl !== 'function') throw new Error('Image plugin: you must provide a "onSubmitUrl" function to handle url uploads.')
  if (typeof options.getUrl !== 'function') throw new Error('Image plugin: you must provide a "getUrl" function to handle image downloads.')

  return [
    ({ onChange }) => ({
      type: 'image',
      blockCategory: 'media',
      title: 'Image',
      label: 'Upload or embed with a link.',
      shortcuts: 'img,photo,picture',
      icon: <Icon />,
      isConvertibleToText: false,
      paddingTop: 5,
      paddingBottom: 5,
      BlockContent: props => (
        <BlockContent
          {...props}
          onItemChange={onChange}
          onSubmitFile={options.onSubmitFile}
          onSubmitUrl={options.onSubmitUrl}
          getUrl={options.getUrl}
          maxFileSize={options.maxFileSize}
        />
      ),
    }),
  ]
}

export default imagePlugin
