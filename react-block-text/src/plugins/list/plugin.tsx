import type { ReactBlockTextPlugins } from '../../types'

import BlockContent from './components/BlockContent'
import BulletedListIcon from './components/BulletedListIcon'
import NumberedListIcon from './components/NumberedListIcon'

const TYPES = ['bulleted-list', 'numbered-list']
const TITLES = ['Bulleted list', 'Numbered list']
const LABELS = ['Create a simple bulleted list.', 'Create a list with numbering.']
const ICONS = [<BulletedListIcon />, <NumberedListIcon />]

function listPlugin(): ReactBlockTextPlugins {
  return TYPES.map((type, i) => () => ({
    type,
    title: TITLES[i],
    label: LABELS[i],
    icon: ICONS[i],
    isConvertibleToText: true,
    shortcuts: 'task',
    paddingTop: 3,
    paddingBottom: 3,
    iconsPaddingTop: 0,
    BlockContent,
  }))
}

export default listPlugin
