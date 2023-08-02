import { useContext } from 'react'

import type { SelectionRectProps } from '../types'

import ColorsContext from '../context/ColorsContext'

function SelectionRect(props: SelectionRectProps) {
  const { primaryColorTransparent } = useContext(ColorsContext)

  return (
    <div
      className="absolute"
      style={{
        backgroundColor: primaryColorTransparent,
        ...props,
      }}
    />
  )
}

export default SelectionRect
