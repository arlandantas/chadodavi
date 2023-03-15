import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js'
// import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-analytics.js'
// import { getAuth } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js'
import { getFirestore, collection, setDoc, getDocs, doc, where, query, Timestamp } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js'

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
const btValidate = document.querySelector("#bt-validate");
const btConfirm = document.querySelector("#bt-confirm");
const btConfirmAbsence = document.querySelector("#bt-confirm-absence");
const txtCode = document.querySelector(`#txt-code`);
const slctQty = document.querySelector("#slct-qty")
let currentInvite = null;

async function validateCode() {
  let code = `${txtCode.value}`.toLocaleLowerCase();
  try {
    const q = query(getInviteCollection(), where("code", "==", code))
    btValidate.disabled = true
    const docs = await getDocs(q);
    if (docs.size === 0) {
      btValidate.disabled = false
      alert("Código inválido!")
      return txtCode.focus()
    }
    docs.forEach((entry) => {
      const doc = entry.data();
      console.log({doc});
      const hasMany = doc.qty > 1
      slctQty.innerHTML = ''
      for (let i = 0; i < doc.qty; i++) {
        const option = document.createElement('option')
        option.textContent = i+1
        slctQty.appendChild(option)
      }
      slctQty.value = 1
      document.querySelector("#nomes").textContent = doc.names
      document.querySelector("#tamanho").textContent = doc.size
      document.querySelectorAll(".only-multiple").forEach(e => e.classList.toggle("hidden", !hasMany))
      document.querySelectorAll(".not-multiple").forEach(e => e.classList.toggle("hidden", hasMany))
      hideModal('invite-code-modal')
      showModal('confirm-decline-modal')
      currentInvite = { id: entry.id, ...doc }
    })
  } catch (e) {
    console.error("Error getting document: ", e);
    alert("Não foi possível carregar seus dados no momento :(");
  }
  btValidate.disabled = false
}
btValidate.onclick = validateCode

function updateCurrentDoc(qty) {
  return setDoc(
    doc(db, INVITE_TABLE_NAME, currentInvite.id),
    {
      confirmed: parseInt(qty),
      confirmationDatetime: Timestamp.fromDate(new Date()),
    },
    { merge: true }
  )
}

async function confirm(qty, button) {
  try {
    const isPresence = qty > 0
    button.disabled = true
    await updateCurrentDoc(qty)
    document.querySelector("#confirm-type").textContent = isPresence ? 'Presença' : 'Ausência'
    document.querySelector("#confirm-size").textContent = currentInvite.size
    document.querySelectorAll(".only-presence").forEach(e => e.classList.toggle("hidden", !isPresence))
    hideModal('confirm-decline-modal')
    showModal('confirm-message-modal')
  } catch (e) {
    console.error("Error updating document: ", e);
    alert("Não foi possível confirmar sua ausência no momento :(");
  }
  button.disabled = false
}

btConfirm.onclick = () => confirm(slctQty.value, btConfirm)
btConfirmAbsence.onclick = () => confirm(0, btConfirmAbsence)
