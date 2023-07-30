import type { BlockContentProps as ReactBlockTextBlockContentProps } from '../../types'

export type BlockContentProps = ReactBlockTextBlockContentProps & {
  secondaryColor: string | null | undefined
}
