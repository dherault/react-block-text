import { useCallback, useState } from 'react'

import { ReactBlockTextData } from './types'

import ReactBlockText from './components/ReactBlockText'

const LOCAL_STORAGE_KEY = 'react-block-text-data'

function App() {
  const savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]') as ReactBlockTextData

  const [data, setData] = useState<ReactBlockTextData>(savedData)

  const handleSave = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }, [data])

  return (
    <div className="p-8 w-full min-h-screen flex flex-col bg-gray-100">
      <div className="mt-32">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setData([])}
            className="p-1 bg-white border hover:bg-gray-50 rounded cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="p-1 bg-white border hover:bg-gray-50 rounded cursor-pointer"
          >
            Save
          </button>
        </div>
        <div className="mt-4 px-2 bg-white w-full rounded">
          <ReactBlockText
            value={data}
            onChange={setData}
            onSave={handleSave}
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
    </div>
  )
}

export default App
