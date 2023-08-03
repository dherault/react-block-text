import type { ReactBlockTextImagePluginSubmitter } from 'react-block-text'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { nanoid } from 'nanoid'

import { storage } from '../firebase'

// Example on how to upload an image using Firebase storage
async function uploadImage(imageFile: File): Promise<ReactBlockTextImagePluginSubmitter> {
  const storageRef = ref(storage, `images/${nanoid()}`)
  const uploadTask = uploadBytesResumable(storageRef, imageFile)

  let imageKey = ''
  let progress = 0
  let isError = false

  uploadTask.on('state_changed',
    snapshot => {
      progress = snapshot.bytesTransferred / snapshot.totalBytes

      console.log('Image upload progress:', `${Math.round(progress * 100)}%`)
    },
    error => {
      isError = true

      console.error(error)
    },
    () => {
      progress = 1
      imageKey = uploadTask.snapshot.metadata.fullPath

      console.log('Image upload complete!')
    }
  )

  return () => ({
    imageKey,
    progress,
    isError,
  })
}

export default uploadImage
