/**
 * FAQ Accordion Script
 * Gerencia a funcionalidade de abrir/fechar itens de FAQ
 */

document.addEventListener('DOMContentLoaded', () => {
    // Selecionar todos os botões de toggle do FAQ
    const faqToggles = document.querySelectorAll('.faq-toggle');

    faqToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            // Obter o item pai (faq-item)
            const faqItem = toggle.closest('.faq-item');
            const faqContent = faqItem.querySelector('.faq-content');
            const chevronIcon = toggle.querySelector('i');

            // Fechar todos os outros itens
            document.querySelectorAll('.faq-item').forEach((item) => {
                if (item !== faqItem) {
                    const content = item.querySelector('.faq-content');
                    const icon = item.querySelector('i');
                    content.classList.add('hidden');
                    icon.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle do item atual
            faqContent.classList.toggle('hidden');

            // Animar o ícone
            if (faqContent.classList.contains('hidden')) {
                chevronIcon.style.transform = 'rotate(0deg)';
            } else {
                chevronIcon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Adicionar transição suave ao ícone
    const style = document.createElement('style');
    style.textContent = `
        .faq-toggle i {
            transition: transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});
