import { useContext } from 'react'

import type { SelectionRectProps } from '../types'

import PrimaryColorContext from '../context/PrimaryColorContext'

function SelectionRect(props: SelectionRectProps) {
  const primaryColor = useContext(PrimaryColorContext)

  return (
    <div
      className="absolute opacity-25"
      style={{
        backgroundColor: primaryColor,
        ...props,
      }}
    />
  )
}

export default SelectionRect
