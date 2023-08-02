import type { BlockContentProps as ReactBlockTextBlockContentProps, ReactBlockTextOnChange } from '../../types'

export type PluginOptions = {
  maxFileSize?: string
  onSubmitFile: (file: File) => void
  onSubmitUrl: (url: string) => void
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  maxFileSize?: string
  onItemChange: ReactBlockTextOnChange
  onSubmitFile: (file: File) => void
  onSubmitUrl: (url: string) => void
}

export type ImageSelectorProps = {
  maxFileSize?: string
  onSubmitFile: (file: File) => void
  onSubmitUrl: (url: string) => void
}

export type Mode = 'upload' | 'url'

export type ImageUploaderProps = {
  maxFileSize?: string
  onSubmitFile: (file: File) => void
  onSubmitUrl: (url: string) => void
}

export type LoadingImageProps = {
  file?: File | null
  url?: string
}

export type ImageProps = {
  src: string
}
