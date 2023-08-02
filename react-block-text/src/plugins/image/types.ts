import type { BlockContentProps as ReactBlockTextBlockContentProps } from '../../types'

export type PluginOptions = {
  maxFileSize?: number
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  maxFileSize?: number
}
