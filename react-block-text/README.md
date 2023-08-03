# React Block Text

[![npm version](https://badge.fury.io/js/react-block-text.svg)](https://badge.fury.io/js/react-block-text)
[![PRs](https://img.shields.io/badge/PRs-Welcome!-darkGreen)](https://github.com/dherault/react-block-text/pulls)

A block text editor for React.

This is an open-source clone of the famous [Notion.so](https://notion.so) editor. Although not entirely feature complete, it comes with some basic blocks and offers a similar UI.

Project status: In-development beta. The API will be stable starting with v1.

## Demo

[See it live in your browser!](https://react-block-text.web.app/)

## Installation

```bash
npm install --save react-block-text
```
```bash
yarn add react-block-text
```

### Note for ViteJs users

You might need to [add globalThis](https://github.com/vitejs/vite/discussions/7915) to your app.

## Usage

```jsx
import { useState } from 'react'
import ReactBlockText, { headerPlugin, imagePlugin, listPlugin, quotePlugin, todoPlugin } from 'react-block-text'

const plugins = [
  ...headerPlugin(),
  ...todoPlugin(),
  ...listPlugin(),
  ...quotePlugin(),
  ...imagePlugin({
    onSubmitFile: /* See image plugin section */,
    onSubmitUrl: /* ... */,
    getUrl: /* ... */,
    maxFileSize: '5 MB', /* Optional, displayed in the file upload dialog */
  }),
]

function Editor() {
  const [value, setValue] = useState('')

  return (
    <ReactBlockText
      value={value}
      onChange={setValue}
      plugins={plugins}
    />
  )
}
```

## Options

```ts
type ReactBlockTextProps = {
  // The data for the editor
  value?: string
  // An array of plugin
  plugins?: ReactBlockTextPlugins
  // Enable read only mode
  readOnly?: boolean
  // Padding top of the editor
  paddingTop?: number
  // Padding bottom of the editor
  paddingBottom?: number
  // Padding left of the editor
  paddingLeft?: number
  // Padding right of the editor
  paddingRight?: number
  // The primary color for selection, drag and drop, and buttons
  primaryColor?: string | null | undefined
  // The default text color, to align with your design-system
  textColor?: string | null | undefined
  // Called when the value changes
  onChange?: (value: string) => void
  // Called when the user saves the editor with cmd/ctrl+s
  onSave?: () => void
}
```

## Plugins

### Header

Adds support for 3 types of headers.

### Todo

Adds support for todo lists with checkboxes.

### List

Adds support for ordered and unordered lists.

### Quote

Adds support for block quotes.

### Image

Adds support for images.

Three functions are required for the plugin to work:

```ts
type ReactBlockTextImagePluginSubmitter = () => {
  progress: number  // Between 0 and 1
  imageKey?: string // The reference to the image once it's uploaded
  isError?: boolean // If true, the upload failed and an error will be displayed in the editor
}

function onSubmitFile(file: File): Promise<ReactBlockTextImagePluginSubmitter>
function onSubmitUrl(file: File): Promise<ReactBlockTextImagePluginSubmitter>
function getUrl(imageKey: string): Promise<string>
```

The returned promises should resolve to a function that returns the progress of the upload as a number between 0 and 1 and eventually a `imageKey` corresponding to the image on your server. Using S3 or Firebase storage this is typically the storage path of the image. This `ReactBlockTextImagePluginSubmitter` function will be called periodically to update the progress of the upload and save the imageKey into the value prop.

`getUrl` should return the url of the image on your server based on the `imageKey`. Of course you can set `imageKey` directly to the URL and make `getUrl` an identity function.

For a Firebase example, see [the demo files](https://github.com/dherault/react-block-text/blob/main/demo/src/App.tsx).

### Community plugins

Create your own plugin based on the template provided by this repository and I'll add it here!

## License

MIT

This project is not affiliated with Notion Labs, Inc.

Notion Labs, [hire me!](https://dherault.com)
