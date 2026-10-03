import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Public web configuration, supplied by the project owner. No admin credentials.
const app = initializeApp({
  apiKey: "AIzaSyCgkxidc_rhodGYxTKVXrPEcRofdR8jzhI",
  authDomain: "studypilot-bd-test.firebaseapp.com",
  projectId: "studypilot-bd-test",
  storageBucket: "studypilot-bd-test.firebasestorage.app",
  messagingSenderId: "367146002913",
  appId: "1:367146002913:web:eca4409dac6b724c754aa0",
});
export const auth = getAuth(app);
