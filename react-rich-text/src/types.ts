// import { BlockMap } from 'draft-js'

export type ReactRichTextData = ReactRichTextDataItem[]

export type ReactRichTextDataItem = {
  id: string
  data: string
}

// export type BlockProps = {
//   value: ReactRichTextDataItem
//   forceFocus: boolean
//   cancelForceFocus: () => void
//   onChange: (data: ReactRichTextDataItem) => void
//   onCreateBlock: () => void
//   onMergeWithPrevious: () => boolean
//   registerMergeFunction: (mergeFunction: MergeFunction) => void
// }

// export type MergeFunction = (blockMap: BlockMap) => boolean
