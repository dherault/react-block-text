import { useState } from 'react'

import { ReactRichTextData } from './types'

import ReactRichText from './ReactRichText'

function App() {
  const [data, setData] = useState<ReactRichTextData>([])

  return (
    <div className="p-8 w-full h-full flex flex-col items-center justify-center">
      <ReactRichText
        value={data}
        onChange={setData}
      />
    </div>
  )
}

export default App
