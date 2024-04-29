/*================= toast =================*/

function showToast(message, error) {
    const toastElement = document.getElementsByClassName("toast")[0];
    const toastMessage = document.getElementsByClassName("toast__message")[0];

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

