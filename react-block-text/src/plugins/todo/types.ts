import type { HTMLAttributes } from 'react'

import type { BlockContentProps as ReactBlockTextBlockContentProps, ReactBlockTextOnChange } from '../../types'

export type CheckboxProps = HTMLAttributes<HTMLDivElement> & {
  checked: boolean
  onCheck: (checked: boolean) => void
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  onItemChange: ReactBlockTextOnChange
}
