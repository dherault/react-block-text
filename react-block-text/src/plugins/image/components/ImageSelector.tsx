import type { ImageSelectorProps } from '../types'

import ImageIcon from './ImageIcon'

function ImageSelector({ secondaryColor }: ImageSelectorProps) {
  return (
    <div
      className="p-[12px] flex items-center gap-3 rounded-sm select-none cursor-pointer"
      style={{ backgroundColor: secondaryColor, color: 'rgba(55, 53, 47, 0.45)' }}
    >
      <ImageIcon width={25} />
      <div className="text-sm">
        Add an image
      </div>
    </div>
  )
}

export default ImageSelector
