import { useState } from 'react'

import { ReactBlockTextData } from './types'

import ReactBlockText from './components/ReactBlockText'

function App() {
  const [data, setData] = useState<ReactBlockTextData>([])

  return (
    <div className="p-8 w-full h-full flex flex-col items-center bg-gray-100">
      <div className="mt-64 px-2 bg-white w-full rounded">
        <ReactBlockText
          value={data}
          onChange={setData}
          // onSave={() => console.log('save')}
        />
      </div>
      {/* <div className="mt-8 px-2 bg-white w-full rounded">
        <ReactBlockText
          readOnly
          value={data}
          onChange={setData}
        />
      </div> */}
      {/* <div className="mt-8 p-2 bg-white w-full rounded">
        {JSON.stringify(data, null, 2)}
      </div> */}
    </div>
  )
}

export default App
