import { useContext } from 'react'

import type { SelectionRectData } from '../types'

import PrimaryColorContext from '../context/PrimaryColorContext'

function SelectionRect(props: SelectionRectData) {
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
