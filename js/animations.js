/**
 * PD Gesso Drywall — ScrollTrigger premium
 * Elementos começam ocultos, surgem no scroll e revertem ao subir.
 */
(function () {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const EASE = 'power4.out';
  /** onEnter | onLeave | onEnterBack | onLeaveBack */
  const SCROLL_TOGGLE = 'play none none reverse';
  const DURATION = { heading: 0.85, card: 0.75, accent: 0.55, item: 0.65 };

  const HIDE_SELECTOR = [
    '.hero-animate',
    '.reveal-heading',
    '.reveal-subheading',
    '.reveal-accent',
    '.reveal-item',
    '.stat-item',
    '.video-showcase-card',
    '.video-showcase-tag',
    '.diferencial-card',
    '.location-card',
    '#servicos .scroll-card:not([data-carousel-clone])',
    '.service-feature-content',
    '.service-feature-image',
    '.service-feature figure',
    '.service-feature-list li',
    '#cta-comercial .cta-banner-actions > *',
    '#formulario-contato .form-grid-2 > div',
    '#contato-form > div:not(.form-grid-2):not(.text-center)',
    '#contato-form .text-center',
  ].join(', ');

  let motionScale = 1;

  const MOTION = {
    up: () => ({ y: 64 * motionScale, scale: 0.94 }),
    down: () => ({ y: -48 * motionScale, scale: 0.96 }),
    left: () => ({ x: -72 * motionScale, scale: 0.96 }),
    right: () => ({ x: 72 * motionScale, scale: 0.96 }),
  };

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function markReady() {
    document.documentElement.classList.add('anim-ready');
  }

  function clearStaleInlineStyles() {
    document.querySelectorAll(HIDE_SELECTOR).forEach((el) => {
      el.style.removeProperty('opacity');
      el.style.removeProperty('visibility');
      el.style.removeProperty('transform');
    });
  }

  function prepareHiddenState() {
    const elements = gsap.utils.toArray(HIDE_SELECTOR);
    if (!elements.length) return;
    gsap.set(elements, { autoAlpha: 0 });
  }

  function revealAll() {
    if (gsap) {
      gsap.killTweensOf(HIDE_SELECTOR);
      ScrollTrigger?.getAll().forEach((st) => st.kill());
      gsap.set(HIDE_SELECTOR, { autoAlpha: 1, clearProps: 'opacity,visibility,transform' });
    }
    clearStaleInlineStyles();
    markReady();
  }

  function setRevealing(elements, active) {
    gsap.utils.toArray(elements).forEach((el) => {
      el.classList.toggle('is-revealing', active);
    });
  }

  function revealAccent(timeline, accent, position) {
    if (!accent) return;
    gsap.set(accent, { scaleX: 0, autoAlpha: 0, transformOrigin: 'center center' });
    timeline.to(
      accent,
      {
        scaleX: 1,
        autoAlpha: 1,
        duration: DURATION.accent,
        ease: EASE,
        onStart: () => setRevealing(accent, true),
        onComplete: () => setRevealing(accent, false),
      },
      position
    );
  }

  function sectionHeaderTl(section, opts = {}) {
    const heading = section.querySelector('.reveal-heading');
    const subheading = section.querySelector('.reveal-subheading');
    const accent = section.querySelector('.reveal-accent');
    const start = opts.start || 'top 90%';
    const headingY = 48 * motionScale;

    if (heading) gsap.set(heading, { autoAlpha: 0, y: headingY });
    if (subheading) gsap.set(subheading, { autoAlpha: 0, y: 28 * motionScale });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: opts.trigger || section,
        start,
        toggleActions: SCROLL_TOGGLE,
      },
      defaults: { ease: EASE },
    });

    if (heading) {
      tl.to(heading, {
        autoAlpha: 1,
        y: 0,
        duration: DURATION.heading,
        onStart: () => setRevealing(heading, true),
        onComplete: () => setRevealing(heading, false),
      });
    }
    revealAccent(tl, accent, '-=0.4');
    if (subheading) {
      tl.to(
        subheading,
        {
          autoAlpha: 1,
          y: 0,
          duration: DURATION.item,
          onStart: () => setRevealing(subheading, true),
          onComplete: () => setRevealing(subheading, false),
        },
        '-=0.3'
      );
    }

    return tl;
  }

  function revealBatch(selector, opts = {}) {
    const elements = gsap.utils.toArray(selector);
    if (!elements.length) return;

    const fromMotion = opts.from || MOTION.up();
    const stagger = opts.stagger ?? 0.1;
    const start = opts.start || 'top 90%';
    const duration = opts.duration || DURATION.card;
    const onEnterExtra = opts.onEnter;
    const onLeaveExtra = opts.onLeaveBack;

    gsap.set(elements, { autoAlpha: 0, ...fromMotion });

    ScrollTrigger.batch(elements, {
      start,
      onEnter: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        if (onEnterExtra) onEnterExtra(batch);
      },
      onLeaveBack: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          autoAlpha: 0,
          ...fromMotion,
          duration: duration * 0.75,
          stagger: { each: stagger * 0.6, from: 'end' },
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        if (onLeaveExtra) onLeaveExtra(batch);
      },
    });
  }

  function revealOnScroll(targets, fromVars, toVars, triggerEl, start) {
    const list = gsap.utils.toArray(targets);
    if (!list.length) return;

    gsap.set(list, fromVars);

    gsap.fromTo(list, fromVars, {
      ...toVars,
      ease: EASE,
      immediateRender: false,
      scrollTrigger: {
        trigger: triggerEl,
        start: start || 'top 90%',
        toggleActions: SCROLL_TOGGLE,
      },
      onStart: () => setRevealing(list, true),
      onComplete: () => setRevealing(list, false),
      onReverseComplete: () => setRevealing(list, false),
    });
  }

  function initHeroEntrance() {
    const targets = gsap.utils.toArray('.hero-animate');
    if (!targets.length) return;

    gsap.set(targets, { autoAlpha: 0, y: 48 });

    gsap.to(targets, {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.14,
      ease: EASE,
      onStart: () => setRevealing(targets, true),
      onComplete: () => setRevealing(targets, false),
    });
  }

  function initHeroParallax() {
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    gsap.fromTo(
      heroContent,
      { y: 0 },
      {
        y: 40,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      }
    );
  }

  function initStats() {
    const statsBar = document.getElementById('stats-bar');
    if (!statsBar) return;

    const items = gsap.utils.toArray('#stats-bar .stat-item');
    if (!items.length) return;

    let statsTriggered = false;

    const fromMotion = { autoAlpha: 0, y: 56 * motionScale, scale: 0.9 };
    gsap.set(items, fromMotion);

    ScrollTrigger.batch(items, {
      start: 'top 92%',
      onEnter: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: DURATION.card,
          stagger: 0.1,
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        if (!statsTriggered) {
          statsTriggered = true;
          document.dispatchEvent(new CustomEvent('stats:reveal'));
        }
      },
      onLeaveBack: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          ...fromMotion,
          duration: DURATION.card * 0.75,
          stagger: { each: 0.06, from: 'end' },
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
      },
    });
  }

  function initSobre() {
    const section = document.getElementById('sobre');
    if (!section) return;

    sectionHeaderTl(section);

    const items = section.querySelectorAll('.historia-content .reveal-item');
    const text = items[0];
    const image = items[1];

    if (text) {
      revealOnScroll(
        text,
        { autoAlpha: 0, x: -80 * motionScale, scale: 0.96 },
        { autoAlpha: 1, x: 0, scale: 1, duration: DURATION.heading },
        section,
        'top 88%'
      );
    }
    if (image) {
      revealOnScroll(
        image,
        { autoAlpha: 0, x: 80 * motionScale, scale: 0.94 },
        { autoAlpha: 1, x: 0, scale: 1, duration: DURATION.heading },
        section,
        'top 88%'
      );
    }
  }

  function initServiceFeatures() {
    gsap.utils.toArray('.service-feature.reveal-section').forEach((section, index) => {
      const image = section.querySelector('.service-feature-image, figure');
      const content = section.querySelector('.service-feature-content');
      const listItems = section.querySelectorAll('.service-feature-list li');
      const fromX = (index % 2 === 0 ? -80 : 80) * motionScale;

      if (content) gsap.set(content, { autoAlpha: 0, x: fromX });
      if (image) gsap.set(image, { autoAlpha: 0, x: -fromX, scale: 0.94 });
      if (listItems.length) gsap.set(listItems, { autoAlpha: 0, x: 20 * motionScale });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          toggleActions: SCROLL_TOGGLE,
        },
        defaults: { ease: EASE },
      });

      if (content) {
        tl.to(content, {
          autoAlpha: 1,
          x: 0,
          duration: DURATION.heading,
          onStart: () => setRevealing(content, true),
          onComplete: () => setRevealing(content, false),
        });
      }
      if (image) {
        tl.to(
          image,
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: DURATION.heading,
            onStart: () => setRevealing(image, true),
            onComplete: () => setRevealing(image, false),
          },
          '-=0.5'
        );
      }
      if (listItems.length) {
        tl.to(
          listItems,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: EASE,
          },
          '-=0.35'
        );
      }

      if (image && window.matchMedia('(min-width: 768px)').matches) {
        gsap.fromTo(
          image,
          { y: 0 },
          {
            y: 30,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          }
        );
      }
    });
  }

  function initVideoShowcase() {
    const section = document.getElementById('obras-em-video');
    if (!section) return;

    sectionHeaderTl(section, { start: 'top 90%' });

    section.querySelectorAll('.video-showcase-card').forEach((card) => {
      const tag = card.querySelector('.video-showcase-tag');
      if (!tag) return;

      gsap.set(tag, { autoAlpha: 0, y: 20 * motionScale });

      ScrollTrigger.create({
        trigger: card,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(tag, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE, overwrite: 'auto' });
        },
        onLeaveBack: () => {
          gsap.to(tag, { autoAlpha: 0, y: 20 * motionScale, duration: 0.35, ease: EASE, overwrite: 'auto' });
        },
      });
    });

    revealBatch('.video-showcase-card', {
      start: 'top 90%',
      from: { y: 72 * motionScale, scale: 0.92 },
      stagger: 0.12,
    });
  }

  function initServicos() {
    const section = document.getElementById('servicos');
    if (!section) return;

    sectionHeaderTl(section);

    const wrapper = section.querySelector('.carousel-wrapper');
    if (wrapper) {
      revealOnScroll(
        wrapper,
        { autoAlpha: 0, y: 48 * motionScale, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.heading },
        section,
        'top 90%'
      );
    }

    revealBatch('#servicos .scroll-card:not([data-carousel-clone])', {
      start: 'top 92%',
      from: { y: 56 * motionScale, scale: 0.93 },
      stagger: 0.08,
      duration: 0.7,
    });

    const cta = section.querySelector('.servicos-cta');
    if (cta) {
      revealOnScroll(
        cta,
        { autoAlpha: 0, y: 40 * motionScale },
        { autoAlpha: 1, y: 0, duration: DURATION.card },
        section,
        'top 88%'
      );
    }
  }

  function initFilosofia() {
    const section = document.getElementById('filosofia');
    if (!section) return;

    sectionHeaderTl(section);

    const banner = section.querySelector('.filosofia-banner');
    if (banner) {
      revealOnScroll(
        banner,
        { autoAlpha: 0, y: 32 * motionScale, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.heading },
        section,
        'top 90%'
      );
    }

    const cards = gsap.utils.toArray('#filosofia .reveal-item');
    if (!cards.length) return;

    const fromMotion = { autoAlpha: 0, y: 64 * motionScale, scale: 0.94 };
    gsap.set(cards, fromMotion);

    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      onEnter: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: DURATION.card,
          stagger: 0.14,
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        batch.forEach((card) => {
          const icon = card.querySelector('.bg-orange-100');
          if (icon) {
            gsap.fromTo(
              icon,
              { scale: 0.5, autoAlpha: 0 },
              { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.7)', delay: 0.15, overwrite: 'auto' }
            );
          }
        });
      },
      onLeaveBack: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          ...fromMotion,
          duration: DURATION.card * 0.75,
          stagger: { each: 0.08, from: 'end' },
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        batch.forEach((card) => {
          const icon = card.querySelector('.bg-orange-100');
          if (icon) {
            gsap.to(icon, { scale: 0.5, autoAlpha: 0, duration: 0.35, ease: EASE, overwrite: 'auto' });
          }
        });
      },
    });
  }

  function initLocalizacao() {
    const section = document.getElementById('localizacao');
    if (!section) return;

    sectionHeaderTl(section);

    revealBatch('#localizacao .location-card', {
      start: 'top 90%',
      from: { x: -60 * motionScale, scale: 0.96 },
      stagger: 0.12,
    });

    const map = section.querySelector('.map-wrapper');
    if (map) {
      revealOnScroll(
        map,
        { autoAlpha: 0, x: 60 * motionScale, scale: 0.97 },
        { autoAlpha: 1, x: 0, scale: 1, duration: DURATION.heading },
        section,
        'top 90%'
      );
    }
  }

  function initDiferenciais() {
    const section = document.getElementById('diferenciais');
    if (!section) return;

    sectionHeaderTl(section, { start: 'top 88%' });

    const cards = gsap.utils.toArray('#diferenciais .diferencial-card');
    if (!cards.length) return;

    const fromMotion = { autoAlpha: 0, y: 72 * motionScale, scale: 0.9 };
    gsap.set(cards, fromMotion);

    ScrollTrigger.batch(cards, {
      start: 'top 90%',
      onEnter: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: DURATION.card,
          stagger: 0.1,
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        batch.forEach((card) => {
          const icon = card.querySelector('.diferencial-icon');
          if (icon) {
            gsap.fromTo(
              icon,
              { scale: 0.6, rotation: -12, autoAlpha: 0 },
              { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.12, overwrite: 'auto' }
            );
          }
        });
      },
      onLeaveBack: (batch) => {
        setRevealing(batch, true);
        gsap.to(batch, {
          ...fromMotion,
          duration: DURATION.card * 0.75,
          stagger: { each: 0.06, from: 'end' },
          ease: EASE,
          overwrite: 'auto',
          onComplete: () => setRevealing(batch, false),
        });
        batch.forEach((card) => {
          const icon = card.querySelector('.diferencial-icon');
          if (icon) {
            gsap.to(icon, {
              scale: 0.6,
              rotation: -12,
              autoAlpha: 0,
              duration: 0.35,
              ease: EASE,
              overwrite: 'auto',
            });
          }
        });
      },
    });
  }

  function initDiferenciaisHover() {
    gsap.utils.toArray('#diferenciais .diferencial-card').forEach((card) => {
      const icon = card.querySelector('.diferencial-icon');
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.02, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        if (icon) gsap.to(icon, { scale: 1.1, rotation: 6, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        if (icon) gsap.to(icon, { scale: 1, rotation: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  function initAvaliacoes() {
    const section = document.getElementById('avaliacoes');
    if (!section) return;

    sectionHeaderTl(section);

    const widget = section.querySelector('.reveal-item');
    if (widget) {
      revealOnScroll(
        widget,
        { autoAlpha: 0, y: 40 * motionScale, scale: 0.95 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.heading },
        section,
        'top 90%'
      );
    }
  }

  function initCtaComercial() {
    const section = document.getElementById('cta-comercial');
    if (!section) return;

    const heading = section.querySelector('.reveal-heading, h2');
    const subheading = section.querySelector('.reveal-subheading, p');
    const actions = section.querySelectorAll('.cta-banner-actions > *');

    if (heading) gsap.set(heading, { autoAlpha: 0, y: 48 * motionScale });
    if (subheading) gsap.set(subheading, { autoAlpha: 0, y: 32 * motionScale });
    if (actions.length) gsap.set(actions, { autoAlpha: 0, y: 32 * motionScale, scale: 0.95 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 90%',
        toggleActions: SCROLL_TOGGLE,
      },
      defaults: { ease: EASE },
    });

    if (heading) {
      tl.to(heading, { autoAlpha: 1, y: 0, duration: DURATION.heading });
    }
    if (subheading) {
      tl.to(subheading, { autoAlpha: 1, y: 0, duration: DURATION.item }, '-=0.4');
    }
    if (actions.length) {
      tl.to(
        actions,
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.card, stagger: 0.12 },
        '-=0.25'
      );
    }
  }

  function initFormulario() {
    const section = document.getElementById('formulario-contato');
    if (!section) return;

    sectionHeaderTl(section);

    const formBlocks = section.querySelectorAll('.form-grid-2 > div, #contato-form > div:not(.form-grid-2):not(.text-center)');
    if (formBlocks.length) {
      revealOnScroll(
        formBlocks,
        { autoAlpha: 0, y: 36 * motionScale },
        { autoAlpha: 1, y: 0, duration: DURATION.item, stagger: 0.08 },
        section,
        'top 90%'
      );
    }

    const submitBtn = section.querySelector('#contato-form .text-center');
    if (submitBtn) {
      revealOnScroll(
        submitBtn,
        { autoAlpha: 0, y: 28 * motionScale, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: DURATION.card },
        section,
        'top 88%'
      );
    }
  }

  function initFooterContato() {
    const section = document.getElementById('contato');
    if (!section) return;

    sectionHeaderTl(section);

    revealBatch('#contato .reveal-item', {
      start: 'top 92%',
      from: { y: 48 * motionScale, scale: 0.95 },
      stagger: 0.12,
    });
  }

  function initScrollAnimations() {
    ScrollTrigger.config({ limitCallbacks: true });

    initStats();
    initSobre();
    initServiceFeatures();
    initVideoShowcase();
    initServicos();
    initFilosofia();
    initLocalizacao();
    initDiferenciais();
    initDiferenciaisHover();
    initAvaliacoes();
    initCtaComercial();
    initFormulario();
    initFooterContato();
    initHeroParallax();

    let refreshTimer;
    window.addEventListener(
      'load',
      () => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
      },
      { once: true }
    );
  }

  function init() {
    if (!gsap || !ScrollTrigger) {
      markReady();
      return;
    }

    try {
      gsap.registerPlugin(ScrollTrigger);

      if (prefersReducedMotion()) {
        markReady();
        return;
      }

      const mm = gsap.matchMedia();
      mm.add('(max-width: 767px)', () => {
        motionScale = 0.6;
      });
      mm.add('(min-width: 768px)', () => {
        motionScale = 1;
      });

      prepareHiddenState();
      initHeroEntrance();
      initScrollAnimations();
      markReady();
    } catch (error) {
      console.error('Animações desativadas:', error);
      revealAll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
