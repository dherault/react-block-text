import { useEffect, useRef, useState } from 'react'
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

function ImageSelector({ maxFileSize }: ImageSelectorProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && !mainRef.current!.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current])

  return (
    <div className="relative">
      <div
        ref={mainRef}
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
          nodeRef={containerRef}
          timeout={transitionDuration}
        >
          {state => (
            <div
              ref={containerRef}
              className="w-[540px] z-50"
              style={{
                ...defaultStyle,
                ...transitionStyles[state as keyof typeof transitionStyles],
              }}
            >
              <ImageUploader maxFileSize={maxFileSize} />
            </div>
          )}
        </Transition>

      </div>
    </div>
  )
}

export default ImageSelector
