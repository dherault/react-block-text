import type { ImageProps } from '../types'

function Image({ src }: ImageProps) {
  return (
    <img
      alt="react-block-text"
      src={src}
      className="w-full cursor-pointer"
    />
  )
}

export default Image
