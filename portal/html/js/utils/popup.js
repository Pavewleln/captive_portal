const closeAllPopups = () => {
    document.querySelectorAll('.popup').forEach((popup) => {
        popup.style.display = 'none';
    });
}

/*================= toast =================*/

function showToast(message, error) {
    const toastElement = document.getElementById("toast");
    const toastMessage = document.getElementById("toast_message");

    toastElement.style.display = "block";
    toastMessage.innerText = message;

    setTimeout(function() {
        toastElement.style.display = "none";
    }, 3000);

    toastElement.addEventListener("click", function() {
        toastElement.style.display = "none";
    });
    if(error) console.error(error);
}