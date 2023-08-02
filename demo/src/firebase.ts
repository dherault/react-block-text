import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyAlyvTjtWNg_wl5Og6s8b8NUh1DIMtWLcY',
  authDomain: 'react-block-text.firebaseapp.com',
  projectId: 'react-block-text',
  storageBucket: 'react-block-text.appspot.com',
  messagingSenderId: '936568140490',
  appId: '1:936568140490:web:7caf1f854035573644fa33',
  measurementId: 'G-89QSZHTBZV',
}

const app = initializeApp(firebaseConfig)

export const analytics = getAnalytics(app)
