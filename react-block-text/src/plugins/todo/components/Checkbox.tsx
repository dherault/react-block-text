import { useCallback } from 'react'
import _ from 'clsx'

import type { CheckboxProps } from '../types'

import CheckIcon from './CheckIcon'

function Checkbox({ color, checked, onCheck, ...props }: CheckboxProps) {
  const handleClick = useCallback(() => {
    onCheck(!checked)
  }, [checked, onCheck])

  return (
    <div {...props}>
      <div
        onClick={handleClick}
        className="relative cursor-pointer flex items-center justify-center"
      >
        <div
          className="w-[14px] h-[14px] border border-black transition-all"
          style={{
            borderColor: checked ? color : undefined,
          }}
        />
        <div
          className={_('w-[14px] h-[14px] absolute inset-0 text-white flex items-center justify-center transition-opacity', {
            'opacity-0': !checked,
          })}
          style={{ backgroundColor: color }}
        >
          <CheckIcon width={16} />
        </div>
      </div>
    </div>
  )
}

export default Checkbox
