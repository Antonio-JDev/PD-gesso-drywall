document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('carousel');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const indicatorsContainer = document.getElementById('indicators');

  if (carousel && nextBtn && prevBtn && indicatorsContainer) {
    const originals = [...carousel.querySelectorAll('.card-service')];
    const total = originals.length;

    if (total > 0) {
      const startFragment = document.createDocumentFragment();
      originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.carouselClone = 'start';
        clone.classList.remove('is-active');
        clone.setAttribute('aria-hidden', 'true');
        startFragment.appendChild(clone);
      });
      carousel.insertBefore(startFragment, carousel.firstChild);

      originals.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.carouselClone = 'end';
        clone.classList.remove('is-active');
        clone.setAttribute('aria-hidden', 'true');
        carousel.appendChild(clone);
      });

      let cards = [...carousel.querySelectorAll('.card-service')];
      let autoplayInterval;
      let currentPhysicalIndex = total;
      let isAnimating = false;
      let scrollEndTimer;

      function getLogicalIndex(physicalIndex) {
        return ((physicalIndex - total) % total + total) % total;
      }

      function getPhysicalIndexFromScroll() {
        const carouselCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
        let closest = 0;
        let minDist = Infinity;

        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(carouselCenter - cardCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });

        return closest;
      }

      function scrollToPhysicalIndex(index, smooth = true) {
        const card = cards[index];
        if (!card) return;

        const left = card.offsetLeft - (carousel.offsetWidth - card.offsetWidth) / 2;
        isAnimating = smooth;

        carousel.scrollTo({
          left: Math.max(0, left),
          behavior: smooth ? 'smooth' : 'auto'
        });

        currentPhysicalIndex = index;
        updateActiveCard();

        if (smooth) {
          window.clearTimeout(scrollEndTimer);
          scrollEndTimer = window.setTimeout(() => {
            isAnimating = false;
            normalizeInfinitePosition();
          }, 520);
        }
      }

      function normalizeInfinitePosition() {
        if (currentPhysicalIndex >= total * 2) {
          currentPhysicalIndex -= total;
          scrollToPhysicalIndex(currentPhysicalIndex, false);
        } else if (currentPhysicalIndex < total) {
          currentPhysicalIndex += total;
          scrollToPhysicalIndex(currentPhysicalIndex, false);
        }
        updateActiveCard();
      }

      function updateActiveCard() {
        cards.forEach((card, i) => {
          card.classList.toggle('is-active', i === currentPhysicalIndex);
        });

        const logicalIndex = getLogicalIndex(currentPhysicalIndex);
        const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === logicalIndex);
          dot.setAttribute('aria-current', i === logicalIndex ? 'true' : 'false');
        });
      }

      function createIndicators() {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < total; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
          dot.setAttribute('aria-label', `Ir para o serviço ${i + 1}`);
          dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
          dot.addEventListener('click', () => {
            stopAutoplay();
            scrollToPhysicalIndex(total + i, true);
            startAutoplay();
          });
          indicatorsContainer.appendChild(dot);
        }
      }

      function scrollNext() {
        scrollToPhysicalIndex(currentPhysicalIndex + 1, true);
      }

      function scrollPrev() {
        scrollToPhysicalIndex(currentPhysicalIndex - 1, true);
      }

      function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(scrollNext, 4000);
      }

      function stopAutoplay() {
        clearInterval(autoplayInterval);
      }

      function onScrollEnd() {
        if (isAnimating) return;

        const index = getPhysicalIndexFromScroll();
        if (index !== currentPhysicalIndex) {
          currentPhysicalIndex = index;
          updateActiveCard();
        }
        normalizeInfinitePosition();
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

      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);
      carousel.addEventListener('focusin', stopAutoplay);
      carousel.addEventListener('focusout', startAutoplay);

      let scrollTicking = false;

      carousel.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        window.requestAnimationFrame(() => {
          scrollTicking = false;
          onScrollEnd();
        });
      }, { passive: true });

      let resizeTimer;
      window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          scrollToPhysicalIndex(currentPhysicalIndex, false);
        }, 150);
      });

      createIndicators();
      scrollToPhysicalIndex(total, false);
      updateActiveCard();
      startAutoplay();
    }
  }

  // Formulário de contato
  const form = document.getElementById('contato-form');
  const formMessage = document.getElementById('form-message');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  if (form && formMessage && successMessage && errorMessage) {
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
      const mailtoLink = `mailto:wallacepolidias@gmail.com?subject=Nova Solicitação de Orçamento - ${dados.nome}&body=${encodeURIComponent(emailBody)}`;
      
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
      successMessage.innerHTML = `<i class="fas fa-check-circle mr-2" aria-hidden="true"></i>${text}`;
      successMessage.classList.remove('hidden');
    } else {
      errorMessage.innerHTML = `<i class="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>${text}`;
      errorMessage.classList.remove('hidden');
    }
    
    formMessage.classList.remove('hidden');
    
    // Scroll para a mensagem
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function getServicoNome(value) {
    const servicos = {
      'galpoes-industriais': 'Construção de Galpões Industriais',
      'edificios-comerciais': 'Sistemas de Gesso para Edifícios Comerciais',
      'isolamento-acustico': 'Isolamento Acústico Corporativo',
      'steel-frame': 'Steel Frame Estrutural',
      'forro-modular': 'Forro Modular Corporativo',
      'outros': 'Outro serviço de empreiteira'
    };
    return servicos[value] || value;
  }
  }

  // Máscara para telefone
  const telefoneInput = document.getElementById('telefone');
  if (telefoneInput) {
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
  }

  const toggleButton = document.getElementById('mobile-menu-toggle');
  const closeButton = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = mobileMenu?.querySelector('[data-overlay]');
  const mobileNavLinks = mobileMenu?.querySelectorAll('.mobile-nav-link');

  if (toggleButton && closeButton && mobileMenu && overlay) {

  function openMenu() {
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    toggleButton.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    toggleButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => mobileMenu.classList.add('hidden'), 300);
  }

  toggleButton.addEventListener('click', openMenu);
  closeButton.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  mobileNavLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });
  }

  // Contadores animados na barra de estatísticas
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    const statItems = statsBar.querySelectorAll('.stat-item');
    const counters = statsBar.querySelectorAll('.stat-number[data-count]');

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function runCounter(el, delay = 0) {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const duration = target >= 100 ? 2200 : 1600;

      setTimeout(() => {
        el.classList.add('is-counting');
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const value = easeOutExpo(progress) * target;
          el.textContent = decimals > 0
            ? value.toFixed(decimals) + suffix
            : Math.floor(value) + suffix;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = decimals > 0
              ? target.toFixed(decimals) + suffix
              : Math.floor(target) + suffix;
            el.classList.remove('is-counting');
            el.classList.add('count-done');
          }
        }

        requestAnimationFrame(tick);
      }, delay);
    }

    function setFinalValues() {
      statItems.forEach((item) => item.classList.add('is-visible'));
      counters.forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        el.textContent = decimals > 0
          ? target.toFixed(decimals) + suffix
          : Math.floor(target) + suffix;
      });
    }

    function animateStats() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setFinalValues();
        return;
      }
      statItems.forEach((item) => item.classList.add('is-visible'));
      counters.forEach((el, i) => runCounter(el, i * 120));
    }

    function triggerStatsOnce() {
      if (statsBar.dataset.statsDone) return;
      statsBar.dataset.statsDone = 'true';
      animateStats();
    }

    document.addEventListener('stats:reveal', triggerStatsOnce, { once: true });

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerStatsOnce();
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px 0px -40px 0px' }
    );

    statsObserver.observe(statsBar);
  }

  // Vídeos otimizados — hero background + showcase lazy
  initOptimizedVideos();

  // Portfólio — filtros e lightbox
  initPortfolio();
});

function initOptimizedVideos() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = connection?.saveData;
  const slowConnection = connection && ['slow-2g', '2g'].includes(connection.effectiveType);
  const skipHeavyVideo = prefersReducedMotion || saveData || slowConnection;

  const heroVideo = document.getElementById('hero-video');
  if (heroVideo && !skipHeavyVideo) {
    const heroSrc = heroVideo.dataset.heroSrc;
    if (heroSrc) {
      const loadHero = () => {
        if (heroVideo.dataset.loaded) return;
        heroVideo.dataset.loaded = 'true';
        heroVideo.src = heroSrc;
        heroVideo.load();
        heroVideo.play().catch(() => {});
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadHero, { timeout: 1200 });
      } else {
        setTimeout(loadHero, 300);
      }

      document.addEventListener('visibilitychange', () => {
        if (!heroVideo.dataset.loaded) return;
        if (document.hidden) {
          heroVideo.pause();
        } else {
          heroVideo.play().catch(() => {});
        }
      });
    }
  }

  const showcaseCards = document.querySelectorAll('.video-showcase-card');
  if (showcaseCards.length) {
    initShowcaseVideos(showcaseCards, { skipHeavyVideo });
  }
}

function initShowcaseVideos(cards, { skipHeavyVideo }) {
  let currentlyPlaying = null;

  function pauseCard(card) {
    const video = card.querySelector('.video-showcase-player');
    const media = card.querySelector('.video-showcase-media');
    const playBtn = card.querySelector('.video-showcase-play');
    const playIcon = playBtn?.querySelector('i');
    if (!video || !media) return;

    video.pause();
    media.classList.remove('is-playing');
    if (playIcon) playIcon.className = 'fas fa-play';
    playBtn?.setAttribute('aria-label', playBtn.dataset.labelPlay || 'Reproduzir vídeo da obra');
    if (currentlyPlaying === video) currentlyPlaying = null;
  }

  cards.forEach((card) => {
    const video = card.querySelector('.video-showcase-player');
    const media = card.querySelector('.video-showcase-media');
    const playBtn = card.querySelector('.video-showcase-play');
    const playIcon = playBtn?.querySelector('i');
    if (!video || !media) return;

    const labelPlay = playBtn?.getAttribute('aria-label') || 'Reproduzir vídeo da obra';
    if (playBtn) {
      playBtn.dataset.labelPlay = labelPlay;
      playBtn.dataset.labelPause = 'Pausar vídeo da obra';
    }

    function loadVideo() {
      if (video.dataset.loaded) return;
      const src = video.dataset.lazySrc;
      if (!src) return;
      video.dataset.loaded = 'true';
      video.src = src;
      video.load();
    }

    function playCard() {
      cards.forEach((otherCard) => {
        if (otherCard !== card) pauseCard(otherCard);
      });

      loadVideo();
      video.play().then(() => {
        media.classList.add('is-playing');
        if (playIcon) playIcon.className = 'fas fa-pause';
        playBtn?.setAttribute('aria-label', playBtn.dataset.labelPause || 'Pausar vídeo da obra');
        currentlyPlaying = video;
      }).catch(() => {});
    }

    playBtn?.addEventListener('click', () => {
      if (video.paused) {
        playCard();
      } else {
        pauseCard(card);
      }
    });

    video.addEventListener('click', () => {
      if (video.paused) {
        playCard();
      } else {
        pauseCard(card);
      }
    });

    if ('IntersectionObserver' in window) {
      const showcaseObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              if (!video.paused) pauseCard(card);
              return;
            }
            loadVideo();
          });
        },
        { threshold: 0.15, rootMargin: '80px 0px' }
      );
      showcaseObserver.observe(card);
    }
  });
}

function initPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const filterBtns = document.querySelectorAll('.portfolio-filter');
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = lightbox?.querySelector('.portfolio-lightbox-img');
  const lightboxClose = lightbox?.querySelector('.portfolio-lightbox-close');

  if (!grid) return;

  grid.querySelectorAll('.portfolio-card-media').forEach((media) => {
    const caption = media.closest('.portfolio-card-figure')?.querySelector('.portfolio-card-caption')?.textContent?.trim();
    media.setAttribute('tabindex', '0');
    media.setAttribute('role', 'button');
    media.setAttribute('aria-label', caption ? `Ampliar: ${caption}` : 'Ampliar imagem da obra');
  });

  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        grid.querySelectorAll('.portfolio-card').forEach((card) => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('is-hidden', !match);
          card.hidden = !match;
        });
      });
    });
  }

  if (!lightbox || !lightboxImg) return;

  const openLightbox = (img) => {
    if (!img?.src) return;
    const fullSrc = img.currentSrc || img.src;
    lightboxImg.src = fullSrc;
    lightboxImg.alt = img.alt || 'Obra ampliada — PD Gesso Drywall';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('portfolio-lightbox-open');
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.removeAttribute('src');
    lightboxImg.alt = '';
    document.body.classList.remove('portfolio-lightbox-open');
  };

  grid.addEventListener('click', (e) => {
    const expandBtn = e.target.closest('.portfolio-expand-btn');
    const media = e.target.closest('.portfolio-card-media');
    if (!media || media.closest('.portfolio-card')?.classList.contains('is-hidden')) return;

    if (expandBtn) {
      e.preventDefault();
      e.stopPropagation();
    }

    const img = media.querySelector('img');
    if (img) openLightbox(img);
  });

  grid.addEventListener('keydown', (e) => {
    const media = e.target.closest('.portfolio-card-media');
    if (!media) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const img = media.querySelector('img');
      if (img) openLightbox(img);
    }
  });

  lightboxClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}