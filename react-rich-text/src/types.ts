export type ReactRichTextData = ReactRichTextDataItem[]

export type ReactRichTextDataItem = {
  id: string
  type: 'paragraph'
  data: string
}

export type BlockProps = {
  value: ReactRichTextDataItem
  onChange: (data: ReactRichTextDataItem) => void
}
