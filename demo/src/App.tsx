import { ReactNode, useCallback, useState } from 'react'

import ReactBlockText, { headerPlugin, listPlugin, quotePlugin, todoPlugin } from 'react-block-text'

const LOCAL_STORAGE_KEY = 'react-block-text-data'

const plugins = [
  ...headerPlugin(),
  ...todoPlugin(),
  ...listPlugin(),
  ...quotePlugin(),
]

function App() {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY) ?? ''

  const [data, setData] = useState(savedData)
  const [primaryColor, setPrimaryColor] = useState<string | null>(null)
  const [isContained, setIsContained] = useState(false)

  const handleSave = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, data)
  }, [data])

  const renderContainer = useCallback((children: ReactNode) => {
    if (!isContained) return children

    return (
      <div
        className="mx-auto mt-32 border shadow-xl overflow-auto rounded bg-white"
        style={{
          maxWidth: 640,
          maxHeight: 256 + 64 + 16 + 4,
        }}
      >
        {/* for testing purposes  */}
        <div className="h-3" />
        <div className="pt-3">
          {children}
        </div>
      </div>
    )
  }, [isContained])

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: '#fbfbfa' }}
    >
      <div className="w-[192px] flex-shrink-0">
        <h1 className="py-1 px-2 font-semibold">
          React Block Text
        </h1>
        <div
          onClick={() => setData('')}
          className="py-1 px-2 hover:bg-gray-100 cursor-pointer"
        >
          Clear
        </div>
        <div
          onClick={handleSave}
          className="py-1 px-2 hover:bg-gray-100 cursor-pointer"
        >
          Save
        </div>
        <div
          onClick={() => setPrimaryColor(x => x ? null : 'red')}
          className="py-1 px-2 hover:bg-gray-100 cursor-pointer"
        >
          {primaryColor ? 'Reset primary color' : 'Set primary color red'}
        </div>
        <div
          onClick={() => setIsContained(x => !x)}
          className="py-1 px-2 hover:bg-gray-100 cursor-pointer"
        >
          Toggle container
        </div>
      </div>
      <div className="bg-white border-l max-h-full overflow-y-auto flex-grow">
        {renderContainer(
          <ReactBlockText
            value={data}
            onChange={setData}
            onSave={handleSave}
            paddingTop={64}
            paddingBottom={64}
            paddingLeft={128 - 44}
            paddingRight={128}
            primaryColor={primaryColor}
            plugins={plugins}
          />
        )}
      </div>
      {/* <div className="mt-8 bg-white w-full rounded">
        <ReactBlockText
          readOnly
          value={data}
          plugins={[
            ...headerPlugin(),
            ...todoPlugin(),
            ...listPlugin(),
            ...quotePlugin(),
          ]}
        />
      </div> */}
      {/* <div className="mt-8 p-2 bg-white w-full rounded">
        {JSON.stringify(data, null, 2)}
      </div> */}
    </div>
  )
}

export default App
