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
    <div className="rbt-relative">
      <div
        className="rbt-p-[12px] rbt-flex rbt-items-center rbt-gap-3 rbt-rounded rbt-select-none rbt-cursor-pointer rbt-bg-[#f2f1ee] hover:rbt-bg-[#eae9e6]"
        style={{ color: 'rgba(55, 53, 47, 0.55)' }}
        onClick={() => setOpen(x => !x)}
      >
        <ImageIcon width={25} />
        <div className="rbt-text-sm">
          Add an image
        </div>
      </div>
      <div className="rbt-absolute rbt-top-100 rbt-left-0 rbt-right-0 rbt-flex rbt-justify-center">
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
              className="rbt-w-[540px] rbt-z-20"
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
          className="rbt-fixed rbt-inset-0 rbt-cursor-default rbt-z-10"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default ImageSelector
