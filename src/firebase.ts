import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

//? Because of how firebase works you do not need to hide the apiKey
const firebaseConfig = {
  apiKey: "AIzaSyCFnR31vU1XoCEd9UK6v0OcQHID5uR8jNg",
  authDomain: "vfreeapi.firebaseapp.com",
  databaseURL: "https://vfreeapi-default-rtdb.firebaseio.com",
  projectId: "vfreeapi",
  storageBucket: "vfreeapi.firebasestorage.app",
  messagingSenderId: "654959308675",
  appId: "1:654959308675:web:06f3c76b4e2017691e10b6",
  measurementId: "G-J78BB0HC26"
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const firestore = getFirestore(firebaseApp);

export {
  firebaseApp,
  analytics,
  firestore
};
