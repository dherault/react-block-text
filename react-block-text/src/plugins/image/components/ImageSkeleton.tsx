import type { ImageSkeletonProps } from '../types'

function ImageSkeleton({ width, height }: ImageSkeletonProps) {
  return (
    <div className="w-full flex justify-center">
      <div
        className="bg-gray-300 dark:bg-gray-700 rounded animate-pulse cursor-wait"
        style={{ width: `${width * 100}%`, height }}
      />
    </div>
  )
}

export default ImageSkeleton
