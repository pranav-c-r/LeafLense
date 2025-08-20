import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmFbma9cdB7e7wOq1C-jSqVjVqGziSXD8",
  authDomain: "medsense-a43ee.firebaseapp.com",
  projectId: "medsense-a43ee",
  storageBucket: "medsense-a43ee.firebasestorage.app",
  messagingSenderId: "393460843097",
  appId: "1:393460843097:web:ca596bdc3a5ff4c9afa748",
  measurementId: "G-DXNT07MBJX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleprovider = new GoogleAuthProvider(app);
export const database = getFirestore(app);