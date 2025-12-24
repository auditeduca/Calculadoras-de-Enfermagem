/* COMPONENTE: header.js
    Limpado de eventos inline (onclick).
    Contém: Gerenciamento de abas, temas, busca e menu mobile.
*/

// --- Variáveis Globais de Estado ---
let currentZoom = 100;

/**
 * Altera o tamanho da fonte do documento
 * @param {string} action - 'increase' ou 'decrease'
 */
function changeFontSize(action) {
    if (action === 'increase' && currentZoom < 150) currentZoom += 10;
    else if (action === 'decrease' && currentZoom > 90) currentZoom -= 10;
    
    document.documentElement.style.fontSize = currentZoom + '%';
    localStorage.setItem('user-font-size', currentZoom);
}

/**
 * Alterna entre o tema claro e escuro
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('dark-theme', isDark);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/**
 * Inicializa todos os eventos do Header
 */
function initHeaderEvents() {
    // 1. Controles da Barra Superior (Removido inline onclick)
    const btnDecrease = document.getElementById('font-decrease');
    const btnIncrease = document.getElementById('font-increase');
    const btnTheme = document.getElementById('theme-toggle');

    if (btnDecrease) btnDecrease.addEventListener('click', () => changeFontSize('decrease'));
    if (btnIncrease) btnIncrease.addEventListener('click', () => changeFontSize('increase'));
    if (btnTheme) btnTheme.addEventListener('click', toggleTheme);

    // 2. Mega Menus Desktop
    const navTriggers = document.querySelectorAll('.nav-trigger');
    const panels = document.querySelectorAll('.mega-panel');
    let activePanel = null;

    function closeAllPanels() {
        panels.forEach(p => p.classList.remove('active'));
        navTriggers.forEach(t => t.classList.remove('active-nav'));
        activePanel = null;
    }

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const panelId = trigger.dataset.panel;
            if (!panelId) return;
            
            const targetPanel = document.getElementById(panelId);

            if (activePanel === targetPanel) {
                closeAllPanels();
            } else {
                closeAllPanels();
                targetPanel.classList.add('active');
                trigger.classList.add('active-nav');
                activePanel = targetPanel;
            }
        });
    });

    // 3. Abas Laterais dos Mega Painéis
    document.querySelectorAll('.menu-tab-trigger').forEach(trigger => {
        trigger.addEventListener('mouseenter', () => {
            const parent = trigger.closest('.mega-panel');
            const targetId = trigger.dataset.target;
            
            if (!parent || !targetId) return;

            parent.querySelectorAll('.menu-tab-trigger').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            trigger.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // 4. Menu Mobile
    const mobileBtn = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobile = document.getElementById('close-mobile-menu');
    const backdrop = document.getElementById('mobile-menu-backdrop');
    const drawer = document.getElementById('mobile-menu-drawer');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
            setTimeout(() => {
                if (backdrop) backdrop.classList.remove('opacity-0');
                if (drawer) drawer.classList.remove('-translate-x-full');
            }, 10);
        });
    }

    const closeHandler = () => {
        if (backdrop) backdrop.classList.add('opacity-0');
        if (drawer) drawer.classList.add('-translate-x-full');
        setTimeout(() => mobileMenu.classList.add('hidden'), 300);
    };

    if (closeMobile) closeMobile.addEventListener('click', closeHandler);
    if (backdrop) backdrop.addEventListener('click', closeHandler);

    // 5. Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger')) {
            closeAllPanels();
        }
    });

    // 6. Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllPanels();
    });
}

// Carregar preferências e inicializar
(function loadPrefsAndInit() {
    const savedZoom = localStorage.getItem('user-font-size');
    if (savedZoom) {
        currentZoom = parseInt(savedZoom);
        document.documentElement.style.fontSize = currentZoom + '%';
    }
    
    if (localStorage.getItem('dark-theme') === 'true') {
        document.body.classList.add('dark-theme');
    }

    // Se o DOM já estiver carregado (para casos de injeção dinâmica)
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHeaderEvents();
    } else {
        window.addEventListener('DOMContentLoaded', initHeaderEvents);
    }
})();