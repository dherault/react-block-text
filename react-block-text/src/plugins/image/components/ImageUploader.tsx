import { type ChangeEvent, type FormEvent, useCallback, useContext, useRef, useState } from 'react'

import { ColorsContext } from '../../..'

import type { ImageUploaderProps, Mode } from '../types'

function ImageUploader({ maxFileSize, onSubmitFile, onSubmitUrl }: ImageUploaderProps) {
  const { primaryColor, primaryColorDark, primaryColorTransparent } = useContext(ColorsContext)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>('upload')
  const [url, setUrl] = useState('')

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUploadChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    onSubmitFile(file)
  }, [onSubmitFile])

  const handleUrlSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!url) return

    onSubmitUrl(url)
  }, [url, onSubmitUrl])

  const renderTabItem = useCallback((label: string, itemMode: Mode) => (
    <div
      className="rbt-flex rbt-flex-col rbt-cursor-pointer rbt-text-sm"
      onClick={() => setMode(itemMode)}
    >
      <div className="rbt-py-1 rbt-px-2 hover:rbt-bg-gray-100 rbt-rounded">
        {label}
      </div>
      {mode === itemMode && (
        <div className="rbt-mt-0.5 rbt-mx-2 rbt-h-[2px] rbt-bg-current" />
      )}
    </div>
  ), [mode])

  const renderUpload = useCallback(() => (
    <>
      <button
        type="button"
        onClick={handleUploadClick}
        className="rbt-p-1.5 rbt-w-full rbt-border rbt-rounded rbt-text-sm hover:rbt-bg-gray-100"
      >
        Upload file
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUploadChange}
        className="rbt-hidden"
      />
      {!!maxFileSize && (
        <div className="rbt-mt-3 rbt-text-xs rbt-text-zinc-500 rbt-text-center">
          The maximum size per file is
          {' '}
          {maxFileSize}
          .
        </div>
      )}
    </>
  ), [maxFileSize, handleUploadClick, handleUploadChange])

  const renderUrl = useCallback(() => (
    <form onSubmit={handleUrlSubmit}>
      <input
        type="url"
        value={url}
        onChange={event => setUrl(event.target.value)}
        placeholder="Paste the image link..."
        style={{ '--shadow-color': primaryColorTransparent } as any}
        className="rbt-w-full rbt-h-[28px] rbt-bg-zinc-50 rbt-border rbt-rounded rbt-text-sm rbt-p-1.5 rbt-outline-none focus:rbt-ring focus:rbt-ring-[var(--shadow-color)]"
      />
      <div className="rbt-mt-3 rbt-text-center">
        <button
          type="submit"
          style={{
            '--bg-color': primaryColor,
            '--bg-color-dark': primaryColorDark,
          } as any}
          className="rbt-p-1.5 rbt-w-[300px] rbt-bg-[var(--bg-color)] hover:rbt-bg-[var(--bg-color-dark)] rbt-border rbt-border-[var(--bg-color-dark)] rbt-rounded rbt-text-sm rbt-font-semibold rbt-text-white"
        >
          Embed image
        </button>
      </div>
      <div className="rbt-mt-3 rbt-text-xs rbt-text-zinc-500 rbt-text-center">
        Works with any image from the web
      </div>
    </form>
  ), [primaryColor, primaryColorTransparent, primaryColorDark, url, handleUrlSubmit])

  return (
    <div className="rbt-w-full rbt-bg-white rbt-border rbt-shadow-lg rbt-rounded">
      <div className="rbt-pt-1 rbt-px-2 rbt-flex rbt-border-b">
        {renderTabItem('Upload', 'upload')}
        {renderTabItem('Embed link', 'url')}
      </div>
      <div className="rbt-py-3 rbt-px-2">
        {mode === 'upload' && renderUpload()}
        {mode === 'url' && renderUrl()}
      </div>
    </div>
  )
}

export default ImageUploader
