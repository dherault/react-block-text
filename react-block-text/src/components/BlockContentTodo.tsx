import { BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'
import Checkbox from './Checkbox'

function BlockContentTodo(props: BlockContentProps) {
  const { metadata, onCheck } = props

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        checked={metadata === 'true'}
        onCheck={onCheck}
        style={{ marginTop: 3 }}
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentTodo
