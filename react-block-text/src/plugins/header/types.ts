import type { CSSProperties, ReactNode } from 'react'

import { BlockContentProps as ReactBlockTextBlockContentProps } from '../../types'

export type PluginOptions = {
  classNames?: Partial<Record<'h1' | 'h2' | 'h3', string>>
  styles?: Partial<Record<'h1' | 'h2' | 'h3', CSSProperties>>
}

export type BlockContentProps = ReactBlockTextBlockContentProps & PluginOptions

export type IconProps = {
  children: ReactNode
}
