import { initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY as string,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET as string,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID as string,
    appId: process.env.REACT_APP_FIREBASE_APP_ID as string,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID as string
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
