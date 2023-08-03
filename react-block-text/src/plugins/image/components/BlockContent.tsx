import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ReactBlockTextDataItem } from '../../..'
import type { BlockContentProps, Metadata, ReactBlockTextImagePluginSubmitter } from '../types'

import Image from './Image'
import ImageSelector from './ImageSelector'
import ImageSkeleton from './ImageSkeleton'

const DEFAULT_HEIGHT = 256

function BlockContent(props: BlockContentProps) {
  const { item, editorState, maxFileSize, onSubmitFile, onSubmitUrl, getUrl, onItemChange } = props
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitter, setSubmitter] = useState<ReactBlockTextImagePluginSubmitter | null>(null)
  const [progress, setProgress] = useState(0)
  const [nextImageKey, setNextImageKey] = useState('')
  const [isError, setIsError] = useState(false)

  // Width is relative from 0 to 1 --> 0% to 100%, height is absolute
  const { imageKey, width, height } = useMemo<Metadata>(() => {
    try {
      const { imageKey, width, height } = JSON.parse(item.metadata) as Metadata

      return { imageKey, width, height }
    }
    catch {
      return { imageKey: '', width: 1, height: DEFAULT_HEIGHT }
    }
  }, [item.metadata])

  const [nextWidth, setNextWidth] = useState(width)
  const [nextHeight, setNextHeight] = useState(height)

  const setDimensions = useCallback((width: number, height: number) => {
    setNextWidth(width)
    setNextHeight(height)
  }, [])

  const handleSubmitFile = useCallback(async (file: File) => {
    setFile(file)

    const submitter = await onSubmitFile(file)

    setSubmitter(() => submitter)
  }, [onSubmitFile])

  const handleSubmitUrl = useCallback(async (url: string) => {
    setUrl(url)

    const submitter = await onSubmitUrl(url)

    setSubmitter(() => submitter)
  }, [onSubmitUrl])

  const handleFetchUrl = useCallback(async (imageKey: string) => {
    const url = await getUrl(imageKey)

    setUrl(url)
  }, [getUrl])

  useEffect(() => {
    if (typeof submitter !== 'function') return

    const intervalId = setInterval(() => {
      const { progress, imageKey, isError } = submitter()

      setProgress(progress)

      if (imageKey) setNextImageKey(imageKey)
      if (isError) setIsError(true)
    }, 200)

    return () => {
      clearInterval(intervalId)
    }
  }, [submitter])

  useEffect(() => {
    if (!nextImageKey) return
    if (imageKey === nextImageKey && width === nextWidth && height === nextHeight) return

    const metadata: Metadata = {
      imageKey: imageKey || nextImageKey,
      width: nextWidth,
      height: nextHeight,
    }
    const nextItem: ReactBlockTextDataItem = {
      ...item,
      metadata: JSON.stringify(metadata),
    }

    onItemChange(nextItem, editorState)
  }, [imageKey, nextImageKey, width, nextWidth, height, nextHeight, item, editorState, onItemChange])

  useEffect(() => {
    if (!(nextImageKey || imageKey)) return

    handleFetchUrl(nextImageKey || imageKey)
  }, [nextImageKey, imageKey, handleFetchUrl])

  if (isError) {
    return (
      <div className="p-2 w-full text-red-500 border border-red-500">
        An error occurred while uploading the image.
      </div>
    )
  }

  if (url || file) {
    return (
      <Image
        src={url || URL.createObjectURL(file!)}
        width={nextWidth}
        progress={progress}
        setDimensions={setDimensions}
      />
    )
  }

  if (!item.metadata) {
    return (
      <ImageSelector
        maxFileSize={maxFileSize}
        onSubmitFile={handleSubmitFile}
        onSubmitUrl={handleSubmitUrl}
      />
    )
  }

  return (
    <ImageSkeleton
      width={nextWidth}
      height={nextHeight}
    />
  )
}

export default BlockContent
