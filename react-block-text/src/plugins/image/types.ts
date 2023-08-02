import type { BlockContentProps as ReactBlockTextBlockContentProps, ReactBlockTextOnChange } from '../../types'

export type PluginOptions = {
  maxFileSize?: string
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  onItemChange: ReactBlockTextOnChange
  maxFileSize?: string
}

export type ImageSelectorProps = {
  maxFileSize?: string
}

export type Mode = 'upload' | 'url'

export type ImageUploaderProps = {
  maxFileSize?: string
}
