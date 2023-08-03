import { useRef, useState } from 'react'
import { Transition } from 'react-transition-group'

import type { ImageSelectorProps } from '../types'

import ImageIcon from './ImageIcon'
import ImageUploader from './ImageUploader'

const transitionDuration = 100

const defaultStyle = {
  transition: `opacity ${transitionDuration}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
}

function ImageSelector({ maxFileSize, onSubmitFile, onSubmitUrl }: ImageSelectorProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <div
        className="p-[12px] flex items-center gap-3 rounded select-none cursor-pointer bg-[#f2f1ee] hover:bg-[#eae9e6]"
        style={{ color: 'rgba(55, 53, 47, 0.55)' }}
        onClick={() => setOpen(x => !x)}
      >
        <ImageIcon width={25} />
        <div className="text-sm">
          Add an image
        </div>
      </div>
      <div className="absolute top-100 left-0 right-0 flex justify-center">
        <Transition
          mountOnEnter
          unmountOnExit
          in={open}
          nodeRef={dialogRef}
          timeout={transitionDuration}
        >
          {state => (
            <div
              ref={dialogRef}
              className="w-[540px] z-20"
              style={{
                ...defaultStyle,
                ...transitionStyles[state as keyof typeof transitionStyles],
              }}
            >
              <ImageUploader
                maxFileSize={maxFileSize}
                onSubmitFile={onSubmitFile}
                onSubmitUrl={onSubmitUrl}
              />
            </div>
          )}
        </Transition>
      </div>
      {open && (
        <div
          className="fixed inset-0 cursor-default z-10"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default ImageSelector
