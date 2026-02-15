import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfUDhTw4nF4pzcMpKD38FjYlzGt82ra_Y",
  authDomain: "ownerwala-84cfd.firebaseapp.com",
  projectId: "ownerwala-84cfd",
  storageBucket: "ownerwala-84cfd.firebasestorage.app",
  messagingSenderId: "422316456146",
  appId: "1:422316456146:web:c7a3549bf52842d846d50b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
