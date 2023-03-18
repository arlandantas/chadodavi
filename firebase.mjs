import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js'
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-analytics.js'
// import { getAuth } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js'
// import firebase, { getFirestore, collection, addDoc, setDoc, getDocs, doc, where, query, Timestamp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js'
import * as firebase from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT6W2wIZjGS3BwdN_ACugvpjemLAekrRQ",
    authDomain: "chadodavi-a0e34.firebaseapp.com",
    projectId: "chadodavi-a0e34",
    storageBucket: "chadodavi-a0e34.appspot.com",
    messagingSenderId: "282186793775",
    appId: "1:282186793775:web:d0e5463ad9be2b81bb97da"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = firebase.getFirestore(app);
export const INVITE_TABLE_NAME = "convidados";
export const getInviteCollection = () => firebase.collection(db, INVITE_TABLE_NAME);

export default firebase;
