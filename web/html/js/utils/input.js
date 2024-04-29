document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', handleInput);
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
    });
});

function handleInput() {
    const label = this.nextElementSibling;
    if (this.value !== '') {
        label.style.top = '0px';
        label.style.fontSize = '12px';
        label.style.color = '#3498db';
    } else {
        label.style.top = '20px';
        label.style.fontSize = '14px';
        label.style.color = '#777';
    }
}

function handleFocus() {
    const label = this.nextElementSibling;
    label.style.color = '#3498db';
}

function handleBlur() {
    const label = this.nextElementSibling;
    if (this.value === '') {
        label.style.color = '#777';
    }
}