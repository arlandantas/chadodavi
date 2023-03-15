import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js'
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-analytics.js'
// import { getAuth } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js'
import { getFirestore, collection, addDoc, getDocs, doc, where, query } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js'

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const INVITE_TABLE_NAME = "convidados";
const getInviteCollection = () => collection(db, INVITE_TABLE_NAME);
const btValidate = document.querySelector("#bt-validate")

async function validateCode() {
  const codeField = document.querySelector(`#txt-code`);
  let code = codeField.value;
  try {
    const q = query(getInviteCollection(), where("code", "==", code))
    btValidate.disabled = true
    const docs = await getDocs(q);
    if (docs.size === 0) {
      btValidate.disabled = false
      alert("Código inválido!")
      return codeField.focus()
    }
    docs.forEach((entry) => {
      const doc = entry.data();
      console.log({doc});
      const hasMany = doc.qty > 1
      const slct = document.querySelector("#slct-qty")
      slct.innerHTML = ''
      for (let i = 0; i < doc.qty; i++) {
        const option = document.createElement('option')
        option.textContent = i+1
        slct.appendChild(option)
      }
      slct.value = 1
      document.querySelectorAll(".only-multiple").forEach(e => e.classList.toggle("hidden", !hasMany))
      document.querySelectorAll(".not-multiple").forEach(e => e.classList.toggle("hidden", hasMany))
      hideModal('invite-code-modal')
      showModal('confirm-decline-modal')
    })
    btValidate.disabled = false
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("Failed to save document");
  }
}
btValidate.onclick = validateCode
