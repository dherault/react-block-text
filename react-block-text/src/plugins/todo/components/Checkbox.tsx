import { useCallback, useContext } from 'react'
import _ from 'clsx'

import type { CheckboxProps } from '../types'

import { ColorsContext } from '../../..'

import CheckIcon from './CheckIcon'

function Checkbox({ checked, onCheck, ...props }: CheckboxProps) {
  const { primaryColor } = useContext(ColorsContext)

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
          className="w-[14px] h-[14px] border border-current transition-all duration-300"
          style={{
            borderColor: checked ? primaryColor : undefined,
          }}
        />
        <div
          className={_('w-[14px] h-[14px] absolute inset-0 text-white flex items-center justify-center transition-opacity duration-300', {
            'opacity-0': !checked,
          })}
          style={{ backgroundColor: primaryColor }}
        >
          <CheckIcon width={16} />
        </div>
      </div>
    </div>
  )
}

export default Checkbox
