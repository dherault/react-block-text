import type { ReactBlockTextPlugins } from '../../types'

import type { PluginOptions } from './types'

import applyMetadatas from './utils/applyMetadata'

import BlockContent from './components/BlockContent'
import BulletedListIcon from './components/BulletedListIcon'
import NumberedListIcon from './components/NumberedListIcon'

const TYPES = ['bulleted-list', 'numbered-list']
const TITLES = ['Bulleted list', 'Numbered list']
const LABELS = ['Create a simple bulleted list.', 'Create a list with numbering.']
const ICONS = [<BulletedListIcon />, <NumberedListIcon />]

function listPlugin(options?: PluginOptions): ReactBlockTextPlugins {
  const bulleted = options?.bulleted ?? true
  const numbered = options?.numbered ?? true

  const plugins: ReactBlockTextPlugins = []

  if (bulleted) {
    plugins.push(() => ({
      type: TYPES[0],
      title: TITLES[0],
      label: LABELS[0],
      icon: ICONS[0],
      isConvertibleToText: true,
      isNewItemOfSameType: true,
      shortcuts: 'task',
      maxIndent: 5,
      applyMetadatas,
      BlockContent,
    }))
  }

  if (numbered) {
    plugins.push(() => ({
      type: TYPES[1],
      title: TITLES[1],
      label: LABELS[1],
      icon: ICONS[1],
      isConvertibleToText: true,
      isNewItemOfSameType: true,
      shortcuts: 'task',
      maxIndent: 5,
      applyMetadatas,
      BlockContent,
    }))
  }

  return plugins
}

export default listPlugin
