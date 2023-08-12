import { useEffect, useState } from 'react'

import type { ResizableImageProps } from '../types'

function ResizableImage({ src, width, ratio, progress, setWidth, setRatio }: ResizableImageProps) {
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
    <div className="rbt-w-full rbt-flex rbt-justify-center">
      <div
        className="rbt-relative rbt-select-none rbt-cursor-pointer"
        style={{ width: `${width * 100}%`, aspectRatio: `${ratio} / 1` }}
      >
        <div className="rbt-w-full rbt-h-full rbt-bg-gray-300 dark:rbt-bg-gray-700 rbt-rounded rbt-animate-pulse rbt-cursor-wait" />
        {!!image && (
          <img
            alt="Something went wrong..."
            src={image.src}
            className="rbt-absolute rbt-inset-0"
          />
        )}
        <div className="rbt-absolute rbt-inset-0">
          <div className="rbt-absolute rbt-left-0 rbt-w-4 rbt-h-full rbt-flex rbt-items-center rbt-justify-center rbt-cursor-col-resize">
            <div className="rbt-bg-zinc-600 rbt-w-1 rbt-h-[48px] rbt-rounded" />
          </div>
          <div className="rbt-absolute rbt-right-0 rbt-w-4 rbt-h-full rbt-flex rbt-items-center rbt-justify-center rbt-cursor-col-resize">
            <div className="rbt-bg-zinc-600 rbt-w-1 rbt-h-[48px] rbt-rounded" />
          </div>
        </div>
      </div>
      {progress < 1 && (
        <div className="rbt-absolute rbt-bottom-2 rbt-right-[10px]">
          <div className="rbt-py-1 rbt-px-1.5 rbt-flex rbt-items-center rbt-gap-1 rbt-bg-zinc-600 rbt-rounded">
            <div
              role="status"
              className="rbt-inline-block rbt-h-3 rbt-w-3 rbt-animate-spin rbt-rounded-full rbt-border-2 rbt-border-solid rbt-border-current rbt-border-r-transparent rbt-align-[-0.125em] rbt-text-zinc-400 motion-reduce:rbt-animate-[spin_1.5s_linear_infinite]"
            />
            <div className="rbt-text-white rbt-text-xs">
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
