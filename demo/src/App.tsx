import { ReactNode, useCallback, useState } from 'react'

import ReactBlockText, { headerPlugin, listPlugin, quotePlugin, todoPlugin } from 'react-block-text'

const LOCAL_STORAGE_KEY = 'react-block-text-data'
const PADDINGS = [8, 32, 128]

function App() {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY) ?? ''

  const [data, setData] = useState(savedData)
  const [primaryColor, setPrimaryColor] = useState<string | null>(null)
  const [padding, setPadding] = useState(PADDINGS[1])
  const [isContained, setIsContained] = useState(false)

  const handleSave = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, data)
  }, [data])

  const renderContainer = useCallback((children: ReactNode) => {
    if (!isContained) return children

    return (
      <div
        className="mx-auto border shadow-xl overflow-auto rounded"
        style={{
          maxWidth: 640,
          maxHeight: 256 + 64 + 16 + 4,
        }}
      >
        <div className="h-3 bg-blue-100" />
        <div className="pt-3">
          {children}
        </div>
      </div>
    )
  }, [isContained])

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <div className="flex gap-2 mt-64">
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
        <button
          type="button"
          onClick={() => setIsContained(x => !x)}
          className="py-1 px-2 bg-white border hover:bg-gray-50 rounded cursor-pointer"
        >
          Toggle container
        </button>
      </div>
      <div className="mt-4">
        {renderContainer(
          <div className="bg-white rounded">
            <ReactBlockText
              value={data}
              onChange={setData}
              onSave={handleSave}
              paddingTop={32}
              paddingBottom={32}
              paddingLeft={padding}
              primaryColor={primaryColor}
              plugins={[
                ...headerPlugin(),
                ...todoPlugin({ color: primaryColor }),
                ...listPlugin(),
                ...quotePlugin(),
              ]}
            />
          </div>
        )}
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
