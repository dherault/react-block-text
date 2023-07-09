import { useCallback, useContext } from 'react'
import _ from 'clsx'

import { CheckboxProps } from '../types'
import CheckIcon from '../icons/Check'
import PrimaryColorContext from '../context/PrimaryColorContext'

function Checkbox({ checked, onCheck, ...props }: CheckboxProps) {
  const primaryColor = useContext(PrimaryColorContext)

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
            borderColor: checked ? primaryColor : undefined,
          }}
        />
        <div
          className={_('w-[14px] h-[14px] absolute inset-0 text-white flex items-center justify-center transition-opacity', {
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
