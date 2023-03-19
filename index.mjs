import firebase, { db, INVITE_TABLE_NAME, getInviteCollection } from "./firebase.mjs";
const { query, getDocs, setDoc, where, doc, Timestamp } = firebase;

const btValidate = document.querySelector("#bt-validate");
const btInviteModal = document.querySelector("#bt-invite-modal");
const btConfirm = document.querySelector("#bt-confirm");
const btConfirmAbsence = document.querySelector("#bt-confirm-absence");
const txtCode = document.querySelector(`#txt-code`);
const slctQty = document.querySelector("#slct-qty")
let currentInvite = null;

function openInviteModal() {
  if (currentInvite) {
    showModal('confirm-decline-modal');
  } else {
    showModal('invite-code-modal');
  }
}
btInviteModal.onclick = openInviteModal;

async function validateCode() {
  let code = `${txtCode.value}`.toLocaleLowerCase();
  loadCode(code);
  hideModal('invite-code-modal');
  showModal('confirm-decline-modal');
}

async function loadCode(code) {
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

async function startup() {
  const CODE_QUERY_PARAM_KEY = "code";
  const url = new URL(window.location.href);
  const code = url.searchParams.get(CODE_QUERY_PARAM_KEY);
  if (code) {
    url.searchParams.delete(CODE_QUERY_PARAM_KEY);
    window.history.pushState({}, document.title, url.href);
    await loadCode(code);
    document.querySelectorAll(".only-invited").forEach(elmt => elmt.classList.remove("hidden"))
  } else {
    document.querySelectorAll(".only-generic").forEach(elmt => elmt.classList.remove("hidden"))
  }
  document.querySelector("#loading").classList.add("hidden")
}
startup();
