function handlePrivacyRequired() {
    const privacy1 = document.getElementById('contact-check');
    const privacy2 = document.getElementById('contact-check2');
    
    if (window.innerWidth <= 768) {
        privacy1.removeAttribute('required');
        privacy2.setAttribute('required', 'required');
    } else {
        privacy1.setAttribute('required', 'required');
        privacy2.removeAttribute('required');
    }
}

function phoneMask(input) {
    input.value = input.value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

window.addEventListener('load', () => {
    handlePrivacyRequired();
    
    const phoneInput = document.getElementById('phone-input');
    phoneInput.addEventListener('input', () => phoneMask(phoneInput));
});

window.addEventListener('resize', handlePrivacyRequired);