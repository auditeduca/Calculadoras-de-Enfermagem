/**
 * CORE HEADER ENGINE - V3 (Ajustada)
 */

document.addEventListener('DOMContentLoaded', () => {
    initAllHeaderFunctions();
});

// Garante funcionamento com Template Engine
window.addEventListener('TemplateEngine:Ready', () => {
    initAllHeaderFunctions();
});

function initAllHeaderFunctions() {
    const navTriggers = document.querySelectorAll('.nav-trigger[data-panel]');
    const megaPanels = document.querySelectorAll('.mega-panel');
    const mobileMenu = document.getElementById('mobile-menu'); // Certifique-se que o ID no HTML coincide
    const btnOpen = document.getElementById('mobile-menu-open');

    // 1. MEGA MENUS (DESKTOP)
    function closePanels() {
        megaPanels.forEach(p => p.classList.add('hidden'));
        navTriggers.forEach(t => t.classList.remove('active-nav'));
    }

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const panelId = trigger.getAttribute('data-panel');
            const target = document.getElementById(panelId);
            
            if (target.classList.contains('hidden')) {
                closePanels();
                target.classList.remove('hidden');
                trigger.classList.add('active-nav');
            } else {
                closePanels();
            }
        });
    });

    // 2. MENU MOBILE
    if (btnOpen && mobileMenu) {
        btnOpen.onclick = () => mobileMenu.classList.toggle('hidden');
    }

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-trigger') && !e.target.closest('.mega-panel')) {
            closePanels();
        }
    });
}

// 3. ACESSIBILIDADE: CONTROLE DE FONTE
window.changeFontSize = function(action) {
    const html = document.documentElement;
    const currentSize = parseFloat(window.getComputedStyle(html).fontSize);
    let newSize = action === 'increase' ? currentSize + 2 : currentSize - 2;
    
    if (newSize >= 12 && newSize <= 24) {
        html.style.fontSize = newSize + 'px';
    }
};

// [Lógica de Busca performSearch() mantida sem alterações abaixo...]