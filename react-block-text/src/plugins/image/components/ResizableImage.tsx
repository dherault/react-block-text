import { useEffect, useState } from 'react'

import type { ResizableImageProps } from '../types'

function ResizableImage({ src, width, ratio, progress, setWidth, setRatio }: ResizableImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  console.log(false && setWidth)

  useEffect(() => {
    if (!src || image) return

    const img = new Image()

    img.src = src

    img.addEventListener('load', () => {
      setImage(img)
      setRatio(img.width / img.height)
    })
  }, [src, image, setRatio])

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
      {progress < 1 && (
        <div className="absolute bottom-2 right-[10px]">
          <div className="py-1 px-1.5 flex items-center gap-1 bg-zinc-600 rounded">
            <div
              role="status"
              className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-zinc-400 motion-reduce:animate-[spin_1.5s_linear_infinite]"
            />
            <div className="text-white text-xs">
              {Math.round(progress * 100)}
              %
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResizableImage
