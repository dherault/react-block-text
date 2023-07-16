// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAlyvTjtWNg_wl5Og6s8b8NUh1DIMtWLcY',
  authDomain: 'react-block-text.firebaseapp.com',
  projectId: 'react-block-text',
  storageBucket: 'react-block-text.appspot.com',
  messagingSenderId: '936568140490',
  appId: '1:936568140490:web:7caf1f854035573644fa33',
  measurementId: 'G-89QSZHTBZV',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
