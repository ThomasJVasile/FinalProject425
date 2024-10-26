// // // Import the functions you need from the SDKs you need
// // import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// // // TODO: Add SDKs for Firebase products that you want to use
// // // https://firebase.google.com/docs/web/setup#available-libraries

// // // Your web app's Firebase configuration
// // // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // const firebaseConfig = {
// //   apiKey: "AIzaSyCAZ4OWGg8gtBbZ2ULE-b7-tjNxGQGQs6E",
// //   authDomain: "get-together-b52a1.firebaseapp.com",
// //   projectId: "get-together-b52a1",
// //   storageBucket: "get-together-b52a1.appspot.com",
// //   messagingSenderId: "139886868830",
// //   appId: "1:139886868830:web:1d12bf09f3f1f27fd5b7cf",
// //   measurementId: "G-5NWNE35G0X"
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);








// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";  // For Firebase Authentication
// import { getFirestore } from "firebase/firestore";  // For Firestore
// import { getStorage } from "firebase/storage";  // For Firebase Storage

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCAZ4OWGg8gtBbZ2ULE-b7-tjNxGQGQs6E",
//   authDomain: "get-together-b52a1.firebaseapp.com",
//   projectId: "get-together-b52a1",
//   storageBucket: "get-together-b52a1.appspot.com",
//   messagingSenderId: "139886868830",
//   appId: "1:139886868830:web:1d12bf09f3f1f27fd5b7cf",
//   measurementId: "G-5NWNE35G0X"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// // eslint-disable-next-line no-unused-vars
// const analytics = getAnalytics(app);
// //this is from error to skip line 
// // eslint-disable-next-line no-unused-vars
// const auth = getAuth(app);  // Firebase Authentication
// const db = getFirestore(app);  // Firestore Database
// //this is from error to skip line 
// // eslint-disable-next-line no-unused-vars
// const storage = getStorage(app);  // Firebase Storage

// export { db };



import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAZ4OWGg8gtBbZ2ULE-b7-tjNxGQGQs6E",
  authDomain: "get-together-b52a1.firebaseapp.com",
  projectId: "get-together-b52a1",
  storageBucket: "get-together-b52a1.appspot.com",
  messagingSenderId: "139886868830",
  appId: "1:139886868830:web:1d12bf09f3f1f27fd5b7cf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
