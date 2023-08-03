import type { ImageProps } from '../types'

function Image({ src, width }: ImageProps) {
  return (
    <div className="w-full flex justify-center">
      <div
        className="relative cursor-pointer"
        style={{ width: `${width * 100}%` }}
      >
        <img
          alt="react-block-text"
          src={src}
          className="w-full"
        />
        <div className="absolute inset-0">
          <div className="absolute left-0 h-full flex items-center justify-center">
            <div className="bg-zinc-700 w-[6px] h-[48px] rounded" />
          </div>
          <div className="absolute right-0 h-full flex items-center justify-center">
            <div className="bg-zinc-700 w-[6px] h-[48px] rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Image
