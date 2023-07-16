function countFirstLineCharacters(element: HTMLElement) {
  const text = element.textContent ?? ''
  // split to character array
  const textArr = text.split('')
  // append temporary span element
  const line = document.createElement('span')

  element.insertBefore(line, element.firstChild)
  let charCount = 0
  let lineNo = 1
  let lineY = line.offsetHeight

  for (let i = 0; i < textArr.length; i++) {
    const char = textArr[i]
    // add text character by character
    line.textContent += char
    charCount++
    const currentY = line.offsetHeight
    // currentY > lineY = new line
    if (currentY > lineY || i === textArr.length - 1) {
      const charPerLine = charCount - 1
      console.log(`element line ${lineNo}: ${charPerLine} characters`)
      lineY = currentY
      charCount = 0
      lineNo++
    }
  }
  // remove span
  line.remove()
}

export default countFirstLineCharacters
