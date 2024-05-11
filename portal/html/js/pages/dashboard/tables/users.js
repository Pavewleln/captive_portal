document.getElementById('export_json_users_button').addEventListener('click',  exportUsers);
const addUsersForm = document.getElementById('add_users_form');
addUsersForm.addEventListener("submit",  addUsers);
const editForm = document.getElementById('edit_users_form');
editForm.addEventListener('submit',  (event) => handleEditFormSubmit(event));
refreshButton.addEventListener('click', getUsers);

async function getUsers() {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/users`, {
            method: "GET", headers: {
                "Content-Type": "application/json",
            }
        })
        const data = await response.json();
        fillTable('users', data);
    } catch (error) {
        showToast(error.message || "Произошла ошибка при отправке запроса. Пожалуйста, повторите попытку.", error);
    } finally {
        toggleRefreshButton(false);
    }
}

/*============= Экспорт данных =============*/

async function exportUsers() {
    try {
        toggleRefreshButton(true);
        const response = await fetch(`${url}/data/users/export`)
        const data = await response.json();
        const jsonData = JSON.stringify(data);

        const blob = new Blob([jsonData], {type: 'application/json'});
        const exportUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = 'users.json';
        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(exportUrl);
        document.body.removeChild(a);
    } catch (error) {
        showToast(error.message || "Ошибка загрузки. Проверьте правильность введенных данных", error);
    } finally {
        toggleRefreshButton(false);
    }
}

/*============= Запрос доп данных =============*/

async function fetchAdditionalData(username) {
    toggleRefreshButton(true);
    try {
        const response = await fetch(`${url}/data/users/${username}`)
        return await response.json()
    } catch (error) {
        showToast('Ошибка при получении дополнительных данных. Пожалуйста, повторите попытку.', error);
    } finally {
        toggleRefreshButton(false)
    }
}

/*============= Создать пользователя =============*/

const addModal = document.getElementById("add_users_popup");
const openAddUsersButton = document.getElementById("open_add_users_popup_button");
const closeAddUsersPopupButton = document.getElementById("close_add_users_popup_button");

openAddUsersButton.addEventListener('click', () => {
    addModal.style.display = "block";
});

closeAddUsersPopupButton.addEventListener('click', () => {
    addModal.style.display = "none";
});

addModal.addEventListener('click', (event) => {
    if (event.target === addModal) {
        addModal.style.display = "none";
    }
});

async function addUsers(event) {
    event.preventDefault();
    let username = addUsersForm.querySelector('input[name="username"]').value;
    let password = addUsersForm.querySelector('input[name="password"]').value;
    let mac = addUsersForm.querySelector('input[name="mac"]').value;
    let role = addUsersForm.querySelector('select[name="role"]').value;

    try {
        const response = await fetch(`${url}/data/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, mac, role }),
        });

        if (response.ok) {
            await getUsers();
            closeAllPopups();
            return await response.json();
        } else {
            const errorData = await response.json();
            showToast(errorData.msg || "Ошибка добавления записи. Попробуйте позже");
        }
    } catch (error) {
        showToast(error.message || "Ошибка добавления записи. Попробуйте позже");
    } finally {
        addUsersForm.reset();
    }
}

/*============= Изменить пользователя =============*/

async function handleEditButtonClick(username, tableName) {
    try {
        const data = await fetchAdditionalData(username);
        populateEditForm(username, data);
        openEditModal();
        const editForm = document.getElementById('edit_users_form');
        editForm.setAttribute('data-tableName', tableName);
        editForm.setAttribute('data-username', username);
    } catch (error) {
        showToast('Ошибка при загрузке данных пользователя для редактирования', error);
    }
}

function openEditModal() {
    const editModal = document.getElementById("edit_users_popup");
    editModal.style.display = "block";

    const closeModal = () => {
        editModal.style.display = "none";
    };

    const closeEditUsersPopupButton = document.getElementById("close_edit_users_popup_button");
    closeEditUsersPopupButton.addEventListener('click', closeModal);

    const editModalBackdrop = document.getElementById("edit_users_popup");
    editModalBackdrop.addEventListener('click', (event) => {
        if (event.target === editModalBackdrop) {
            closeModal();
        }
    });
}

async function handleEditFormSubmit(event) {
    event.preventDefault();
    const editForm = document.getElementById('edit_users_form');
    const formData = {
        newUsername: '', oldUsername: '', radcheck: {}, macs: {}
    };

    for (const element of editForm.elements) {
        if (element.tagName === 'INPUT' && element.type !== 'button') {
            const name = element.name;
            const value = element.value;
            if (name.endsWith('_key')) {
                const key = name.slice(0, -4);
                const valueElement = editForm.querySelector(`input[name="${key}_value"]`);
                if (valueElement && valueElement.value.trim() !== '') {
                    switch (key) {
                        case 'MAC':
                            formData.macs[value] = valueElement.value;
                            break;
                        default:
                            formData.radcheck[value] = valueElement.value;
                            break;
                    }
                }
            }
        }
    }

    formData.oldUsername = editForm.getAttribute('data-username');
    formData.newUsername = editForm.querySelector('input[name="username"]').value;

    try {
        const response = await fetch(`${url}/data/users`, {
            method: 'PATCH', headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(formData)
        })

        if (response.ok) {
            await getUsers();
            closeAllPopups();
            return await response.json();
        } else {
            const errorData = await response.json();
            showToast(errorData.msg || "Ошибка при изменении данных. Попробуйте повторить попытку.");
        }
    } catch (error) {
        showToast('Ошибка при изменении данных. Пожалуйста, повторите попытку.', error);
    }
}

function populateEditForm(username, userData) {
    const editForm = document.getElementById('edit_users_form');
    editForm.innerHTML = '';

    const usernameInput = createInputField('text', 'username', username);
    editForm.appendChild(usernameInput);

    for (let key in userData) {
        if (userData.hasOwnProperty(key)) {
            const pairDiv = document.createElement('div');
            pairDiv.classList.add('key-value-pair');

            const keyInput = createInputField('text', key + '_key', key);
            pairDiv.appendChild(keyInput);

            const valueInput = createInputField('text', key + '_value', userData[key]);
            pairDiv.appendChild(valueInput);

            if (!['Cleartext-Password', 'MAC', 'Service-Type'].includes(key)) {
                const deleteButton = createDeleteButton(pairDiv);
                pairDiv.appendChild(deleteButton);
            }

            editForm.appendChild(pairDiv);
        }
    }

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons-container');

    const saveButton = createSaveButton();
    buttonsContainer.appendChild(saveButton);

    const addButton = createAddButton();
    buttonsContainer.appendChild(addButton);

    editForm.appendChild(buttonsContainer);
}

function createDeleteButton(pairDiv) {
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.classList.add('button-red');
    deleteButton.innerHTML = '❌';
    deleteButton.style.fontSize = '0.5rem';
    deleteButton.style.backgroundColor = '#ffffff';

    deleteButton.addEventListener('click', () => {
        pairDiv.remove();
    });

    return deleteButton;
}

function createAddButton() {
    const addButton = document.createElement('button');
    addButton.setAttribute('type', 'button');
    addButton.setAttribute('id', 'addPairButton');
    addButton.classList.add('button-green');
    addButton.textContent = '+';
    addButton.addEventListener('click', addKeyValuePair);
    return addButton;
}

function addKeyValuePair() {
    const pairDiv = document.createElement('div');
    pairDiv.classList.add('key-value-pair');

    const uniqueId = '' + Date.now();

    const keyInput = createInputField('text', uniqueId + '_key', '');
    keyInput.placeholder = 'Attribute';
    pairDiv.appendChild(keyInput);

    const valueInput = createInputField('text', uniqueId + '_value', '');
    valueInput.placeholder = 'Value';
    pairDiv.appendChild(valueInput);

    const deleteButton = createDeleteButton(pairDiv);
    pairDiv.appendChild(deleteButton);

    const editForm = document.getElementById('edit_users_form');
    editForm.insertBefore(pairDiv, editForm.lastChild);
}

function createSaveButton() {
    const saveButton = document.createElement('button');
    saveButton.setAttribute('type', 'submit');
    saveButton.setAttribute('id', 'edit_users_button');
    saveButton.classList.add('button-blue');
    saveButton.textContent = 'Сохранить';
    return saveButton;
}

function createInputField(type, name, value) {
    const input = document.createElement('input');
    input.setAttribute('type', type);
    input.setAttribute('name', name);
    input.setAttribute('value', value);
    return input;
}

/*============= Удалить пользователя =============*/

function openDeleteModal(username, tableName) {
    const deleteModal = document.getElementById("delete_users_popup");
    deleteModal.style.display = "block";

    const deleteModalForm = document.getElementById("delete_users_form");
    deleteModalForm.innerHTML = `
        <p>Вы уверены, что хотите удалить пользователя <strong>${username}</strong> из таблицы <strong>${tableName}</strong>?</p>
        <button id="confirm_delete_button" class="button-red">Подтвердить</button>
    `;

    const closeModal = () => {
        deleteModal.style.display = "none";
    };

    const closeDeleteUsersPopupButton = document.getElementById("close_delete_users_popup_button");
    closeDeleteUsersPopupButton.addEventListener('click', () => {
        closeModal();
    });

    const deleteModalBackdrop = document.getElementById("delete_users_popup");
    deleteModalBackdrop.addEventListener('click', (event) => {
        if (event.target === deleteModalBackdrop) {
            closeModal();
        }
    });
}

async function handleDeleteButtonClick(username, tableName) {
    const deleteButton = document.querySelector('.tooltip__controls-remove[data-username="' + username + '"]');
    const popup = document.getElementById('delete_users_popup');

    openDeleteModal(username, tableName);

    document.getElementById('confirm_delete_button').addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${url}/data/users/${username}`, {
                method: "DELETE", headers: {
                    "Content-Type": "application/json",
                }
            })

            closeAllPopups();
            const trParent = deleteButton.closest('tr');
            const previousTr = trParent.previousElementSibling;

            if (trParent) {
                trParent.remove();
            }

            if (previousTr) {
                previousTr.remove();
            }

            popup.style.display = "none";
            return await response.json();
        } catch (error) {
            showToast('Ошибка при удалении данных. Пожалуйста, повторите попытку.', error);
        }
    });


    const closeDeleteUsersPopupButton = document.getElementById('close_delete_users_popup_button');
    closeDeleteUsersPopupButton.addEventListener('click', () => {
        popup.style.display = "none";
    });
}

/*============= tooltip =============*/

function unpackData(data, content) {
    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object') {
            content += `<div class="tooltip__content-row">${key}:</div>`;
            content = unpackData(data[key], content);
        } else if (key !== 'Cleartext-Password') {
            content += `<div class="tooltip__content-row">${key}: ${data[key]}</div>`;
        }
    });
    return content;
}

function createTooltipContent(data, username) {
    let content = '';
    if (Object.keys(data).length) {
        content = unpackData(data, content);
    }
    content += `
        <div class="tooltip__controls">
            <button class="tooltip__controls-edit" data-username="${username}" id="open_edit_users_popup_button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32px" height="32px" style="background-color: #fff;">
                    <path d="M 46.193359 6.8632812 C 44.526071 6.8841256 42.877087 7.5121253 41.476562 8.9921875 A 1.0001 1.0001 0 0 0 41.464844 9.0039062 C 35.797767 15.186541 15.433594 38.771484 15.433594 38.771484 A 1.0001 1.0001 0 0 0 15.212891 39.214844 L 13.724609 46.119141 C 13.444407 46.044741 13.282976 45.914448 12.982422 45.851562 A 1.0001 1.0001 0 1 0 12.572266 47.808594 C 12.877322 47.872424 13.024969 47.994747 13.302734 48.070312 L 11.798828 55.044922 A 1.0001 1.0001 0 0 0 13.179688 56.169922 L 20.552734 52.914062 A 1.0001 1.0001 0 0 0 21.105469 51.705078 C 21.105469 51.705078 20.707279 50.481577 19.503906 49.210938 C 18.693808 48.355556 17.312325 47.523161 15.621094 46.806641 L 17.113281 39.886719 C 17.372171 39.586964 37.386514 16.413649 42.927734 10.367188 L 42.931641 10.365234 C 47.763656 5.2669134 55.892683 14.151904 52.833984 17.423828 A 1.0001 1.0001 0 0 0 52.8125 17.447266 C 52.8125 17.447266 33.986172 38.918963 27.871094 46.265625 C 27.080453 44.910156 26.064838 43.707954 25.044922 42.832031 C 24.180836 42.089939 23.883263 41.946012 23.404297 41.630859 L 45.919922 16.087891 A 1.0001 1.0001 0 1 0 44.419922 14.765625 L 21.185547 41.125 A 1.0001 1.0001 0 0 0 21.425781 42.646484 C 21.425781 42.646484 22.510357 43.291691 23.742188 44.349609 C 24.974017 45.407528 26.291404 46.87853 26.763672 48.294922 A 1.0001 1.0001 0 0 0 28.486328 48.611328 C 33.662451 42.298911 54.261719 18.826896 54.294922 18.789062 C 58.175865 14.637575 52.62664 7.3970045 46.908203 6.890625 C 46.669935 6.8695259 46.431543 6.8603035 46.193359 6.8632812 z M 15.203125 48.751953 C 16.463038 49.330995 17.469117 49.97165 18.052734 50.587891 C 18.58138 51.146087 18.53841 51.243766 18.695312 51.548828 L 14.167969 53.546875 L 15.203125 48.751953 z"/>
                </svg>
            </button>
            <button class="tooltip__controls-remove" data-username="${username}" id="open_delete_users_popup_button">
                <svg height="32px" width="32px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 496.158 496.158" style="background-color: #fff;">
                    <path style="fill:#E04F5F;" d="M0,248.085C0,111.063,111.069,0.003,248.075,0.003c137.013,0,248.083,111.061,248.083,248.082
                    c0,137.002-111.07,248.07-248.083,248.07C111.069,496.155,0,385.087,0,248.085z"/>
                    <path style="fill:#FFFFFF;" d="M383.546,206.286H112.612c-3.976,0-7.199,3.225-7.199,7.2v69.187c0,3.976,3.224,7.199,7.199,7.199
                    h270.934c3.976,0,7.199-3.224,7.199-7.199v-69.187C390.745,209.511,387.521,206.286,383.546,206.286z"/>
                </svg>
            </button>
        </div>
    `;

    return content;
}

function toggleTooltip(row, tableName) {
    const tooltip = row.nextElementSibling;
    if (tooltip && tooltip.classList.contains('tooltip')) {
        tooltip.remove();
    } else {
        const existingTooltips = document.querySelectorAll('.tooltip');
        existingTooltips.forEach((existingTooltip) => existingTooltip.remove());

        const username = row.getAttribute('data-username');

        const tooltipRow = document.createElement('tr');
        tooltipRow.classList.add('tooltip');
        tooltipRow.setAttribute('data-username', username);

        const tooltipCell = document.createElement('td');
        tooltipCell.colSpan = row.cells.length;
        tooltipRow.appendChild(tooltipCell);

        const tooltipContent = document.createElement('div');
        tooltipContent.classList.add('tooltip__content');

        fetchAdditionalData(username)
            .then(response => {
                tooltipContent.innerHTML = createTooltipContent(response, username);

                const editButton = document.getElementById('open_edit_users_popup_button');
                editButton.addEventListener('click', () => handleEditButtonClick(username, tableName));

                const deleteButton = document.getElementById('open_delete_users_popup_button');
                deleteButton.addEventListener('click', () => handleDeleteButtonClick(username, tableName));
            })
            .catch(error => {
                console.error('Ошибка при запросе дополнительных данных:', error);
            });

        tooltipCell.appendChild(tooltipContent);
        row.insertAdjacentElement('afterend', tooltipRow);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await getUsers();
});