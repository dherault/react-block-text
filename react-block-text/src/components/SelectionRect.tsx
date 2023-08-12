import { useContext } from 'react'

import type { SelectionRectProps } from '../types'

import ColorsContext from '../contexts/ColorsContext'

function SelectionRect(props: SelectionRectProps) {
  const { primaryColorTransparent } = useContext(ColorsContext)

  return (
    <div
      className="rbt-absolute"
      style={{
        backgroundColor: primaryColorTransparent,
        ...props,
      }}
    />
  )
}

export default SelectionRect
