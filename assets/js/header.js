/* COMPONENTE: header.js
    Versão: 5.1 (Zero Inline - Integridade Total)
    Contém: Gerenciamento de acessibilidade (fonte), temas, busca, mega-menus e menu mobile.
*/

// --- Variáveis Globais de Estado ---
let currentZoom = 100;

/**
 * Altera o tamanho da fonte do documento e salva no localStorage
 * @param {string} action - 'increase' ou 'decrease'
 */
function changeFontSize(action) {
    if (action === 'increase' && currentZoom < 150) currentZoom += 10;
    else if (action === 'decrease' && currentZoom > 90) currentZoom -= 10;
    
    document.documentElement.style.fontSize = currentZoom + '%';
    localStorage.setItem('user-font-size', currentZoom);
}

/**
 * Alterna entre o tema claro e escuro e salva a preferência
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
 * Inicializa todos os ouvintes de eventos do Header
 */
function initHeaderEvents() {
    // 1. Controles de Acessibilidade e Tema
    const btnDecrease = document.getElementById('font-decrease');
    const btnIncrease = document.getElementById('font-increase');
    const btnTheme = document.getElementById('theme-toggle');

    if (btnDecrease) btnDecrease.addEventListener('click', () => changeFontSize('decrease'));
    if (btnIncrease) btnIncrease.addEventListener('click', () => changeFontSize('increase'));
    if (btnTheme) btnTheme.addEventListener('click', toggleTheme);

    // 2. Gerenciamento de Mega Menus Desktop
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
                
                // Foco automático no input de busca se o painel de busca for aberto
                if (panelId === 'panel-busca') {
                    const searchInput = document.getElementById('panel-busca-input');
                    if (searchInput) setTimeout(() => searchInput.focus(), 100);
                }
            }
        });
    });

    // 3. Abas Laterais (Tabs) dentro dos Mega Painéis
    document.querySelectorAll('.menu-tab-trigger').forEach(trigger => {
        // Ativação por hover (mouseenter)
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
        
        // Ativação por teclado (Acessibilidade)
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.dispatchEvent(new Event('mouseenter'));
            }
        });
    });

    // 4. Menu Mobile (Hamburguer)
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
        setTimeout(() => {
            if (mobileMenu) mobileMenu.classList.add('hidden');
        }, 300);
    };

    if (closeMobile) closeMobile.addEventListener('click', closeHandler);
    if (backdrop) backdrop.addEventListener('click', closeHandler);

    // Accordion Mobile
    document.querySelectorAll('.mobile-accordion-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');
            const isActive = this.classList.contains('active');

            // Toggle atual
            if (isActive) {
                this.classList.remove('active');
                content.style.maxHeight = null;
                if (icon) icon.classList.remove('rotate-180');
            } else {
                this.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
                if (icon) icon.classList.add('rotate-180');
            }
        });
    });

    // 5. Fechar painéis ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mega-panel') && !e.target.closest('.nav-trigger')) {
            closeAllPanels();
        }
    });

    // 6. Fechar com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllPanels();
            closeHandler();
        }
    });
}

/**
 * Carrega preferências do usuário e inicializa eventos
 */
(function loadPrefsAndInit() {
    // Restaurar Tamanho da Fonte
    const savedZoom = localStorage.getItem('user-font-size');
    if (savedZoom) {
        currentZoom = parseInt(savedZoom);
        document.documentElement.style.fontSize = currentZoom + '%';
    }
    
    // Restaurar Tema
    if (localStorage.getItem('dark-theme') === 'true') {
        document.body.classList.add('dark-theme');
        // Ícone será ajustado pelo toggleTheme ou lógica de init
    }

    // Inicialização segura
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHeaderEvents();
    } else {
        window.addEventListener('DOMContentLoaded', initHeaderEvents);
    }
})();