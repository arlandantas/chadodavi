import firebase, { db, INVITE_TABLE_NAME, getInviteCollection } from "./firebase.mjs";
const { query, getDocs, setDoc, where, doc, Timestamp } = firebase;

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
      document.querySelector("#nomes").textContent = doc.name
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
    document.querySelector("#confirm-size").textContent = currentInvite.size
    document.querySelectorAll(".only-absence").forEach(e => e.classList.toggle("hidden", isPresence))
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

// const insertStr = `Manoilly	Manu e Júnior	2	P
// Rafaela	Rafa	1	P
// LeticiaF	Letícia e Samuel	2	P
// Livia	Lívia	1	P
// Suely	Sueli e Washigton	2	P
// LeticiaM	Letícia	1	M
// Larissa	Larissa	1	M
// Jaqueline	Jaqueline	1	M
// Lys	Lys e Misael	2	M
// Miriam	Miriam e Rodolfo	2	M
// Nilda	Nilda	1	G
// Thalita	Thalita e Messias	2	G
// Samara	Samara e Lucas	2	G
// Rohdriggo	Rohdriggo	1	G
// Marlucia	Marlúcia e Melquíades	2	G
// Marlene	Marlene	1	G
// Salete	Salete e Josa	2	G
// Valquiria	Valquíria, Bal e Juju	3	GG
// Lyla	Lyla e Dori	2	GG
// Ana	Ana e Fábio	2	GG
// Paulinha	Paulinha e Kaká	2	GG
// Gabriela	Gaby	1	GG
// Marleide	Marleide	1	GG
// Debora	Debynha, Cielino, Daniel e Bia	4	GG
// Laise	Laíse e André	2	GG
// Marli	Marli e Marinaldo	2	GG
// Francisca	Francisca	1	GG
// Raimunda	Ramunda, Ákila e Netinho	3	GG
// Lauriana	Lauriana	1	GG
// PriscilaeAna	Priscila e Ana Maria	1	GG
// Luana	Luana	1	RN
// Keyla	Keyla	1	RN`

// const data = insertStr.split("\n")
//   .map(e => e.split("\t"))
//   .map(([ code, name, qty, size ]) => ({
//     code: code.toLocaleLowerCase(),
//     name,
//     qty: parseInt(qty),
//     size
//   }))

// data.forEach(async (item) => {
//   console.log("document inserted", await addDoc(getInviteCollection(), item))
// })