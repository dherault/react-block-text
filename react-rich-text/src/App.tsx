import { useState } from 'react'

import { ReactRichTextData } from './types'

import ReactRichText from './ReactRichText'

function App() {
  const [data, setData] = useState<ReactRichTextData>([])

  return (
    <div className="p-8 w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <div className="p-2 bg-white w-full rounded">
        <ReactRichText
          value={data}
          onChange={setData}
        />
      </div>
      <div className="mt-8 p-2 bg-white w-full rounded">
        <ReactRichText
          readOnly
          value={data}
          onChange={setData}
        />
      </div>
      <div className="mt-8 p-2 bg-white w-full rounded">
        {JSON.stringify(data, null, 2)}
      </div>
    </div>
  )
}

export default App
