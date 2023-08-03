import uploadImage from './uploadImage'

function onSubmitImageFile(file: File) {
  return uploadImage(file)
}

export default onSubmitImageFile
