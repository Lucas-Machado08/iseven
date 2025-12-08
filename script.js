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

function truncateFileName(fileName, maxLength = 20) {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
    return `${truncatedName}...${extension}`;
}

window.addEventListener('load', () => {
    // Previne scroll automático indesejado
    if (window.location.hash && !sessionStorage.getItem('allowScroll')) {
        // Remove o hash temporariamente
        const hash = window.location.hash;
        history.replaceState(null, null, window.location.pathname);
        
        // Rola para o topo
        window.scrollTo(0, 0);
        
        // Restaura o hash após um pequeno delay se necessário
        setTimeout(() => {
            if (sessionStorage.getItem('intentionalNavigation')) {
                window.location.hash = hash;
                sessionStorage.removeItem('intentionalNavigation');
            }
        }, 100);
    }
    
    handlePrivacyRequired();
    
    const phoneInput = document.getElementById('phone-input');
    phoneInput.addEventListener('input', () => phoneMask(phoneInput));
});

window.addEventListener('resize', handlePrivacyRequired);

// Marca navegação intencional quando links âncora são clicados
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function() {
            sessionStorage.setItem('intentionalNavigation', 'true');
        });
    });
    
    // Atualizar label quando imagem for selecionada
    const fileInput = document.getElementById('contact-file');
    const fileLabel = document.getElementById('file-button');
    
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const fileName = truncateFileName(this.files[0].name);
                const fileSize = (this.files[0].size / 1024).toFixed(1);
                fileLabel.innerHTML = `<i class="fa-solid fa-check" style="color: #00AA8F;"></i> ${fileName} (${fileSize}KB)`;
                fileLabel.style.backgroundColor = '#e8f5f3';
                fileLabel.style.borderColor = '#00AA8F';
            }
        });
    }
});

// EmailJS configuration
(function() {
    emailjs.init('4wJUnjOtyVkhPVTWT');
})();

// Resetar label do arquivo quando formulário for resetado
function resetFileLabel() {
    const fileLabel = document.getElementById('file-button');
    if (fileLabel) {
        fileLabel.innerHTML = 'Anexe uma foto da sua última conta de energia <img src="imgs/anexo.png" alt="Ícone de anexo">';
        fileLabel.style.backgroundColor = '';
        fileLabel.style.borderColor = '';
    }
}

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
        
        // Processar e enviar com imagem
        if (file) {
            // Validar tamanho (máx 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 2MB.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
                return;
            }
            
            // Comprimir e converter imagem
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Criar canvas para redimensionar
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Redimensionar se maior que 1200px
                    const maxSize = 1200;
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = (height / width) * maxSize;
                            width = maxSize;
                        } else {
                            width = (width / height) * maxSize;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converter para Base64 com compressão
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    
                    templateParams.anexo_nome = file.name;
                    templateParams.anexo_base64 = compressedBase64;
                    
                    // Enviar via EmailJS com anexo
                    emailjs.send('service_q3fw9yi', 'template_zcr14hk', templateParams)
                        .then(function(response) {
                            alert('Mensagem e imagem enviadas com sucesso! Entraremos em contato em breve.');
                            form.reset();
                            resetFileLabel();
                        })
                        .catch(function(error) {
                            alert('Erro ao enviar mensagem. Tente novamente.');
                            console.error('Erro:', error);
                        })
                        .finally(function() {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
                        });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            templateParams.anexo_nome = 'Nenhuma imagem anexada';
            
            // Enviar via EmailJS sem anexo
            emailjs.send('service_q3fw9yi', 'template_zcr14hk', templateParams)
                .then(function(response) {
                    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                    form.reset();
                    resetFileLabel();
                })
                .catch(function(error) {
                    alert('Erro ao enviar mensagem. Tente novamente.');
                })
                .finally(function() {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
                });
        }
    });
});