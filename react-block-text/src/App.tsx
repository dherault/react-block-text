import { useCallback, useState } from 'react'

import ReactBlockText from './components/ReactBlockText'

const LOCAL_STORAGE_KEY = 'react-block-text-data'
const PADDINGS = [
  8,
  32,
  128,
]

function App() {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY) ?? ''

  const [data, setData] = useState(savedData)
  const [primaryColor, setPrimaryColor] = useState<string | null>(null)
  const [padding, setPadding] = useState(PADDINGS[0])

  const handleSave = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, data)
  }, [data])

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setData('')}
          className="py-1 px-2 bg-white border hover:bg-gray-50 rounded cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="py-1 px-2 bg-white border hover:bg-gray-50 rounded cursor-pointer"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setPrimaryColor(x => x ? null : 'red')}
          className="py-1 px-2 bg-white border hover:bg-gray-50 rounded cursor-pointer"
        >
          {primaryColor ? 'Reset primary color' : 'Set primary color red'}
        </button>
        <button
          type="button"
          onClick={() => setPadding(x => PADDINGS[(PADDINGS.indexOf(x) + 1) % PADDINGS.length])}
          className="py-1 px-2 bg-white border hover:bg-gray-50 rounded cursor-pointer"
        >
          Change padding left
        </button>
      </div>
      <div className="mt-4 bg-white w-full rounded">
        <ReactBlockText
          value={data}
          onChange={setData}
          onSave={handleSave}
          paddingLeft={padding}
          primaryColor={primaryColor}
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
