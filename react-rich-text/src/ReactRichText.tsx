import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { EditorState, convertToRaw } from 'draft-js'

import { ReactRichTextData, ReactRichTextDataItem } from './types'

import Paragraph from './Paragraph'

type ReactRichTextProps = {
  value: ReactRichTextData
  onChange: (value: ReactRichTextData) => void
}

function ReactRichText({
  value,
  onChange,
}: ReactRichTextProps) {

  const handleChange = useCallback((index: number, item: ReactRichTextDataItem) => {
    const nextValue = [...value]

    nextValue[index] = item

    onChange(nextValue)
  }, [value, onChange])

  const createId = useCallback(() => nanoid(), [])

  const lastBlockData = useMemo(() => ({
    id: createId(),
    type: 'paragraph' as const,
    data: JSON.stringify(convertToRaw(EditorState.createEmpty().getCurrentContent())),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [createId, value?.length])

  if (!Array.isArray(value)) throw new Error('ReactRichText value prop must be an array')

  return (
    <div className="w-full border">
      {(value.length ? value : [...value, lastBlockData]).map((item, i) => (
        <Paragraph
          key={item.id}
          value={item}
          onChange={data => handleChange(i, data)}
        />
      ))}
    </div>
  )
}

export default ReactRichText
