/**
 * HEADER.JS - Gerenciador do Header
 * Calculadoras de Enfermagem
 * 
 * Baseado no código de referência funcional
 * Integra correções do sistema atual
 */

class HeaderManager {
    constructor() {
        this.currentFontSize = 100; // Porcentagem (100%)
        this.initialized = false;
        
        console.log('HeaderManager: Script carregado.');
        this.attemptInitialization();
    }

    attemptInitialization() {
        // Usa a flag global do Template Engine ou espera pelo evento
        if (window.__COMPONENTS_LOADED__) {
            this.init();
        } else {
            document.addEventListener('componentsLoaded', () => this.init());
            
            // Fallback de polling caso o evento não dispare a tempo
            const checkInterval = setInterval(() => {
                if (document.getElementById('header')) {
                    clearInterval(checkInterval);
                    if (!this.initialized) this.init();
                }
            }, 500);
        }
    }

    init() {
        if (this.initialized) return; 
        
        console.log('HeaderManager: Inicializando controles...');
        
        // Garante que o Header HTML foi injetado
        if (!document.getElementById('header')) {
             setTimeout(() => this.init(), 500); // Tenta novamente
             return;
        }

        this.attachEventListeners();
        this.loadThemePreference();
        this.loadLangPreference();
        this.initialized = true;
        
        console.log('✅ HeaderManager inicializado com sucesso');
    }

    // Função utilitária para adicionar listener com verificação de elemento
    safeAddListener(id, callback) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', callback);
        } else {
            console.warn(`HeaderManager: Elemento '${id}' não encontrado.`);
        }
    }

    attachEventListeners() {
        console.log('HeaderManager: Anexando eventos de clique...');

        // --- 1. Acessibilidade (Fonte e Tema) ---
        this.safeAddListener('btn-font-decrease', () => this.adjustFontSize(-10));
        this.safeAddListener('btn-font-increase', () => this.adjustFontSize(10));
        this.safeAddListener('theme-toggle', () => this.toggleTheme());

        // --- 2. Painéis Desktop (Busca, Idioma, Mega Menus) ---
        const panelMap = {
            'desktop-search-trigger': 'desktop-search-panel',
            'desktop-lang-trigger': 'desktop-lang-panel',
            'desktop-sobre-trigger': 'desktop-sobre-panel',
            'desktop-conteudo-trigger': 'desktop-conteudo-panel',
            'desktop-ferramentas-trigger': 'desktop-ferramentas-panel',
            'desktop-carreiras-trigger': 'desktop-carreiras-panel'
        };

        Object.entries(panelMap).forEach(([btnId, panelId]) => {
            this.safeAddListener(btnId, (e) => {
                e.stopPropagation();
                this.toggleDesktopPanel(panelId, btnId);
            });
        });

        // --- 3. Menu Mobile (Hamburguer, Busca, Accordions) ---
        this.safeAddListener('mobile-menu-btn', () => this.toggleMobileMenu());
        this.safeAddListener('mobile-search-trigger', () => this.toggleMobileSearch());
        
        // Mobile Accordions (Abre/Fecha submenus)
        document.querySelectorAll('.mobile-accordion-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = btn.getAttribute('data-target');
                this.toggleMobileAccordion(targetId, btn);
            });
        });

        // Mobile Idioma
        this.safeAddListener('mobile-lang-pt', () => this.selectLang('pt'));
        this.safeAddListener('mobile-lang-en', () => this.selectLang('en'));
        this.safeAddListener('mobile-lang-es', () => this.selectLang('es'));

        // --- 4. Fechar Painéis ao clicar fora ---
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#header')) {
                this.closeAllPanels();
            }
        });

        // --- 5. Mega Menu Hover (Flyout Dinâmico) ---
        this.initializeMegaMenuHover();
    }

    // =======================================================
    // Lógica Desktop e Mega Menus
    // =======================================================

    toggleDesktopPanel(targetPanelId, triggerId) {
        const targetPanel = document.getElementById(targetPanelId);
        if (!targetPanel) return;

        const isHidden = targetPanel.classList.contains('hidden');
        this.closeAllPanels(); // Fecha todos os outros

        if (isHidden) {
            targetPanel.classList.remove('hidden');
            this.rotateIcon(triggerId, true);
            // Ativa o primeiro item da lista de detalhes ao abrir
            if (targetPanelId.includes('-panel')) {
                 const firstItem = targetPanel.querySelector('.menu-item-primary[data-area]');
                 if (firstItem) {
                    const area = firstItem.getAttribute('data-area');
                    const detailPaneId = targetPanel.querySelector('[id$="-detail-pane"]').id;
                    this.activateDetail(detailPaneId, area);
                 }
            }
        }
    }

    closeAllPanels() {
        document.querySelectorAll('.desktop-panel').forEach(panel => panel.classList.add('hidden'));
        document.querySelectorAll('.menu-trigger .fa-chevron-down').forEach(icon => icon.style.transform = 'rotate(0deg)');
    }

    rotateIcon(triggerId, shouldRotate) {
        const trigger = document.getElementById(triggerId);
        if (!trigger) return;

        // Primeiro reseta todos os ícones de menu
        document.querySelectorAll('.menu-trigger .fa-chevron-down').forEach(icon => icon.style.transform = 'rotate(0deg)');
        
        // Rotaciona o ícone do trigger atual
        const icon = trigger.querySelector('.fa-chevron-down');
        if (icon && shouldRotate) {
            icon.style.transform = 'rotate(180deg)';
        }
    }

    initializeMegaMenuHover() {
        document.querySelectorAll('[id$="-menu-list"]').forEach(menuList => {
            const detailPane = menuList.closest('.max-w-7xl').querySelector('[id$="-detail-pane"]');
            if (!detailPane) return;

            menuList.querySelectorAll('.menu-item-primary').forEach(item => {
                item.addEventListener('mouseenter', function() {
                    const area = this.getAttribute('data-area');
                    if (area) {
                        this.activateDetail(detailPane.id, area);
                    }
                }.bind(this));
            });
        });
    }
    
    activateDetail(detailPaneId, area) {
        const detailPane = document.getElementById(detailPaneId);
        if (!detailPane) return;

        // Esconde todos os conteúdos do painel de detalhes
        detailPane.querySelectorAll('.detail-content').forEach(content => content.classList.add('hidden', 'active'));

        // Ativa o alvo
        const prefix = detailPaneId.split('-')[0]; // Ex: sobre, conteudo, ferramentas...
        const targetId = `${prefix}-${area}`; 
        const targetDetail = document.getElementById(targetId);
        
        if (targetDetail) {
            targetDetail.classList.remove('hidden');
        }
    }

    // =======================================================
    // Lógica Mobile
    // =======================================================

    toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        if (!menu) return;
        
        menu.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden', !menu.classList.contains('hidden'));
    }

    toggleMobileSearch() {
        const searchBar = document.getElementById('mobile-search-bar');
        searchBar.classList.toggle('search-slide-active');
        searchBar.classList.toggle('search-slide-enter', !searchBar.classList.contains('search-slide-active'));
        if(searchBar.classList.contains('search-slide-active')) {
             searchBar.querySelector('input').focus();
        }
    }

    toggleMobileAccordion(targetId, triggerBtn) {
        const targetEl = document.getElementById(targetId);
        const icon = triggerBtn.querySelector('.icon-chevron');
        
        if (!targetEl || !icon) return;

        const isVisible = targetEl.classList.contains('submenu-visible');

        // Fecha todos os outros submenus (apenas do nível principal)
        document.querySelectorAll('.mobile-submenu-content').forEach(el => {
            if (el.id !== targetId) {
                el.classList.remove('submenu-visible');
                el.classList.add('submenu-hidden');
                document.querySelector(`[data-target="${el.id}"]`).querySelector('.icon-chevron').classList.remove('rotate-chevron');
            }
        });

        // Alterna o submenu atual
        if (!isVisible) {
            targetEl.classList.remove('submenu-hidden');
            targetEl.classList.add('submenu-visible');
            icon.classList.add('rotate-chevron');
        } else {
            targetEl.classList.remove('submenu-visible');
            targetEl.classList.add('submenu-hidden');
            icon.classList.remove('rotate-chevron');
        }
    }

    selectLang(lang) {
        const flags = { 'pt': '🇧🇷', 'en': '🇺🇸', 'es': '🇪🇸' };
        
        // Desktop
        const desktopTrigger = document.getElementById('current-lang-flag');
        if(desktopTrigger) desktopTrigger.textContent = flags[lang];
        this.closeAllPanels();
        
        // Mobile
        document.querySelectorAll('.lang-btn-mobile').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.remove('grayscale', 'opacity-50');
                btn.classList.add('ring-2', 'ring-audit-gold', 'shadow-lg');
            } else {
                btn.classList.add('grayscale', 'opacity-50');
                btn.classList.remove('ring-2', 'ring-audit-gold', 'shadow-lg');
            }
        });
        
        localStorage.setItem('selectedLang', lang);
    }
    
    loadLangPreference() {
        const savedLang = localStorage.getItem('selectedLang') || 'pt';
        this.selectLang(savedLang); // Aplica no desktop e mobile
    }

    // =======================================================
    // Lógica Acessibilidade
    // =======================================================

    adjustFontSize(amount) {
        this.currentFontSize += amount;
        if (this.currentFontSize < 80) this.currentFontSize = 80;
        if (this.currentFontSize > 130) this.currentFontSize = 130;
        
        document.documentElement.style.fontSize = `${this.currentFontSize}%`;
        localStorage.setItem('fontSize', this.currentFontSize.toString());
    }

    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
    }
}

// Instanciar automaticamente
const headerManager = new HeaderManager();

// Disponibilizar globalmente
window.HeaderManager = HeaderManager;