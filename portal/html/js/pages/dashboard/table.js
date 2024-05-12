const fieldNames = {};

const ignoreNames = {
    acctuniqueid: 'acctuniqueid'
}

function setAttributesBasedOnColumnName(row, columnName, cellValue) {
    switch (columnName) {
        case 'username':
            row.setAttribute('data-username', cellValue);
            break;
        case 'callingstationid':
            row.setAttribute('data-macaddress', cellValue);
            break;
        default:
            break;
    }
}

function fillTable(tableName, data) {
    const tableBody = document.querySelector(`#${tableName} tbody`);
    if (!tableBody) {
        console.error(`Элемент с id '${tableName}' не найден`);
        return;
    }

    tableBody.innerHTML = '';
    if (!data.length) {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 2;
        noDataCell.textContent = 'Пока здесь ничего нет';
        noDataRow.appendChild(noDataCell);
        tableBody.appendChild(noDataRow);
        console.log("Нет данных для отображения: ", tableName);
        return;
    }

    const columns = Object.keys(data[0]);
    if (tableName !== 'all_sessions' && tableName !== 'events') {
        columns.push('');
    }

    createTableHeader(tableBody, columns);

    data.forEach(item => {
        const row = document.createElement('tr');
        createTableRow(row, item, columns, tableName);
        tableBody.appendChild(row);
    });
}

function createTableHeader(tableBody, columns) {
    const headerRow = document.createElement('tr');
    columns.forEach(columnName => {
        if (ignoreNames[columnName]) return;
        const th = document.createElement('th');
        th.textContent = fieldNames[columnName] ?? columnName;
        headerRow.appendChild(th);
    });
    tableBody.appendChild(headerRow);
}

function createTableRow(row, item, columns, tableName) {
    columns.forEach(columnName => {
        const td = document.createElement('td');

        if (columnName === '') {
            const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgIcon.setAttribute("width", "24");
            svgIcon.setAttribute("height", "24");
            svgIcon.setAttribute("viewBox", "0 0 512 512");
            svgIcon.setAttribute("fill", "none");
            svgIcon.classList.add('arrow');
            svgIcon.innerHTML = `<path d="M93 175L256 338L419 175" stroke="black" stroke-width="24" stroke-linecap="round"/>`;
            td.appendChild(svgIcon);
            td.addEventListener('click', () => toggleTooltip(row, tableName));
        } else {
            const cellValue = item[columnName] ?? '-';
            setAttributesBasedOnColumnName(row, columnName, cellValue);
            if (ignoreNames[columnName]) return;
            td.textContent = cellValue;
        }

        row.appendChild(td);
    });
}

