import type { Dispatch, SetStateAction } from 'react'

import type { BlockContentProps as ReactBlockTextBlockContentProps, ReactBlockTextOnChange } from '../../types'

export type Metadata = {
  imageKey: string
  width: number // between 0 and 1
  ratio: number // width / height
}

export type ReactBlockTextImagePluginSubmition = {
  progress: number // Between 0 and 1
  imageKey?: string // The reference to the image once it's uploaded
  isError?: boolean
}

export type ReactBlockTextImagePluginSubmitter = () => ReactBlockTextImagePluginSubmition

export type PluginOptions = {
  maxFileSize?: string
  onSubmitFile: (file: File) => Promise<ReactBlockTextImagePluginSubmitter>
  onSubmitUrl: (url: string) => Promise<ReactBlockTextImagePluginSubmitter>
  getUrl: (imageKey: string) => Promise<string>
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  maxFileSize?: string
  onItemChange: ReactBlockTextOnChange
  onSubmitFile: (file: File) => Promise<ReactBlockTextImagePluginSubmitter>
  onSubmitUrl: (url: string) => Promise<ReactBlockTextImagePluginSubmitter>
  getUrl: (imageKey: string) => Promise<string>
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

export type ResizableImageProps = {
  src?: string
  width: number
  ratio: number
  progress: number
  setWidth: Dispatch<SetStateAction<number>>
  setRatio: Dispatch<SetStateAction<number>>
}
