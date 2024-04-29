/*================= popup =================*/

const addModal = document.getElementById("addRadCheckPopup");
const openAddRadCheckButton = document.getElementById("openAddRadCheckPopupButton");
const closeAddRadCheckPopupButton = document.getElementById("closeAddRadCheckPopupButton");

openAddRadCheckButton.addEventListener('click', () => {
    addModal.style.display = "block";
});

closeAddRadCheckPopupButton.addEventListener('click', () => {
    addModal.style.display = "none";
});

addModal.addEventListener('click', (event) => {
    if (event.target === addModal) {
        addModal.style.display = "none";
    }
});