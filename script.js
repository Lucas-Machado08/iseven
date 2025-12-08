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

// EmailJS configurations
const emailConfigs = [
    {
        publicKey: 'M0sFgfekqxIsMSU5N',
        serviceId: 'service_9ltq9ol',
        templateId: 'template_mtpp2zo'
    },
    {
        publicKey: '4wJUnjOtyVkhPVTWT',
        serviceId: 'service_q3fw9yi',
        templateId: 'template_zcr14hk'
    },
    {
        publicKey: 's6nxs3LPTzK0AeUJp',
        serviceId: 'service_l6fum0d',
        templateId: 'template_5k8ifzd'
    }
];

let currentConfigIndex = 0;

// Initialize with first config
(function() {
    emailjs.init(emailConfigs[0].publicKey);
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
            economia: formData.get('economia') || '10'
        };
        
        // Validar campos obrigatórios
        if (!templateParams.nome || !templateParams.email || !templateParams.telefone || !templateParams.cidade) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
            return;
        }
        
        // Validar anexo obrigatório
        if (!file) {
            alert('Por favor, anexe uma foto da sua conta de energia.');
            
            // Destacar o campo de anexo
            const fileLabel = document.getElementById('file-button');
            if (fileLabel) {
                fileLabel.style.borderColor = '#ff0000';
                fileLabel.style.backgroundColor = '#ffe6e6';
                fileLabel.classList.add('error-shake');
                setTimeout(() => {
                    fileLabel.classList.remove('error-shake');
                    fileLabel.style.borderColor = '#3C557C';
                    fileLabel.style.backgroundColor = 'transparent';
                }, 2000);
            }
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
            return;
        }
        
        // Processar e enviar com imagem
        if (file) {
            console.log('Arquivo selecionado:', file.name, 'Tamanho:', (file.size / 1024).toFixed(2) + 'KB', 'Tipo:', file.type);
            
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
                console.log('Arquivo carregado, tamanho Base64:', (e.target.result.length / 1024).toFixed(2) + 'KB');
                const img = new Image();
                img.onload = function() {
                    console.log('Imagem carregada, dimensões:', img.width + 'x' + img.height);
                    // Criar canvas para redimensionar
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Redimensionar para tamanho menor (800px)
                    const maxSize = 1000;
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
                    
                    // Função para tentar enviar com diferentes níveis de compressão
                    function tentarEnviar(tentativa = 1) {
                        let quality, size;
                        
                        if (tentativa === 1) {
                            quality = 0.6;
                            size = 1000;
                        } else if (tentativa === 2) {
                            quality = 0.5;
                            size = 800;
                            console.log('Tentativa 2: Recomprimindo...');
                            submitBtn.innerHTML = 'Recomprimindo... <i class="fa-solid fa-spinner fa-spin"></i>';
                        } else {
                            alert('Erro: A imagem é muito complexa. Tente uma imagem mais simples.');
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
                            return;
                        }
                        
                        let newWidth = img.width;
                        let newHeight = img.height;
                        
                        if (newWidth > size || newHeight > size) {
                            if (newWidth > newHeight) {
                                newHeight = (newHeight / newWidth) * size;
                                newWidth = size;
                            } else {
                                newWidth = (newWidth / newHeight) * size;
                                newHeight = size;
                            }
                        }
                        
                        canvas.width = newWidth;
                        canvas.height = newHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                        
                        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                        console.log('Tentativa ' + tentativa + ' - Tamanho:', (compressedBase64.length / 1024).toFixed(2) + 'KB');
                        
                        templateParams.anexo_nome = file.name;
                        templateParams.anexo_base64 = compressedBase64;
                        
                        const config = emailConfigs[currentConfigIndex];
                        emailjs.send(config.serviceId, config.templateId, templateParams)
                            .then(function(response) {
                                alert('Mensagem e imagem enviadas com sucesso! Entraremos em contato em breve.');
                                form.reset();
                                resetFileLabel();
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
                            })
                            .catch(function(error) {
                                console.error('Erro tentativa ' + tentativa + ' (config ' + currentConfigIndex + '):', error);
                                
                                // Se erro 413, tentar comprimir mais
                                if (error.status === 413 && tentativa < 2) {
                                    tentarEnviar(tentativa + 1);
                                }
                                // Se erro de limite (402/429) e tem config alternativa, trocar
                                else if ((error.status === 402 || error.status === 429) && currentConfigIndex < emailConfigs.length - 1) {
                                    console.log('Limite atingido, trocando para configuração alternativa...');
                                    currentConfigIndex++;
                                    emailjs.init(emailConfigs[currentConfigIndex].publicKey);
                                    submitBtn.innerHTML = 'Tentando novamente... <i class="fa-solid fa-spinner fa-spin"></i>';
                                    tentarEnviar(1);
                                }
                                else {
                                    alert('Erro ao enviar: ' + (error.text || error.message || 'Tente novamente.'));
                                    submitBtn.disabled = false;
                                    submitBtn.innerHTML = 'Receber Atendimento <i class="fa-solid fa-envelope"></i>';
                                }
                            });
                    }
                    
                    tentarEnviar(1);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});