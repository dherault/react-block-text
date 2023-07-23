import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import Icon from './components/Icon'

const TYPES = ['heading1', 'heading2', 'heading3']
const TITLES = ['Heading 1', 'Heading 2', 'Heading 3']
const LABELS = ['Big section heading.', 'Medium section heading.', 'Small section heading.']
const PADDING_TOPS = [24, 18, 12]
const PADDING_BOTTOMS = [9, 9, 9]
const ICONS_PADDING_TOPS = [7, 5, 2]

function headerPlugin(): ReactBlockTextPlugins {
  return TYPES.map((type, i) => () => ({
    type,
    title: TITLES[i],
    label: LABELS[i],
    icon: (
      <Icon>
        H
        {i + 1}
      </Icon>
    ),
    isConvertibleToText: true,
    shortcuts: `h${i + 1}`,
    paddingTop: PADDING_TOPS[i],
    paddingBottom: PADDING_BOTTOMS[i],
    iconsPaddingTop: ICONS_PADDING_TOPS[i],
    BlockContent,
  }))
}

export default headerPlugin
