import BlockContentText from './components/BlockContentText'
import BlockContentTodo from './components/BlockContentTodo'
import BlockContentList from './components/BlockContentList'
import BlockContentQuote from './components/BlockContentQuote'

const blockContentComponents = {
  text: BlockContentText,
  heading1: BlockContentText,
  heading2: BlockContentText,
  heading3: BlockContentText,
  todo: BlockContentTodo,
  'bulleted-list': BlockContentList,
  'numbered-list': BlockContentList,
  quote: BlockContentQuote,
}

export default blockContentComponents
