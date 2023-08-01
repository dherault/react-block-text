import ImageIcon from './ImageIcon'

function ImageSelector() {
  return (
    <div
      className="p-[12px] flex items-center gap-3 rounded select-none cursor-pointer bg-[#f2f1ee] hover:bg-[#eae9e6]"
      style={{ color: 'rgba(55, 53, 47, 0.55)' }}
    >
      <ImageIcon width={25} />
      <div className="text-sm">
        Add an image
      </div>
    </div>
  )
}

export default ImageSelector
