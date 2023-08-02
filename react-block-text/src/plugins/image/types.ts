import type { BlockContentProps as ReactBlockTextBlockContentProps } from '../../types'

export type PluginOptions = {
  maxFileSize?: string
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  maxFileSize?: string
}
