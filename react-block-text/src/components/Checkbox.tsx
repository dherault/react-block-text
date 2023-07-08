import { useCallback } from 'react'

import { CheckboxProps } from '../types'
import CheckIcon from '../icons/Check'

function Checkbox({ checked, onCheck, ...props }: CheckboxProps) {
  const handleClick = useCallback(() => {
    onCheck(!checked)
  }, [checked, onCheck])

  const renderUnchecked = useCallback(() => (
    <div
      onClick={handleClick}
      className="w-4 h-4 border border-black cursor-pointer"
    />
  ), [handleClick])

  const renderChecked = useCallback(() => (
    <div
      onClick={handleClick}
      className="w-4 h-4 bg-blue-500 text-white cursor-pointer flex items-center justify-center"
    >
      <CheckIcon width={16} />
    </div>
  ), [handleClick])

  return (
    <div {...props}>
      {checked ? renderChecked() : renderUnchecked()}
    </div>
  )
}

export default Checkbox
