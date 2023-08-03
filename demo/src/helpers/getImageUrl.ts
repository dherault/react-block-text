import { getDownloadURL, ref } from 'firebase/storage'

import { storage } from '../firebase'

function getImageUrl(imageKey: string) {
  return getDownloadURL(ref(storage, imageKey))
}

export default getImageUrl
