# React Block Text

A block text editor for React.

This is an open-source clone of the famous [Notion.so](https://notion.so) editor. Although not entirely feature complete, it comes with the basic blocks and offers a similar UI.

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
import ReactBlockText, { headerPlugin, imagePlugin, listPlugin, quotePlugin, todoPlugin } from 'react-block-text'

const plugins = [
  ...headerPlugin(),
  ...todoPlugin(),
  ...listPlugin(),
  ...quotePlugin(),
  ...imagePlugin({
    onSubmitFile: /* See Image plugin section */,
    onSubmitUrl: /* ... */,
    getUrl: /* ... */,
    maxFileSize: '5 MB'
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
  value: string // The data for the editor
  plugins?: ReactBlockTextPlugins // A list of plugin
  readOnly?: boolean // Enable read only mode
  paddingTop?: number // Padding top of the editor
  paddingBottom?: number // Padding bottom of the editor
  paddingLeft?: number // Padding left of the editor
  paddingRight?: number // Padding right of the editor
  primaryColor?: string | null | undefined // The primary color for selection, drag and drop, and buttons
  textColor?: string | null | undefined // The default text color, to align with your design-system
  onChange?: (value: string) => void // Called when the value changes
  onSave?: () => void // Called when the user saves the editor with cmd/ctrl+s
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
type ImagePluginSubmitHandler = () => {
  progress: number // Between 0 and 1
  imageKey?: string // The url of the image once it's uploaded
}

function onSubmitFile(file: File): Promise<ImagePluginSubmitHandler>
function onSubmitUrl(file: File): Promise<ImagePluginSubmitHandler>
function getUrl(imageKey: string): Promise<string>
```

The returned promise should resolve to a function that returns the progress of the upload as a number between 0 and 1 and eventually a `imageKey` corresponding to the image on your server. Using S3 or Firebase storage this is typically the storage path of the image. This `ImagePluginSubmitHandler` function will be called periodically to update the progress of the upload.

`getUrl` should return the url of the image on your server based on the `imageKey`. Of course you can set `imageKey` directly to the URL and make getUrl an identity function.

## License

MIT

This project is not affiliated with Notion Labs, Inc.

Notion Labs, hire me!
