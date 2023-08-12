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
        className="rbt-relative rbt-cursor-pointer rbt-flex rbt-items-center rbt-justify-center"
      >
        <div
          className="rbt-w-[14px] rbt-h-[14px] rbt-border rbt-border-current rbt-transition-all rbt-duration-300"
          style={{
            borderColor: checked ? primaryColor : undefined,
          }}
        />
        <div
          className={_('rbt-w-[14px] rbt-h-[14px] rbt-absolute rbt-inset-0 rbt-text-white rbt-flex rbt-items-center rbt-justify-center rbt-transition-opacity rbt-duration-300', {
            'rbt-opacity-0': !checked,
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
