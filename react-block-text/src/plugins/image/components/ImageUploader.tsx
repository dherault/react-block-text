import { type FormEvent, useCallback, useContext, useState } from 'react'

import { ColorsContext } from '../../..'

import type { ImageUploaderProps, Mode } from '../types'

function ImageUploader({ maxFileSize }: ImageUploaderProps) {
  const { primaryColor, primaryColorDark, primaryColorTransparent } = useContext(ColorsContext)
  const [mode, setMode] = useState<Mode>('upload')
  const [url, setUrl] = useState('')

  const handleUrlSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    console.log('url', url)
  }, [url])

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
      <button
        type="button"
        className="p-1.5 w-full border rounded text-sm hover:bg-gray-100"
      >
        Upload file
      </button>
      {!!maxFileSize && (
        <div className="mt-3 text-xs text-zinc-500 text-center">
          The maximum size per file is
          {' '}
          {maxFileSize}
          .
        </div>
      )}
    </>
  ), [maxFileSize])

  const renderUrl = useCallback(() => (
    <form onSubmit={handleUrlSubmit}>
      <input
        type="url"
        value={url}
        onChange={event => setUrl(event.target.value)}
        placeholder="Paste the image link..."
        style={{ '--shadow-color': primaryColorTransparent } as any}
        className="w-full h-[28px] bg-zinc-50 border rounded text-sm p-1.5 outline-none focus:ring focus:ring-[var(--shadow-color)]"
      />
      <div className="mt-3 text-center">
        <button
          type="submit"
          style={{
            '--bg-color': primaryColor,
            '--bg-color-dark': primaryColorDark,
          } as any}
          className="p-1.5 w-[300px] bg-[var(--bg-color)] hover:bg-[var(--bg-color-dark)] border border-[var(--bg-color-dark)] rounded text-sm font-bold text-white"
        >
          Embed image
        </button>
      </div>
      <div className="mt-3 text-xs text-zinc-500 text-center">
        Works with any image from the web
      </div>
    </form>
  ), [primaryColor, primaryColorTransparent, primaryColorDark, url, handleUrlSubmit])

  return (
    <div className="w-full bg-white border shadow-lg rounded">
      <div className="pt-1 px-2 flex border-b">
        {renderTabItem('Upload', 'upload')}
        {renderTabItem('Embed link', 'url')}
      </div>
      <div className="py-3 pb-2">
        {mode === 'upload' && renderUpload()}
        {mode === 'url' && renderUrl()}
      </div>
    </div>
  )
}

export default ImageUploader
