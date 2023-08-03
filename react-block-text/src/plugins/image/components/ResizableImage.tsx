import { useEffect, useState } from 'react'

import type { ResizableImageProps } from '../types'

function ResizableImage({ src, width, ratio, setWidth, setRatio }: ResizableImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  console.log(false && setWidth)

  useEffect(() => {
    if (!src) return

    const img = new Image()

    img.src = src

    img.addEventListener('load', () => {
      setImage(img)
      setRatio(img.width / img.height)
    })
  }, [src, setRatio])

  return (
    <div className="w-full flex justify-center">
      <div
        className="relative select-none cursor-pointer"
        style={{ width: `${width * 100}%`, aspectRatio: `${ratio} / 1` }}
      >
        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse cursor-wait" />
        {!!image && (
          <img
            alt="Something went wrong..."
            src={image.src}
            className="absolute inset-0"
          />
        )}
        <div className="absolute inset-0">
          <div className="absolute left-0 w-4 h-full flex items-center justify-center cursor-col-resize">
            <div className="bg-zinc-600 w-1 h-[48px] rounded" />
          </div>
          <div className="absolute right-0 w-4 h-full flex items-center justify-center cursor-col-resize">
            <div className="bg-zinc-600 w-1 h-[48px] rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResizableImage
