

function showModal(modalId) {
    getModalBackdrop();
    const modal = document.querySelector(`#${modalId}`);
    modal.classList.remove('hidden');
}

function hideModal(modalId) {
    const backdrop = getModalBackdrop();
    const modal = document.querySelector(`#${modalId}`);
    modal.classList.add('hidden');
    backdrop.remove();
}

function getModalBackdrop() {
    let backdrop = document.querySelector(`#modal-backdrop`);
    if (backdrop) {
        return backdrop;
    }
    backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.classList.value = 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity';
    document.querySelector("body").appendChild(backdrop);
    return backdrop;
}

// showModal('invite-code-modal')
