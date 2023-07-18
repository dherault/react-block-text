function getIsFirstOrLastLine(injectionElement: HTMLElement, editorElement: HTMLElement | null | undefined, focusOffset: number) {
  if (!(injectionElement && editorElement)) {
    return {
      isFirstLine: false,
      isLastLine: false,
    }
  }

  const lineHeight = getLineHeight(injectionElement, editorElement)
  const editorClone = editorElement.cloneNode(true) as HTMLElement

  injectionElement.appendChild(editorClone)

  let charCount = 0
  let lineNumber = 0
  let lineY = lineHeight
  const nLines = editorClone.offsetHeight / lineHeight
  const text = editorClone.textContent ?? ''

  editorClone.textContent = ''

  const wordArray = text.split(' ')

  for (let i = 0; i < wordArray.length; i++) {
    const nextWord = `${wordArray[i]} `

    charCount += nextWord.length

    // Add text character by character
    editorClone.textContent += nextWord

    const currentY = editorClone.offsetHeight

    // currentY > lineY means new line
    if (currentY > lineY || i === wordArray.length - 1) {
      lineY = currentY
      lineNumber++
    }

    // editorClone.textContent += 'A '

    // currentY = editorClone.offsetHeight

    // // currentY > lineY means new line
    // if (currentY > lineY || i === wordArray.length - 1) {
    //   lineY = currentY
    //   lineNumber++
    // }

    // editorClone.textContent = editorClone.textContent.slice(0, -1)

    if (charCount >= focusOffset) break
  }

  // injectionElement.removeChild(editorClone)

  console.log('lineNumber, nLines', lineNumber, nLines)

  return {
    isFirstLine: lineNumber === 0,
    isLastLine: lineNumber >= nLines - 1,
  }
}

// https://stackoverflow.com/questions/4392868/javascript-find-divs-line-height-not-css-property-but-actual-line-height
function getLineHeight(injectionElement: HTMLElement, element: HTMLElement) {
  const elementClone = element.cloneNode(true)

  injectionElement.appendChild(elementClone)

  const temp = document.createElement(elementClone.nodeName)
  temp.setAttribute(
    'style', 'margin:0; padding:0; '
      + `font-family:${element.style.fontFamily || 'inherit'}; `
      + `font-size:${element.style.fontSize || 'inherit'}`
  )

  temp.innerHTML = 'A'

  injectionElement.appendChild(temp)

  const lineHeight = temp.clientHeight

  injectionElement.removeChild(temp)
  injectionElement.removeChild(elementClone)

  return lineHeight
}

export default getIsFirstOrLastLine
