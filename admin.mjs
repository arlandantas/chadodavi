import firebase, {
  db,
  INVITE_TABLE_NAME,
  getInviteCollection,
} from "./firebase.mjs";
const { getDocs, setDoc, doc, addDoc, deleteDoc } = firebase;

const inviteTable = document.querySelector("table tbody");
const sizes = ["RN", "P", "M", "G", "GG"];

const getNewInviteLine = () => {
  const tr = document.createElement("tr");
  const codeTd = document.createElement("td");

  const idInput = document.createElement("input");
  idInput.type = "hidden";
  idInput.classList.add("form-control", "txt-id");
  codeTd.append(idInput);

  const codeInput = document.createElement("input");
  codeInput.classList.add("form-control", "txt-code");
  codeTd.append(codeInput);
  tr.append(codeTd);

  const nameTd = document.createElement("td");
  const nameInput = document.createElement("input");
  nameInput.classList.add("form-control", "txt-name");
  nameTd.append(nameInput);
  tr.append(nameTd);

  const qtyTd = document.createElement("td");
  const qtyInput = document.createElement("input");
  qtyInput.classList.add("form-control", "txt-qty");
  qtyInput.type = "number";
  qtyInput.value = 0;
  qtyInput.min = 0;
  qtyTd.append(qtyInput);
  tr.append(qtyTd);

  const sizeTd = document.createElement("td");
  const sizeSlct = document.createElement("select");
  sizeSlct.classList.add("form-control", "slct-size");
  for (const size of sizes) {
    const sizeOption = document.createElement("option");
    sizeOption.innerText = size;
    sizeOption.value = size;
    sizeSlct.append(sizeOption);
  }
  sizeTd.append(sizeSlct);
  tr.append(sizeTd);

  const confirmTd = document.createElement("td");
  confirmTd.classList.add('text-center');

  const confirmInput = document.createElement("input");
  confirmInput.classList.add("form-control", "form-control-sm", "txt-confirmed");
  confirmInput.type = "number";
  confirmInput.value = -1;
  confirmInput.min = -1;
  confirmInput.addEventListener('change', () => updateConfirm(tr))
  confirmTd.append(confirmInput);

  const confirmText = document.createElement("div");
  confirmText.style.fontSize = '.7em'
  confirmText.classList.add("form-text", "div-confirmed", "text-small");
  confirmTd.append(confirmText);

  tr.append(confirmTd);

  const actionsTd = document.createElement("td");
  actionsTd.classList.add("text-center");

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("btn", "btn-outline-danger", "bt-delete");
  deleteBtn.type = "button";
  deleteBtn.innerText = "🗑";
  deleteBtn.onclick = () => deleteInvite(tr);
  actionsTd.append(deleteBtn);

  const linkBtn = document.createElement("button");
  linkBtn.classList.add("btn", "btn-outline-success", "bt-link", "ms-2");
  linkBtn.type = "button";
  linkBtn.innerText = "🔗";
  linkBtn.onclick = () => showInviteLink(tr);
  actionsTd.append(linkBtn);

  tr.append(actionsTd);

  tr.querySelectorAll("input, select").forEach((e) => {
    e.addEventListener('change', () => updateInvite(tr, e));
  });

  return tr;
};

const fillInviteTr = (tr, invite, id = null) => {
  if (id) {
    tr.id = getInviteTrId(id);
    tr.querySelector(".txt-id").value = id;
  }
  if (invite) {
    tr.querySelector(".txt-name").value = invite.name;
    tr.querySelector(".txt-code").value = invite.code;
    tr.querySelector(".txt-qty").value = invite.qty;
    tr.querySelector(".slct-size").value = invite.size;
    tr.querySelector(".txt-confirmed").value = invite.confirmed ?? -1;
  }
  updateConfirm(tr);
};

const updateConfirm = (tr) => {
  const { confirmed } = getInviteFromTr(tr);
  const txt = tr.querySelector(".txt-confirmed");
  const div = tr.querySelector(".div-confirmed");
  txt.classList.remove("border-danger", "border-success");
  div.classList.remove("text-danger", "text-success");
  if (confirmed === 0) {
    txt.classList.add("border-danger")
    div.classList.add("text-danger")
    div.innerText = "Ausente"
    return;
  }
  if (confirmed === -1) {
    div.innerText = "Aguardando..."
    return;
  }
  txt.classList.add("border-success")
  div.classList.add("text-success")
  div.innerText = "Confirmado"
};

const prependEmptyTr = () => {
  const tr = getNewInviteLine();
  fillInviteTr(tr, null, "new");
  tr.querySelector(".txt-code").placeholder = "Novo";
  inviteTable.prepend(tr);
};

const getInviteFromTr = (tr) => {
  return {
    code: tr.querySelector(".txt-code").value,
    name: tr.querySelector(".txt-name").value,
    qty: parseInt(tr.querySelector(".txt-qty").value),
    size: tr.querySelector(".slct-size").value,
    confirmed: parseInt(tr.querySelector(".txt-confirmed").value),
  };
};

const updateInvite = async (tr, elmt) => {
  disableTr(tr);
  const id = tr.querySelector(".txt-id").value;
  const invite = getInviteFromTr(tr);
  if (id === "new") {
    if (invite.code) {
      const inserted = await addDoc(getInviteCollection(), invite);
      tr.id = getInviteTrId(inserted.id);
      tr.querySelector(".txt-id").value = inserted.id;
      prependEmptyTr();
    }
  } else {
    await setDoc(doc(db, INVITE_TABLE_NAME, id), invite, { merge: true });
  }
  if (
    id === "new" ||
    elmt.classList.contains("slct-size") ||
    elmt.classList.contains("txt-name") ||
    elmt.classList.contains("txt-confirmed")
  ) {
    reorderTable();
  }
  enableTr(tr);
  elmt.focus();
  summarize();
};

const deleteInvite = async (tr) => {
  disableTr(tr);
  const id = tr.querySelector(".txt-id").value;
  const code = tr.querySelector(".txt-code").value;
  if (confirm(`Deseja mesmo remover o convite "${code}"?`)) {
    await deleteDoc(doc(db, INVITE_TABLE_NAME, id));
    tr.remove();
  } else {
    enableTr(tr);
  }
};

const showInviteLink = (tr) => {
  const invite = getInviteFromTr(tr);
  if (tr.id !== 'invite-new') {
    navigator.clipboard.writeText(`https://arlandantas.github.io/chadodavi?code=${invite.code}`);
    alert("O link do convite foi copiado com sucesso!");
  }
};

const getConfirmOrder = ({ confirmed }) => {
  if (typeof confirmed === 'undefined' || confirmed === -1) return 2;
  if (confirmed === 0) return 0;
  return 1;
}

const reorderTable = () => {
  const trSelector = () =>
    inviteTable.querySelectorAll(`tr:not(#${getInviteTrId("new")})`);
  window.trSelector = trSelector;
  let trQty = trSelector().length;
  for (let i = 1; i < trQty; i++) {
    const primaryTr = trSelector().item(i);
    const primaryInvite = getInviteFromTr(primaryTr);
    const piSizeIndex = sizes.indexOf(primaryInvite.size);
    const piConfirmOrder = getConfirmOrder(primaryInvite);
    for (let ii = i-1; ii >= 0; ii--) {
      const secondaryTr = trSelector().item(ii);
      const secondaryInvite = getInviteFromTr(secondaryTr);
      const siSizeIndex = sizes.indexOf(secondaryInvite.size);
      const siConfirmOrder = getConfirmOrder(secondaryInvite);
      const reorderItems = () => {
        primaryTr.remove();
        secondaryTr.before(primaryTr);
      }
      if (siConfirmOrder < piConfirmOrder) {
        continue;
      }
      if (siConfirmOrder > piConfirmOrder) {
        reorderItems();
        continue;
      }
      if (`${primaryInvite.code}`.localeCompare(`${secondaryInvite.code}`) === -1) {
        reorderItems();
      }
    }
  }
};

const getInviteTrId = (id) => `invite-${id}`;

const disableTr = (tr) => toggleTrEnable(tr, true);
const enableTr = (tr) => toggleTrEnable(tr, false);

const toggleTrEnable = (tr, disabled) => {
  tr
    .querySelectorAll("input, select, button:not(.btn-confirm)")
    .forEach((elmt) => (elmt.disabled = disabled));
}

const summarize = () => {
  let codes = 0
  let invites = 0
  let confirmed = 0
  let sizeQtys = sizes.map(() => 0);
  inviteTable.querySelectorAll("tr:not(#invite-new)").forEach((tr) => {
    const invite = getInviteFromTr(tr)
    codes++
    invites += invite.qty
    if (invite.confirmed > 0) {
      confirmed += invite.confirmed
    }
    sizeQtys[sizes.indexOf(invite.size)]++;
  })
  document.querySelector("#codes-qty").innerText = `(${codes})`
  document.querySelector("#invites-qty").innerText = `(${invites})`
  document.querySelector("#confirmed-qty").innerText = `(${confirmed})`
  document.querySelector("#size-qty").title = sizeQtys.map((e, i) => `${sizes[i]}: ${e}`).join("\n")
}

const startUp = async () => {
  const docs = await getDocs(getInviteCollection());
  docs.forEach((doc) => {
    const invite = doc.data();
    const tr = getNewInviteLine();
    fillInviteTr(tr, invite, doc.id);
    inviteTable.append(tr);
  });
  reorderTable();
  prependEmptyTr();
  summarize();
};
startUp();
