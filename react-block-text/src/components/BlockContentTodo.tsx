import _ from 'clsx'

import { BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'
import Checkbox from './Checkbox'

function BlockContentTodo(props: BlockContentProps) {
  const { metadata, onCheck } = props

  const checked = metadata === 'true'

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        checked={checked}
        onCheck={onCheck}
        style={{ marginTop: 6 }}
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentTodo
