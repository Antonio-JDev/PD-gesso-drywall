// Script para possíveis interações futuras
document.addEventListener('DOMContentLoaded', () => {
    console.log('Site PG Gesso Drywall carregado com sucesso!');
  });

  document.getElementById('menu-toggle').addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
  });

  const carousel = document.getElementById('carousel');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const indicatorsContainer = document.getElementById('indicators');
  const scrollAmount = 300;

  let autoplayInterval;
  let cardCount = carousel.children.length;
  let visibleCards = Math.floor(carousel.offsetWidth / scrollAmount);
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
      left: index * scrollAmount,
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