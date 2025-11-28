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

// EmailJS configuration
(function() {
    emailjs.init('4wJUnjOtyVkhPVTWT');
})();

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin"></i>';
        
        // Get form data
        const formData = new FormData(form);
        const fileInput = document.getElementById('contact-file');
        const file = fileInput.files[0];
        
        const templateParams = {
            nome: formData.get('nome') || '',
            email: formData.get('email') || '',
            telefone: formData.get('telefone') || '',
            cidade: formData.get('cidade') || '',
            mensagem: formData.get('mensagem') || '',
            economia: formData.get('economia') || '10',
            to_email: 'contato@isevenenergy.com.br'
        };
        
        // Validar campos obrigatórios
        if (!templateParams.nome || !templateParams.email || !templateParams.telefone || !templateParams.cidade) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
            return;
        }
        
        // Adicionar informações do arquivo (sem anexar)
        if (file) {
            const fileSizeKB = (file.size / 1024).toFixed(1);
            templateParams.anexo_nome = `${file.name} (${fileSizeKB}KB)`;
            alert(`Arquivo selecionado: ${file.name}\nTamanho: ${fileSizeKB}KB\n\nAs informações serão enviadas. Você poderá enviar o arquivo por email após nosso contato.`);
        } else {
            templateParams.anexo_nome = 'Nenhum arquivo anexado';
        }
        
        // Enviar via EmailJS
        emailjs.send('service_q3fw9yi', 'template_zcr14hk', templateParams)
            .then(function(response) {
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                form.reset();
            })
            .catch(function(error) {
                alert('Erro ao enviar mensagem. Tente novamente.');
            })
            .finally(function() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
            });
    });
});