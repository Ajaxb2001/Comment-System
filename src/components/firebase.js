import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBoMmAdEfsZi4yg2iJ0tTvVQU_PPLW87E",
  authDomain: "glogin-8689f.firebaseapp.com",
  projectId: "glogin-8689f",
  storageBucket: "glogin-8689f.appspot.com",
  messagingSenderId: "368043477182",
  appId: "1:368043477182:web:35e7ded26b0bcb699776ef",
  measurementId: "G-NZ8D977FLC"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
