// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDatZFY_cU14nQGYQX1r6Y58C7bhw0LZtI",
  authDomain: "algocards-356ef.firebaseapp.com",
  projectId: "algocards-356ef",
  storageBucket: "algocards-356ef.appspot.com",
  messagingSenderId: "663486164891",
  appId: "1:663486164891:web:25f1cf56b2b9fe7aca3b3e",
  measurementId: "G-T91V73T6NE"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db};
