import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getStorage } from 'firebase/storage'
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check'

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

export const storage = getStorage(app)

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Les-XcnAAAAAGxTW0Nh15IwnNSqpVwNUsNskmRW'),
  isTokenAutoRefreshEnabled: true,
})
