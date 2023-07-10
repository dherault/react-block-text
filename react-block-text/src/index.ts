import ReactBlockText from './components/ReactBlockText'

export type {
  ReactBlockTextData,
  ReactBlockTextDataItem,
  ReactBlockTextDataItemType,
  ReactBlockTextOnChange,
  ReactBlockTextPluginData,
  ReactBlockTextPluginOptions,
  ReactBlockTextPlugins,
  ReactBlockTextProps,
} from './types'

export * from './plugins/header'

export * from './plugins/todo'

export * from './plugins/list'

export * from './plugins/quote'

export { DEFAULT_PRIMARY_COLOR, VERSION } from './constants'

export default ReactBlockText
