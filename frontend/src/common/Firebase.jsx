import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDltzEmaz9y47UMUFaYRpNoppP8P8gr1Uk",
    authDomain: "api-80c0e.firebaseapp.com",
    projectId: "api-80c0e",
    storageBucket: "api-80c0e.firebasestorage.app",
    messagingSenderId: "887275258631",
    appId: "1:887275258631:web:90ee5aca560fcb873f3ba2",
    measurementId: "G-04SSG7N3P7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to device default

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
