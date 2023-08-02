import { useCallback, useState } from 'react'

import type { BlockContentProps } from '../types'

import ImageSelector from './ImageSelector'
import Image from './Image'

function BlockContent(props: BlockContentProps) {
  const { item, maxFileSize, onSubmitFile, onSubmitUrl } = props
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmitFile = useCallback((file: File) => {
    setFile(file)
    onSubmitFile(file)
  }, [onSubmitFile])

  const handleSubmitUrl = useCallback((url: string) => {
    setUrl(url)
    onSubmitUrl(url)
  }, [onSubmitUrl])

  if (file || url) {
    return (
      <Image src={url || URL.createObjectURL(file!)} />
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
    <div className="flex">
      {/* <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-[3px] bg-current flex-shrink-0"
      />
      <div
        onClick={onBlockSelection}
        onMouseDown={onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div> */}
      Image
    </div>
  )
}

export default BlockContent
