import uploadImage from './uploadImage'

async function onSubmitImageUrl(url: string) {
  const response = await fetch(url)

  const type = response.headers.get('content-type') ?? undefined

  const blob = await response.blob()

  const file = new File([blob], 'image', { type })

  return uploadImage(file)
}

export default onSubmitImageUrl
