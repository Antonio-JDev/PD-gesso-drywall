document.addEventListener('DOMContentLoaded', () => {
  console.log('Site PG Gesso Drywall carregado com sucesso!');

  document.getElementById('menu-toggle').addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
  });

  const carousel = document.getElementById('carousel');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const indicatorsContainer = document.getElementById('indicators');
  const card = carousel.querySelector('div'); // primeiro card
  const gap = 24; // gap-6 do Tailwind = 24px
  const cardWidth = card.offsetWidth + gap;

  let autoplayInterval;
  let cardCount = carousel.children.length;
  let currentIndex = 0;

  function createIndicators() {
    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < cardCount; i++) {
      const dot = document.createElement('span');
      dot.className = 'w-3 h-3 bg-gray-500 rounded-full inline-block transition-colors duration-300';
      if (i === 0) dot.classList.add('bg-orange-500');
      indicatorsContainer.appendChild(dot);
    }
  }

  function updateIndicators(index) {
    const dots = indicatorsContainer.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove('bg-orange-500');
      dots[i].classList.add('bg-gray-500');
    }
    if (dots[index]) dots[index].classList.add('bg-orange-500');
  }

  function scrollToCard(index) {
    carousel.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    updateIndicators(index);
  }

  function scrollNext() {
    currentIndex++;
    if (currentIndex >= cardCount) currentIndex = 0;
    scrollToCard(currentIndex);
  }

  function scrollPrev() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = cardCount - 1;
    scrollToCard(currentIndex);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(scrollNext, 3000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    scrollNext();
    startAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    scrollPrev();
    startAutoplay();
  });

  carousel.addEventListener('mouseover', stopAutoplay);
  carousel.addEventListener('mouseout', startAutoplay);

  // Init
  createIndicators();
  startAutoplay();

  // Formulário de contato
  const form = document.getElementById('contato-form');
  const formMessage = document.getElementById('form-message');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coletar dados do formulário
    const formData = new FormData(form);
    const dados = {
      nome: formData.get('nome'),
      telefone: formData.get('telefone'),
      email: formData.get('email'),
      cidade: formData.get('cidade'),
      servico: formData.get('servico'),
      mensagem: formData.get('mensagem')
    };
    
    // Validação básica
    if (!dados.nome || !dados.telefone || !dados.email || !dados.mensagem) {
      showMessage('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
      showMessage('error', 'Por favor, insira um email válido.');
      return;
    }
    
    // Desabilitar botão de envio
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
    
    try {
      // Criar corpo do email
      const emailBody = `
Nova solicitação de orçamento - PD Gesso Drywall

DADOS DO CLIENTE:
Nome: ${dados.nome}
Telefone: ${dados.telefone}
Email: ${dados.email}
Cidade: ${dados.cidade || 'Não informado'}

SERVIÇO SOLICITADO:
${dados.servico ? getServicoNome(dados.servico) : 'Não especificado'}

DESCRIÇÃO DO PROJETO:
${dados.mensagem}

---
Mensagem enviada através do site PD Gesso Drywall
Data: ${new Date().toLocaleString('pt-BR')}
      `.trim();
      
      // Usar mailto para envio
      const mailtoLink = `mailto:policarpodiasro@gmail.com?subject=Nova Solicitação de Orçamento - ${dados.nome}&body=${encodeURIComponent(emailBody)}`;
      
      // Abrir cliente de email
      window.location.href = mailtoLink;
      
      // Mostrar mensagem de sucesso após um breve delay
      setTimeout(() => {
        showMessage('success', 'Seu cliente de email foi aberto. Complete o envio da mensagem.');
        form.reset();
      }, 1000);
      
    } catch (error) {
      console.error('Erro:', error);
      showMessage('error', 'Erro ao processar solicitação. Tente novamente ou entre em contato via WhatsApp.');
    } finally {
      // Reabilitar botão
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  function showMessage(type, text) {
    // Esconder mensagens anteriores
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    // Mostrar mensagem apropriada
    if (type === 'success') {
      successMessage.querySelector('div').innerHTML = `<i class="fas fa-check-circle mr-2"></i>${text}`;
      successMessage.classList.remove('hidden');
    } else {
      errorMessage.querySelector('div').innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i>${text}`;
      errorMessage.classList.remove('hidden');
    }
    
    formMessage.classList.remove('hidden');
    
    // Scroll para a mensagem
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function getServicoNome(value) {
    const servicos = {
      'forro-gesso': 'Forro de Gesso Acartonado',
      'paredes-drywall': 'Paredes de Drywall',
      'decoracoes': 'Decorações em Forros e Paredes',
      'forro-modular': 'Forro Modular',
      'pinturas': 'Pinturas',
      'steel-frame': 'Steel Frame',
      'outros': 'Outros serviços'
    };
    return servicos[value] || value;
  }

  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  telefoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length >= 7) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length >= 3) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    e.target.value = value;
  });
});
