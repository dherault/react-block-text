// https://stackoverflow.com/questions/35939886/find-first-scrollable-parent
function findScrollParent(element: HTMLElement, includeHidden = true) {
  let style = getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  const overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/

  if (style.position === 'fixed') return document.body

  // eslint-disable-next-line no-cond-assign
  for (let parent = element; parent = parent.parentElement as HTMLElement;) {
    style = getComputedStyle(parent)

    if (excludeStaticParent && style.position === 'static') continue
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) return parent
  }

  return document.body
}

export default findScrollParent
