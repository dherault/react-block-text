import { useCallback, useState } from 'react'

type Mode = 'upload' | 'url'

function ImageUploader() {
  const [mode, setMode] = useState<Mode>('upload')

  const renderTabItem = useCallback((label: string, itemMode: Mode) => (
    <div
      className="flex flex-col cursor-pointer text-sm"
      onClick={() => setMode(itemMode)}
    >
      <div className="py-1 px-2 hover:bg-gray-100 rounded">
        {label}
      </div>
      {mode === itemMode && (
        <div className="mt-0.5 mx-2 h-[2px] bg-current" />
      )}
    </div>
  ), [mode])

  const renderUpload = useCallback(() => (
    <>
      Upload
    </>
  ), [])

  const renderUrl = useCallback(() => (
    <>
      URL
    </>
  ), [])

  return (
    <div className="w-full bg-white border shadow-lg rounded">
      <div className="pt-1 px-2 flex border-b">
        {renderTabItem('Upload', 'upload')}
        {renderTabItem('Embed link', 'url')}
      </div>
      {mode === 'upload' && renderUpload()}
      {mode === 'url' && renderUrl()}
    </div>
  )
}

export default ImageUploader
