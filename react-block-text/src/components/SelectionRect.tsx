import { useContext } from 'react'

import type { SelectionRectProps } from '../types'

import PrimaryColorContext from '../context/PrimaryColorContext'

function SelectionRect(props: SelectionRectProps) {
  const primaryColor = useContext(PrimaryColorContext)

  return (
    <div
      className="absolute"
      style={{
        backgroundColor: primaryColor,
        opacity: 0.15,
        ...props,
      }}
    />
  )
}

export default SelectionRect
