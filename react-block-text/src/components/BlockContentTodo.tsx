import type { BlockContentProps } from '../types'

import BlockContentText from './BlockContentText'
import Checkbox from './Checkbox'

function BlockContentTodo(props: BlockContentProps) {
  const { metadata, onCheck } = props

  return (
    <div className="h-full flex">
      <div className="flex items-start">
        <Checkbox
          checked={metadata === 'true'}
          onCheck={onCheck}
          className="flex-shrink-0"
          style={{ marginTop: 6 }}
        />
      </div>
      <div
        onClick={props.focusContentAtStart}
        onMouseDown={props.onRectSelectionMouseDown}
        className="w-2 flex-shrink-0"
      />
      <div className="flex-grow">
        <BlockContentText {...props} />
      </div>
    </div>
  )
}

export default BlockContentTodo
