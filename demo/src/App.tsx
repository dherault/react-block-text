import { ReactNode, useCallback, useState } from 'react'
import GitHubButton from 'react-github-btn'

import ReactBlockText, { headerPlugin, imagePlugin, listPlugin, quotePlugin, todoPlugin } from 'react-block-text'

import onSubmitImageFile from './helpers/onSubmitImageFile'
import onSubmitImageUrl from './helpers/onSubmitImageUrl'
import getImageUrl from './helpers/getImageUrl'

const LOCAL_STORAGE_KEY = 'react-block-text-data'

const plugins = [
  ...headerPlugin(),
  ...todoPlugin(),
  ...listPlugin(),
  ...quotePlugin(),
  ...imagePlugin({
    onSubmitFile: onSubmitImageFile,
    onSubmitUrl: onSubmitImageUrl,
    getUrl: getImageUrl,
    maxFileSize: '5 MB',
  }),
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
      <div className="w-[256px] flex-shrink-0 flex flex-col">
        <h1 className="py-3 px-4 font-semibold text-xl">
          React Block Text
        </h1>
        <div className="px-4 mb-2">
          <GitHubButton
            href="https://github.com/dherault/react-block-text"
            data-icon="octicon-star"
            data-show-count="true"
            aria-label="Star dherault/react-block-text on GitHub"
            data-size="large"
          >
            Star
          </GitHubButton>
        </div>
        <div
          onClick={() => setData('')}
          className="py-1 px-4 text-gray-600 hover:bg-gray-100 cursor-pointer flex items-center gap-2 select-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>

          Clear
        </div>
        <div
          onClick={handleSave}
          className="py-1 px-4 text-gray-600 hover:bg-gray-100 cursor-pointer flex items-center gap-2 select-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>

          Save to local storage
        </div>
        <div
          onClick={() => setPrimaryColor(x => x ? null : 'red')}
          className="py-1 px-4 text-gray-600 hover:bg-gray-100 cursor-pointer flex items-center gap-2 select-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
            />
          </svg>
          Set primary color
          {' '}
          {primaryColor ? 'blue' : 'red'}
        </div>
        <div
          onClick={() => setIsContained(x => !x)}
          className="py-1 px-4 text-gray-600 hover:bg-gray-100 cursor-pointer flex items-center gap-2 select-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6"
            />
          </svg>

          Toggle container
        </div>
        <div className="flex-grow" />
        <div className="px-4 mb-2 text-gray-600 text-sm">
          <a
            href="https://github.com/dherault/react-block-text"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Documentation
          </a>
          {' '}
          - MIT License
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
            paddingLeft={128}
            paddingRight={128}
            primaryColor={primaryColor}
            plugins={plugins}
          />
        )}
      </div>
    </div>
  )
}

export default App
