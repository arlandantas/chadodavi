import firebase, { db, INVITE_TABLE_NAME, getInviteCollection } from "./firebase.mjs";
const { getDocs, setDoc, doc, addDoc, deleteDoc } = firebase;

const inviteTable = document.querySelector("table");
const sizes = ['RN', 'P', 'M', 'G', 'GG'];

const getNewInviteLine = () => {
    const tr = document.createElement('tr');
    const codeTd = document.createElement('td');

    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.classList.add("form-control", "txt-id");
    codeTd.append(idInput);

    const codeInput = document.createElement('input');
    codeInput.classList.add("form-control", "txt-code");
    codeTd.append(codeInput);
    tr.append(codeTd);

    const nameTd = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.classList.add("form-control", "txt-name");
    nameTd.append(nameInput);
    tr.append(nameTd);

    const qtyTd = document.createElement('td');
    const qtyInput = document.createElement('input');
    qtyInput.classList.add("form-control", "txt-qty");
    qtyInput.type = 'number';
    qtyInput.value = 0;
    qtyInput.min = 0;
    qtyTd.append(qtyInput);
    tr.append(qtyTd);

    const sizeTd = document.createElement('td');
    const sizeSlct = document.createElement('select');
    sizeSlct.classList.add("form-control", "slct-size");
    for (const size of sizes) {
        const sizeOption = document.createElement('option');
        sizeOption.innerText = size;
        sizeOption.value = size;
        sizeSlct.append(sizeOption);
    }
    sizeTd.append(sizeSlct);
    tr.append(sizeTd);

    const confirmTd = document.createElement('td');
    confirmTd.classList.add("td-confirm", "px-2", "text-center");
    tr.append(confirmTd);

    const actionsTd = document.createElement('td');
    actionsTd.classList.add("text-center");
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add("btn", "btn-danger", "bt-delete");
    deleteBtn.type = 'button';
    deleteBtn.innerText = '🗑';
    deleteBtn.onclick = () => deleteInvite(tr);
    actionsTd.append(deleteBtn);

    const linkBtn = document.createElement('button');
    linkBtn.classList.add("btn", "btn-success", "bt-link");
    linkBtn.type = 'button';
    linkBtn.innerText = '🔗';
    linkBtn.onclick = () => showInviteLink(tr);
    actionsTd.append(linkBtn);

    tr.append(actionsTd);

    tr.querySelectorAll("input, select").forEach((e) => {
        e.onchange = () => updateInvite(tr, e);
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
    }
    tr.querySelector(".td-confirm").innerHTML = getConfirmContent(invite);
}

const getConfirmContent = (invite) => {
    if (!invite || typeof invite.confirmed === 'undefined' || invite.confirmed === null || invite.confirmed < 0) {
        return '<button class="btn disabled w-100 btn-outline-secondary bt-confirm">...</button>';
    }
    if (invite.confirmed === 0) {
        return '<button class="btn disabled w-100 btn-danger txt-white bt-confirm">X</button>';
    }
    if (invite.confirmed === invite.qty) {
        return `<button class="btn disabled w-100 btn-success bt-confirm">${invite.confirmed}</button>`;
    }
    return `<button class="btn disabled w-100 btn-info bt-confirm">${invite.confirmed}</button>`;
};

const prependEmptyTr = () => {
    const tr = getNewInviteLine();
    fillInviteTr(tr, null, 'new');
    tr.querySelector(".txt-code").placeholder = 'Novo';
    inviteTable.prepend(tr);
}

const updateInvite = async (tr, elmt) => {
    disableTr(tr)
    const id = tr.querySelector(".txt-id").value;
    const invite = {
        code: tr.querySelector(".txt-code").value,
        name: tr.querySelector(".txt-name").value,
        qty: tr.querySelector(".txt-qty").value,
        size: tr.querySelector(".slct-size").value,
    }
    if (id === 'new') {
        if (invite.code) {
            const inserted = await addDoc(getInviteCollection(), invite);
            tr.id = getInviteTrId(inserted.id);
            tr.querySelector(".txt-id").value = inserted.id;
            prependEmptyTr();
            console.log("Created ", { id, invite, inserted });
        }
    } else {
        await setDoc(
            doc(db, INVITE_TABLE_NAME, id),
            invite,
            { merge: true }
        );
        console.log("Updated ", { id, invite });
    }
    enableTr(tr)
    elmt.focus()
}

const deleteInvite = async (tr) => {
    disableTr(tr);
    const id = tr.querySelector(".txt-id").value;
    const code = tr.querySelector(".txt-code").value;
    if (confirm(`Deseja mesmo remover o convite "${code}"?`)) {
        await deleteDoc(doc(db, INVITE_TABLE_NAME, id));
        tr.remove();
        alert("Convite removido!");
    } else {
        enableTr(tr);
    }
}

const showInviteLink = (tr) => {
    // alert(`Getting link... ${tr.querySelector('.txt-id').value}`);
    alert(`Funcionalidade em desenvolvimento...`);
}

const getInviteTrId = (id) => `invite-${id}`;

const disableTr = (tr) => toggleTrEnable(tr, true)
const enableTr = (tr) => toggleTrEnable(tr, false)

const toggleTrEnable = (tr, disabled) =>
    tr.querySelectorAll("input, select, button:not(.btn-confirm)")
        .forEach((elmt) => elmt.disabled = disabled)

const startUp = async () => {
    const docs = await getDocs(getInviteCollection());
    docs.forEach((doc) => {
        const invite = doc.data();
        const tr = getNewInviteLine();
        fillInviteTr(tr, invite, doc.id);
        inviteTable.append(tr);
    });
    prependEmptyTr();
};
startUp();
