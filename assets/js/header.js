/**
 * HEADER.JS - MECANISMO DO CABEÇALHO MEGA-MENU
 * Sistema Completo de Navegação com Controles de Acessibilidade
 * 
 * Funcionalidades:
 * - Controle de tamanho da fonte
 * - Alternância de tema claro/escuro
 * - Links de navegação Skip
 * - Mega-menu desktop com abas
 * - Menu hambúrguer mobile/tablet
 * - Gerenciamento de estado e acessibilidade
 */

class HeaderEngine {
    constructor() {
        // Configurações do módulo
        this.config = {
            defaultFontSize: 100,
            minFontSize: 80,
            maxFontSize: 200,
            fontSteps: [80, 100, 120, 150, 200],
            storageKeyFontSize: 'ce-font-size',
            storageKeyTheme: 'ce-theme',
            megaPanelOpenClass: 'active',
            mobileMenuOpenClass: 'active',
            submenuOpenClass: 'active',
            tabActiveClass: 'active',
            transitionDelay: 250,
            mobileBreakpoint: 768
        };

        // Estado do módulo
        this.state = {
            currentFontSize: this.config.defaultFontSize,
            isDarkTheme: false,
            openMegaPanel: null,
            isMobileMenuOpen: false,
            isMobileView: window.innerWidth <= this.config.mobileBreakpoint
        };

        // Elementos cacheados
        this.elements = {};

        // Mapeamento de bandeiras por idioma
        this.flagMap = {
            'pt': '🇧🇷',
            'en': '🇺🇸',
            'es': '🇪🇸'
        };

        // Proteção de inicialização múltipla
        if (window.__HEADER_ENGINE_INIT__) {
            return;
        }
        window.__HEADER_ENGINE_INIT__ = true;

        // Inicialização
        this.init();
    }

    /**
     * Inicializa o módulo do cabeçalho
     */
    async init() {
        try {
            // Aguardar DOM estar pronto
            await this.waitForDOM();

            // Cachear elementos do DOM
            this.cacheElements();

            // Carregar preferências do usuário
            this.loadUserPreferences();

            // Carregar idioma salvo
            this.loadSavedLanguage();

            // Configurar event listeners
            this.setupEventListeners();

            // Configurar acessibilidade
            this.setupAccessibility();

            // Inicializar preferência do VLibras
            this.initLibras();

            // Configurar observadores de redimensionamento
            this.setupResizeObserver();

        } catch (error) {
            // Erro ao inicializar sistema do cabeçalho
        }
    }

    /**
     * Aguarda o DOM estar pronto
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Cachea elementos do DOM para performance
     */
    cacheElements() {
        // Controles de fonte (desktop)
        this.elements.fontIncrease = document.getElementById('font-increase');
        this.elements.fontReduce = document.getElementById('font-reduce');
        
        // Controles de fonte (mobile)
        this.elements.mobileFontIncrease = document.getElementById('mobile-font-increase');
        this.elements.mobileFontReduce = document.getElementById('mobile-font-reduce');

        // Toggle de tema
        this.elements.themeToggle = document.getElementById('theme-toggle');
        this.elements.mobileThemeToggle = document.getElementById('mobile-theme-toggle');

        // Skip links (desktop - top bar)
        this.elements.skipTop = document.getElementById('skip-top');
        this.elements.skipContent = document.getElementById('skip-content');
        this.elements.skipFooter = document.getElementById('skip-footer');

        // Mega menu
        this.elements.navItems = document.querySelectorAll('.nav-item.has-mega-menu');
        this.elements.navDropdowns = document.querySelectorAll('.nav-link-dropdown');
        this.elements.megaPanels = document.querySelectorAll('.mega-panel');
        this.elements.tabTriggers = document.querySelectorAll('.menu-tab-trigger');

        // Menu mobile
        this.elements.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.elements.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        this.elements.mobileMenu = document.getElementById('mobile-menu');
        this.elements.mobileMenuClose = document.getElementById('mobile-menu-close');
        this.elements.mobileNavDropdowns = document.querySelectorAll('.mobile-nav-dropdown');

        // Containers
        this.elements.topBar = document.getElementById('top-bar');
        this.elements.mainHeader = document.getElementById('main-header');
        this.elements.languageFlagIcon = document.getElementById('language-flag-icon');
    }

    /**
     * Carrega preferências salvas do usuário
     */
    loadUserPreferences() {
        // Carregar tamanho da fonte
        const savedFontSize = localStorage.getItem(this.config.storageKeyFontSize);
        if (savedFontSize) {
            this.state.currentFontSize = parseInt(savedFontSize, 10);
            this.applyFontSize(this.state.currentFontSize);
        }

        // Carregar tema
        const savedTheme = localStorage.getItem(this.config.storageKeyTheme);
        if (savedTheme) {
            this.state.isDarkTheme = savedTheme === 'dark';
            this.applyTheme(this.state.isDarkTheme);
        } else {
            // Verificar preferência do sistema
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.state.isDarkTheme = true;
                this.applyTheme(true);
            }
        }
    }

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        // Controles de fonte (desktop)
        if (this.elements.fontIncrease) {
            this.elements.fontIncrease.addEventListener('click', (e) => {
                e.preventDefault();
                this.increaseFontSize();
            });
        }
        
        if (this.elements.fontReduce) {
            this.elements.fontReduce.addEventListener('click', (e) => {
                e.preventDefault();
                this.reduceFontSize();
            });
        }

        // Controles de fonte (mobile)
        if (this.elements.mobileFontIncrease) {
            this.elements.mobileFontIncrease.addEventListener('click', (e) => {
                e.preventDefault();
                this.increaseFontSize();
            });
        }
        
        if (this.elements.mobileFontReduce) {
            this.elements.mobileFontReduce.addEventListener('click', (e) => {
                e.preventDefault();
                this.reduceFontSize();
            });
        }

        // Toggle de tema (desktop)
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Toggle de tema (mobile)
        if (this.elements.mobileThemeToggle) {
            this.elements.mobileThemeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Skip links (desktop)
        if (this.elements.skipTop) {
            this.elements.skipTop.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToTarget(this.elements.mainHeader);
            });
        }
        
        if (this.elements.skipContent) {
            this.elements.skipContent.addEventListener('click', (e) => {
                e.preventDefault();
                const mainContent = document.getElementById('main-content') || document.querySelector('main');
                if (mainContent) {
                    this.scrollToTarget(mainContent);
                }
            });
        }
        
        if (this.elements.skipFooter) {
            this.elements.skipFooter.addEventListener('click', (e) => {
                e.preventDefault();
                const footer = document.getElementById('footer') || document.querySelector('footer');
                if (footer) {
                    this.scrollToTarget(footer);
                }
            });
        }

        // Mega menu dropdowns
        this.elements.navDropdowns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const menuName = btn.dataset.menu;
                this.toggleMegaPanel(menuName);
            });
        });

        // Items do nav com mouse leave - Removido para comportamento apenas clique
        /* Anteriormente fechava ao sair com mouse, agora apenas clique fecha */

        // Abas dos mega panels
        this.elements.tabTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = trigger.dataset.tab;
                this.activateTab(tabId, trigger.closest('.mega-panel'));
            });
        });

        // Menu mobile toggle
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Fechar menu mobile overlay
        if (this.elements.mobileMenuOverlay) {
            this.elements.mobileMenuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Fechar menu mobile botão
        if (this.elements.mobileMenuClose) {
            this.elements.mobileMenuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Submenus mobile
        this.elements.mobileNavDropdowns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const parentItem = btn.closest('.mobile-nav-item');
                this.toggleMobileSubmenu(parentItem);
            });
        });

        // Fechar mega panel ao clicar fora (desktop)
        document.addEventListener('click', (e) => {
            if (!this.isMobileView() && this.state.openMegaPanel) {
                const clickedInsideMega = e.target.closest('.mega-panel');
                const clickedOnNav = e.target.closest('.nav-item.has-mega-menu');
                
                if (!clickedInsideMega && !clickedOnNav) {
                    this.closeAllMegaPanels();
                }
            }
        });

        // Tecla ESC para fechar menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // Click outside para fechar submenus mobile
        document.addEventListener('click', (e) => {
            if (this.state.isMobileMenuOpen) {
                const clickedInsideMenu = e.target.closest('.mobile-menu');
                const clickedOnToggle = e.target.closest('.mobile-menu-toggle');
                
                if (!clickedInsideMenu && !clickedOnToggle) {
                    this.closeMobileMenu();
                }
            }
        });

        // Seleção de idiomas
        this.setupLanguageSelection();
    }

    /**
     * Configura seleção de idiomas
     */
    setupLanguageSelection() {
        const idiomaItems = document.querySelectorAll('.idioma-item');
        idiomaItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.dataset.lang;
                this.selectLanguage(lang);
            });
        });
    }

    /**
     * Seleciona um idioma
     */
    selectLanguage(lang) {
        // Remover classe active de todos os itens
        document.querySelectorAll('.idioma-item').forEach(item => {
            item.classList.remove('active');
        });

        // Adicionar classe active ao idioma selecionado
        const selectedItem = document.querySelector(`.idioma-item[data-lang="${lang}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Salvar idioma no localStorage
        localStorage.setItem('ce-language', lang);

        // Disparar evento
        window.dispatchEvent(new CustomEvent('ce:languageChanged', {
            detail: { language: lang }
        }));

        // Atualizar bandeira do idioma
        this.updateLanguageFlag(lang);

        // Fechar o mega panel de idiomas
        this.hideMegaPanel('idiomas');
    }

    /**
     * Carrega idioma salvo
     */
    loadSavedLanguage() {
        const savedLang = localStorage.getItem('ce-language');
        if (savedLang) {
            this.selectLanguage(savedLang);
        } else {
            // Definir bandeira para o idioma padrão (pt) se nenhum idioma estiver salvo
            this.updateLanguageFlag('pt');
        }
    }

    /**
     * Atualiza a bandeira do idioma no elemento visual
     */
    updateLanguageFlag(lang) {
        const flag = this.flagMap[lang] || this.flagMap['pt'];
        
        if (this.elements.languageFlagIcon) {
            this.elements.languageFlagIcon.innerHTML = flag;
            this.elements.languageFlagIcon.setAttribute('aria-label', `Idioma: ${lang.toUpperCase()}`);
        }
    }

    /**
     * Configura recursos de acessibilidade
     */
    setupAccessibility() {
        // Configurar ARIA para menu mobile
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.setAttribute('aria-controls', 'mobile-menu');
        }

        // Configurar tabindex para elementos interativos
        const focusableElements = document.querySelectorAll(
            '.nav-link, .menu-tab-trigger, .font-btn, .theme-toggle, ' +
            '.mobile-nav-link, .mobile-menu-close, .skip-link, .skip-btn'
        );

        focusableElements.forEach(el => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });

        // Navegação por teclado nos mega panels
        this.setupKeyboardNavigation();
    }

    /**
     * Inicializa VLibras com base na preferência salva
     */
    initLibras() {
        // Chamar a função global de inicialização
        if (typeof initLibrasPreference === 'function') {
            initLibrasPreference();
        }
    }

    /**
     * Configura navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.state.openMegaPanel) return;

            const panel = document.getElementById(`mega-panel-${this.state.openMegaPanel}`);
            if (!panel) return;

            const tabTriggers = panel.querySelectorAll('.menu-tab-trigger');
            const contentLinks = panel.querySelectorAll('.content-links a');
            const allFocusable = [...tabTriggers, ...contentLinks];

            const currentIndex = allFocusable.findIndex(el => el === document.activeElement);

            if (e.key === 'Tab') {
                e.preventDefault();
                const nextIndex = currentIndex < allFocusable.length - 1 ? currentIndex + 1 : 0;
                allFocusable[nextIndex].focus();
            }
        });
    }

    /**
     * Configura observador de redimensionamento
     */
    setupResizeObserver() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        const wasMobile = this.state.isMobileView;
        this.state.isMobileView = window.innerWidth <= this.config.mobileBreakpoint;
        
        // Fechar menu mobile ao redimensionar para desktop
        if (window.innerWidth > 1024 && this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Fechar mega panels ao redimensionar para mobile
        if (window.innerWidth <= 1024 && this.state.openMegaPanel) {
            this.closeAllMegaPanels();
        }
        
        // Atualizar visibilidade dos botões de skip
        this.updateSkipButtonsVisibility();
    }

    /**
     * Atualiza a visibilidade dos botões de skip baseada no tamanho da tela
     */
    updateSkipButtonsVisibility() {
        const skipControls = document.querySelector('.skip-controls');
        if (skipControls) {
            if (this.state.isMobileView) {
                skipControls.style.display = 'none';
            } else {
                skipControls.style.display = 'flex';
            }
        }
    }

    /**
     * Manipula tecla ESC
     */
    handleEscapeKey() {
        if (this.state.openMegaPanel) {
            this.closeAllMegaPanels();
            // Focar no botão que abriu o panel
            const btn = document.querySelector(`[data-menu="${this.state.openMegaPanel}"]`);
            if (btn) btn.focus();
        }

        if (this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
            if (this.elements.mobileMenuToggle) {
                this.elements.mobileMenuToggle.focus();
            }
        }
    }

    /**
     * Verifica se está em visualização mobile
     */
    isMobileView() {
        return window.innerWidth <= 1024;
    }

    // ============================================
    // CONTROLE DE TAMANHO DA FONTE
    // ============================================

    /**
     * Obtém o próximo tamanho de fonte maior
     */
    getNextLargerSize() {
        const currentIndex = this.config.fontSteps.indexOf(this.state.currentFontSize);
        if (currentIndex < this.config.fontSteps.length - 1) {
            return this.config.fontSteps[currentIndex + 1];
        }
        return this.config.fontSteps[this.config.fontSteps.length - 1];
    }

    /**
     * Obtém o próximo tamanho de fonte menor
     */
    getNextSmallerSize() {
        const currentIndex = this.config.fontSteps.indexOf(this.state.currentFontSize);
        if (currentIndex > 0) {
            return this.config.fontSteps[currentIndex - 1];
        }
        return this.config.fontSteps[0];
    }

    /**
     * Aumenta o tamanho da fonte
     */
    increaseFontSize() {
        const newSize = this.getNextLargerSize();
        if (newSize !== this.state.currentFontSize) {
            this.setFontSize(newSize);
        }
    }

    /**
     * Reduz o tamanho da fonte
     */
    reduceFontSize() {
        const newSize = this.getNextSmallerSize();
        if (newSize !== this.state.currentFontSize) {
            this.setFontSize(newSize);
        }
    }

    /**
     * Aplica o tamanho da fonte
     */
    applyFontSize(size) {
        document.documentElement.style.setProperty('--font-size-scale', size / 100);
    }

    /**
     * Define novo tamanho da fonte
     */
    setFontSize(size) {
        this.state.currentFontSize = size;
        
        // Aplicar
        this.applyFontSize(size);
        
        // Salvar no localStorage
        localStorage.setItem(this.config.storageKeyFontSize, size.toString());
        
        // Disparar evento para outras partes do app
        window.dispatchEvent(new CustomEvent('ce:fontSizeChanged', {
            detail: { size }
        }));
    }

    // ============================================
    // CONTROLE DE TEMA
    // ============================================

    /**
     * Aplica o tema
     */
    applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        this.state.isDarkTheme = isDark;
    }

    /**
     * Alterna entre tema claro e escuro
     */
    toggleTheme() {
        const newTheme = !this.state.isDarkTheme;
        this.applyTheme(newTheme);
        
        // Salvar no localStorage
        localStorage.setItem(this.config.storageKeyTheme, newTheme ? 'dark' : 'light');
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('ce:themeChanged', {
            detail: { isDark: newTheme }
        }));
    }

    // ============================================
    // MEGA MENU
    // ============================================

    /**
     * Exibe mega panel específico
     */
    showMegaPanel(menuName) {
        // Fechar outros panels primeiro
        this.closeAllMegaPanels();

        // Encontrar o panel
        const panel = document.getElementById(`mega-panel-${menuName}`);
        if (!panel) return;

        // Encontrar o botão de navegação
        const navBtn = document.querySelector(`[data-menu="${menuName}"]`);
        
        // Atualizar ARIA
        if (navBtn) {
            navBtn.setAttribute('aria-expanded', 'true');
        }

        // Mostrar panel
        panel.classList.add(this.config.megaPanelOpenClass);

        // Atualizar estado
        this.state.openMegaPanel = menuName;

        // Focar primeira aba
        const firstTab = panel.querySelector('.menu-tab-trigger');
        if (firstTab) {
            firstTab.focus();
        }
    }

    /**
     * Fecha mega panel específico
     */
    hideMegaPanel(menuName) {
        const panel = document.getElementById(`mega-panel-${menuName}`);
        if (!panel) return;

        // Encontrar o botão de navegação
        const navBtn = document.querySelector(`[data-menu="${menuName}"]`);
        
        // Atualizar ARIA
        if (navBtn) {
            navBtn.setAttribute('aria-expanded', 'false');
        }

        // Ocultar panel
        panel.classList.remove(this.config.megaPanelOpenClass);

        // Limpar estado
        if (this.state.openMegaPanel === menuName) {
            this.state.openMegaPanel = null;
        }
    }

    /**
     * Alterna mega panel específico
     */
    toggleMegaPanel(menuName) {
        if (this.state.openMegaPanel === menuName) {
            this.hideMegaPanel(menuName);
        } else {
            this.showMegaPanel(menuName);
        }
    }

    /**
     * Fecha todos os mega panels
     */
    closeAllMegaPanels() {
        this.elements.megaPanels.forEach(panel => {
            const menuName = panel.dataset.menu;
            if (menuName) {
                this.hideMegaPanel(menuName);
            }
        });
    }

    // ============================================
    // ABAS DOS MEGA PANELS
    // ============================================

    /**
     * Ativa aba específica
     */
    activateTab(tabId, panel) {
        if (!panel) return;

        // Encontrar todos os elementos da aba no panel
        const triggers = panel.querySelectorAll('.menu-tab-trigger');
        const contents = panel.querySelectorAll('.tab-content');

        // Desativar todas as abas
        triggers.forEach(trigger => {
            trigger.classList.remove(this.config.tabActiveClass);
            trigger.setAttribute('aria-selected', 'false');
        });

        contents.forEach(content => {
            content.classList.remove(this.config.tabActiveClass);
        });

        // Ativar aba selecionada
        const activeTrigger = panel.querySelector(`.menu-tab-trigger[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(`tab-${tabId}`);

        if (activeTrigger) {
            activeTrigger.classList.add(this.config.tabActiveClass);
            activeTrigger.setAttribute('aria-selected', 'true');
        }

        if (activeContent) {
            activeContent.classList.add(this.config.tabActiveClass);
        }
    }

    // ============================================
    // MENU MOBILE
    // ============================================

    /**
     * Alterna menu mobile
     */
    toggleMobileMenu() {
        if (this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Abre menu mobile
     */
    openMobileMenu() {
        // Fechar mega panels se estiverem abertos
        this.closeAllMegaPanels();

        // Atualizar ARIA
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
        }

        // Mostrar elementos
        this.elements.mobileMenu?.classList.add(this.config.mobileMenuOpenClass);
        this.elements.mobileMenuOverlay?.classList.add(this.config.mobileMenuOpenClass);

        // Animar botão hambúrguer
        this.elements.mobileMenuToggle?.classList.add(this.config.mobileMenuOpenClass);

        // Bloquear scroll do body
        document.body.style.overflow = 'hidden';

        // Atualizar estado
        this.state.isMobileMenuOpen = true;

        // Focar botão de fechar
        setTimeout(() => {
            this.elements.mobileMenuClose?.focus();
        }, 300);
    }

    /**
     * Fecha menu mobile
     */
    closeMobileMenu() {
        // Atualizar ARIA
        if (this.elements.mobileMenuToggle) {
            this.elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }

        // Ocultar elementos
        this.elements.mobileMenu?.classList.remove(this.config.mobileMenuOpenClass);
        this.elements.mobileMenuOverlay?.classList.remove(this.config.mobileMenuOpenClass);

        // Remover animação do botão hambúrguer
        this.elements.mobileMenuToggle?.classList.remove(this.config.mobileMenuOpenClass);

        // Restaurar scroll do body
        document.body.style.overflow = '';

        // Atualizar estado
        this.state.isMobileMenuOpen = false;

        // Focar botão de toggle
        this.elements.mobileMenuToggle?.focus();
    }

    /**
     * Alterna submenu mobile
     */
    toggleMobileSubmenu(parentItem) {
        if (!parentItem) return;

        const submenu = parentItem.querySelector('.mobile-submenu');
        const btn = parentItem.querySelector('.mobile-nav-dropdown');

        if (!submenu || !btn) return;

        const isOpen = submenu.classList.contains(this.config.submenuOpenClass);

        // Fechar outros submenus
        const allSubmenus = document.querySelectorAll('.mobile-submenu');
        const allDropdowns = document.querySelectorAll('.mobile-nav-dropdown');

        allSubmenus.forEach(s => {
            if (s !== submenu) {
                s.classList.remove(this.config.submenuOpenClass);
            }
        });

        allDropdowns.forEach(d => {
            if (d !== btn) {
                d.setAttribute('aria-expanded', 'false');
            }
        });

        // Toggle submenu atual
        submenu.classList.toggle(this.config.submenuOpenClass);
        btn.setAttribute('aria-expanded', !isOpen);
        parentItem.classList.toggle(this.config.submenuOpenClass);
    }

    // ============================================
    // SCROLL E NAVEGAÇÃO
    // ============================================

    /**
     * Rola até elemento alvo
     */
    scrollToTarget(targetElement) {
        if (!targetElement) return;

        const headerOffset = this.elements.mainHeader?.offsetHeight || 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        // Focar no elemento alvo para acessibilidade
        setTimeout(() => {
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus();
            targetElement.removeAttribute('tabindex');
        }, 500);
    }

    // ============================================
    // MÉTODOS PÚBLICOS DE API
    // ============================================

    /**
     * Retorna status do módulo
     */
    getStatus() {
        return {
            fontSize: this.state.currentFontSize,
            isDarkTheme: this.state.isDarkTheme,
            openMegaPanel: this.state.openMegaPanel,
            isMobileMenuOpen: this.state.isMobileMenuOpen,
            isMobileView: this.isMobileView()
        };
    }

    /**
     * Reseta todas as preferências
     */
    resetPreferences() {
        localStorage.removeItem(this.config.storageKeyFontSize);
        localStorage.removeItem(this.config.storageKeyTheme);
        
        this.setFontSize(this.config.defaultFontSize);
        this.applyTheme(false);
    }

    /**
     * Abre mega panel por nome (API pública)
     */
    openPanel(panelName) {
        this.showMegaPanel(panelName);
    }

    /**
     * Fecha todos os menus (API pública)
     */
    closeAll() {
        this.closeAllMegaPanels();
        this.closeMobileMenu();
    }
}

/**
 * Inicialização do módulo quando integrado com TemplateEngine
 */
function init() {
    window.headerEngine = new HeaderEngine();
    return window.headerEngine;
}

// Inicialização automática se já estiver no DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.HeaderEngine = HeaderEngine;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeaderEngine };
}

// ═══════════════════════════════════════════
// VLIBRAS INTEGRATION
// ═══════════════════════════════════════════

// Store reference to accessibility module's toggleLibras
const _accessibilityToggleLibras = window.toggleLibras;

/**
 * Alterna a visibilidade do widget VLibras
 * Esta função sobrescreve a definição em accessibility.js para melhor integração
 */
function toggleLibras() {
    const pluginWrapper = document.querySelector('.vw-plugin-wrapper');
    const accessButton = document.querySelector('[vw-access-button]');
    
    // Se o widget VLibras oficial existir, usar ele
    if (accessButton) {
        accessButton.click();
        // Atualizar estado no localStorage
        const isVisible = accessButton.style.opacity !== '0' && accessButton.style.opacity !== '';
        localStorage.setItem('ce-libras-visible', isVisible ? 'true' : 'false');
        return;
    }
    
    // Fallback: controlar wrapper manualmente
    if (!pluginWrapper) {
        return;
    }
    
    const isActive = pluginWrapper.classList.contains('active');
    
    if (isActive) {
        pluginWrapper.classList.remove('active');
        localStorage.setItem('ce-libras-visible', 'false');
    } else {
        pluginWrapper.classList.add('active');
        localStorage.setItem('ce-libras-visible', 'true');
    }
    
    window.dispatchEvent(new CustomEvent('ce:librasToggled', {
        detail: { isActive: !isActive }
    }));
}

/**
 * Inicializa VLibras com base na preferência salva
 */
function initLibrasPreference() {
    const savedPreference = localStorage.getItem('ce-libras-visible');
    
    if (savedPreference === 'true') {
        const checkWidget = setInterval(() => {
            const accessButton = document.querySelector('[vw-access-button]');
            const pluginWrapper = document.querySelector('.vw-plugin-wrapper');
            
            if (accessButton) {
                clearInterval(checkWidget);
                // Garantir que o botão esteja visível
                accessButton.style.opacity = '1';
                accessButton.style.pointerEvents = 'auto';
            } else if (pluginWrapper) {
                // Fallback para wrapper manual
                clearInterval(checkWidget);
                pluginWrapper.classList.add('active');
            }
        }, 200);
        
        setTimeout(() => clearInterval(checkWidget), 10000);
    }
}

// Função global para seleção de idiomas (chamada pelo onclick no HTML)
function selectLanguage(event, lang) {
    event.preventDefault();
    if (window.headerEngine) {
        window.headerEngine.selectLanguage(lang);
    }
}
