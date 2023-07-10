import './index.css'

import ReactBlockText from './components/ReactBlockText'

import headerPlugin from './plugins/header'
import todoPlugin from './plugins/todo'
import listPlugin from './plugins/list'
import quotePlugin from './plugins/quote'

export type {
  ReactBlockTextData,
  ReactBlockTextDataItem,
  ReactBlockTextDataItemType,
  ReactBlockTextOnChange,
  ReactBlockTextPluginData,
  ReactBlockTextPluginOptions,
  ReactBlockTextPlugins,
  ReactBlockTextPlugin,
  ReactBlockTextProps,
} from './types'

export { DEFAULT_PRIMARY_COLOR, VERSION } from './constants'

export {
  headerPlugin,
  todoPlugin,
  listPlugin,
  quotePlugin,
}

export default ReactBlockText
