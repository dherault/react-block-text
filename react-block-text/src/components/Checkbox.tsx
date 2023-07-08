import { useCallback } from 'react'
import _ from 'clsx'

import { CheckboxProps } from '../types'
import CheckIcon from '../icons/Check'

function Checkbox({ checked, onCheck, ...props }: CheckboxProps) {
  const handleClick = useCallback(() => {
    onCheck(!checked)
  }, [checked, onCheck])

  return (
    <div {...props}>
      <div
        onClick={handleClick}
        className="relative"
      >
        <div
          className={_('w-[14px] h-[14px] border border-black cursor-pointer transition-all', {
            '!border-blue-500': checked,
          })}
        />
        <div
          className={_('w-[14px] h-[14px] absolute inset-0 bg-blue-500 text-white cursor-pointer flex items-center justify-center transition-opacity', {
            'opacity-0': !checked,
          })}
        >
          <CheckIcon width={16} />
        </div>
      </div>
    </div>
  )
}

export default Checkbox
