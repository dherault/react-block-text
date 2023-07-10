import type { HTMLAttributes } from 'react'

import type { BlockContentProps as ReactBlockTextBlockContentProps, ReactBlockTextOnChange } from '../../types'

export type PluginOptions = {
  color: string | null | undefined
}

export type CheckboxProps = HTMLAttributes<HTMLDivElement> & {
  color: string
  checked: boolean
  onCheck: (checked: boolean) => void
}

export type IconProps = {
  color: string
}

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  onItemChange: ReactBlockTextOnChange
  color: string
}
