import './index.css'

import ReactBlockText from './components/ReactBlockText'

import headerPlugin from './plugins/header'
import listPlugin from './plugins/list'
import quotePlugin from './plugins/quote'
import todoPlugin from './plugins/todo'

export { DEFAULT_PRIMARY_COLOR, VERSION } from './constants'

export {
  headerPlugin,
  listPlugin,
  quotePlugin,
  todoPlugin,
}

export type {
  ReactBlockTextData,
  ReactBlockTextDataItem,
  ReactBlockTextDataItemType,
  ReactBlockTextOnChange,
  ReactBlockTextPlugin,
  ReactBlockTextPluginData,
  ReactBlockTextPluginOptions,
  ReactBlockTextPlugins,
  ReactBlockTextProps,
} from './types'

export default ReactBlockText
