/**
 * Módulo Unificado de Header e Acessibilidade
 * Versão otimizada para o sistema de carregamento modular do index.html
 * Aguarda o EventBus estar pronto antes de inicializar
 */
(function() {
    "use strict";

    // ============================================
    // CONFIGURAÇÕES E CONSTANTES
    // ============================================
    const Config = {
        defaultFontSize: 16,
        minFontSize: 13,
        maxFontSize: 32,
        fontStep: 2,
        fontStorageKey: "ce_font_size",
        themeStorageKey: "ce_theme",
        animationDuration: 300,
        megaMenuBreakpoint: 1024,
        languageStorageKey: "ce_language",
        animationStorageKey: "ce_reduce_animation",
        fontSizeLevels: [13, 16, 19, 24, 32],
        fontSizeLabels: ['85%', '100%', '120%', '150%', '200%']
    };

    const State = {
        currentFontSize: Config.defaultFontSize,
        currentFontIndex: 1,
        isDarkMode: false,
        loaded: false,
        activeMegaPanel: null,
        activeMobileSubmenu: null,
        currentLanguage: 'pt-br',
        reduceAnimations: false,
        eventBusReady: false
    };

    // ============================================
    // UTILITÁRIOS DOM
    // ============================================
    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function isDesktop() {
        return window.matchMedia(`(min-width: ${Config.megaMenuBreakpoint + 1}px)`).matches;
    }

    function isMobile() {
        return window.matchMedia(`(max-width: ${Config.megaMenuBreakpoint}px)`).matches;
    }

    // ============================================
    // PERSISTÊNCIA DE DADOS
    // ============================================
    function saveFontSize() {
        try {
            localStorage.setItem(Config.fontStorageKey, JSON.stringify({
                size: State.currentFontSize,
                index: State.currentFontIndex
            }));
        } catch (e) {
            console.warn('[Header] Erro ao salvar tamanho da fonte:', e);
        }
    }

    function loadFontSize() {
        try {
            const saved = localStorage.getItem(Config.fontStorageKey);
            if (saved) {
                const data = JSON.parse(saved);
                if (data && typeof data.index === 'number') {
                    const validIndex = Math.max(0, Math.min(Config.fontSizeLevels.length - 1, data.index));
                    State.currentFontIndex = validIndex;
                    State.currentFontSize = Config.fontSizeLevels[validIndex];
                    return true;
                }
            }
        } catch (e) {
            console.warn('[Header] Erro ao carregar tamanho da fonte:', e);
        }
        State.currentFontSize = Config.defaultFontSize;
        State.currentFontIndex = 1;
        return false;
    }

    function saveTheme() {
        try {
            localStorage.setItem(Config.themeStorageKey, State.isDarkMode ? "dark" : "light");
        } catch (e) {
            console.warn('[Header] Erro ao salvar tema:', e);
        }
    }

    function loadTheme() {
        try {
            const saved = localStorage.getItem(Config.themeStorageKey);
            if (saved) {
                State.isDarkMode = saved === "dark";
                return true;
            }
        } catch (e) {
            console.warn('[Header] Erro ao carregar tema:', e);
        }
        State.isDarkMode = false;
        return false;
    }

    // ============================================
    // CONTROLE DE ANIMAÇÕES (PRELOADER)
    // ============================================
    function shouldReduceAnimations() {
        try {
            const saved = localStorage.getItem(Config.animationStorageKey);
            if (saved) {
                return saved === "true";
            }
        } catch (e) {
            console.warn('[Header] Erro ao verificar preferência de animações:', e);
        }
        return false;
    }

    function applyAnimationPreference() {
        State.reduceAnimations = shouldReduceAnimations();
        
        // Aplicar ao documento para CSS media query
        if (State.reduceAnimations) {
            document.documentElement.classList.add('reduce-animations');
        } else {
            document.documentElement.classList.remove('reduce-animations');
        }
        
        // Atualizar visualmente os botões
        const mobileAnimBtn = getElement('mobile-animation-toggle');
        const animBtn = getElement('animation-toggle');
        
        if (mobileAnimBtn) {
            mobileAnimBtn.classList.toggle('active', State.reduceAnimations);
        }
        if (animBtn) {
            animBtn.classList.toggle('active', State.reduceAnimations);
        }
        
        return State.reduceAnimations;
    }

    function handleAnimationToggle(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Toggle estado
        State.reduceAnimations = !State.reduceAnimations;
        
        // Salvar preferência
        try {
            localStorage.setItem(Config.animationStorageKey, State.reduceAnimations.toString());
        } catch (err) {
            console.warn('[Header] Erro ao salvar preferência de animações:', err);
        }
        
        // Aplicar ao documento
        if (State.reduceAnimations) {
            document.documentElement.classList.add('reduce-animations');
        } else {
            document.documentElement.classList.remove('reduce-animations');
        }
        
        // Atualizar visualmente os botões
        const mobileAnimBtn = getElement('mobile-animation-toggle');
        const animBtn = getElement('animation-toggle');
        
        if (mobileAnimBtn) {
            mobileAnimBtn.classList.toggle('active', State.reduceAnimations);
        }
        if (animBtn) {
            animBtn.classList.toggle('active', State.reduceAnimations);
        }
        
        // Notificar outros módulos
        if (window.EventBus) {
            window.EventBus.emit('accessibility:animationChanged', { reduceAnimations: State.reduceAnimations });
        }
        
        return State.reduceAnimations;
    }

    function initAnimationControls() {
        const animationToggles = [
            getElement('animation-toggle'),
            getElement('mobile-animation-toggle')
        ];
        
        animationToggles.forEach(btn => {
            if (btn) {
                // Remover eventos existentes
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', handleAnimationToggle, { passive: false });
            }
        });
    }

    // Verificar se há preloader e esconder se necessário
    function handlePreloader() {
        if (State.reduceAnimations) {
            const preloader = getElement('preloader');
            if (preloader) {
                // Esconder preloader imediatamente
                preloader.style.display = 'none';
                preloader.setAttribute('aria-hidden', 'true');
            }
            
            // Também esconder overlay de carregamento se existir
            const loadingOverlay = getElement('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            console.log('[Header] Preloader oculto devido à preferência do usuário');
        }
    }

    // ============================================
    // CONTROLE DE FONTE
    // ============================================
    function applyFontSize(size, index) {
        if (size !== undefined) {
            State.currentFontSize = size;
        }
        if (index !== undefined) {
            State.currentFontIndex = index;
            State.currentFontSize = Config.fontSizeLevels[index];
        }

        const clampedSize = Math.max(Config.minFontSize, Math.min(Config.maxFontSize, State.currentFontSize));
        State.currentFontSize = clampedSize;

        State.currentFontIndex = Config.fontSizeLevels.indexOf(clampedSize);
        if (State.currentFontIndex === -1) {
            State.currentFontIndex = 1;
            State.currentFontSize = Config.defaultFontSize;
        }

        document.documentElement.style.fontSize = clampedSize + 'px';
        document.documentElement.style.setProperty('--font-size-base', clampedSize + 'px');

        const scale = clampedSize / Config.defaultFontSize;
        document.documentElement.style.setProperty('--font-scale', scale.toString());

        document.body.setAttribute('data-font-scale', scale.toString());
        document.body.setAttribute('data-font-size-index', State.currentFontIndex.toString());

        saveFontSize();
    }

    function increaseFontSize(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let newIndex = State.currentFontIndex + 1;
        if (newIndex >= Config.fontSizeLevels.length) {
            newIndex = 0;
        }
        applyFontSize(undefined, newIndex);
    }

    function decreaseFontSize(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let newIndex = State.currentFontIndex - 1;
        if (newIndex < 0) {
            newIndex = Config.fontSizeLevels.length - 1;
        }
        applyFontSize(undefined, newIndex);
    }

    function initFontControls() {
        const increaseBtns = [
            getElement('font-increase'),
            getElement('mobile-font-increase')
        ];
        const decreaseBtns = [
            getElement('font-reduce'),
            getElement('mobile-font-reduce')
        ];

        increaseBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', increaseFontSize, { passive: false });
            }
        });

        decreaseBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', decreaseFontSize, { passive: false });
            }
        });
    }

    // ============================================
    // INICIALIZAÇÃO DOS TABS DO MEGA MENU
    // ============================================
    function initMegaMenuTabs() {
        const allTabTriggers = $$('.menu-tab-trigger');
        
        allTabTriggers.forEach(trigger => {
            // Remover eventos existentes para evitar duplicação
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            
            newTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                
                const panel = this.closest('.mega-panel');
                if (!panel) return;
                
                // Obter o ID da aba a ser ativada
                const tabId = this.getAttribute('data-tab');
                if (!tabId) return;
                
                // Remover classe active de todos os triggers no mesmo panel
                const panelTriggers = panel.querySelectorAll('.menu-tab-trigger');
                panelTriggers.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                
                // Adicionar classe active ao trigger clicado
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Esconder todos os conteúdos de aba no panel
                const tabContents = panel.querySelectorAll('.tab-content');
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Mostrar o conteúdo da aba selecionada
                const targetTab = panel.querySelector('#tab-' + tabId);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
        
        return allTabTriggers.length > 0;
    }
    
    // ============================================
    // INICIALIZAÇÃO DO MEGA MENU
    // ============================================
    function initMegaMenu() {
        const megaMenuItems = $$('.has-mega-menu');

        if (megaMenuItems.length === 0) {
            return false;
        }

        let hoverTimeout;
        let currentOpenPanel = null;
        let currentOpenTrigger = null;

        function closeAllPanels() {
            megaMenuItems.forEach(item => {
                const panel = item.querySelector('.mega-panel');
                const trigger = item.querySelector('.nav-link-dropdown');
                if (panel && trigger) {
                    panel.classList.remove('active');
                    trigger.setAttribute('aria-expanded', 'false');
                    trigger.classList.remove('active');
                }
            });
            currentOpenPanel = null;
            currentOpenTrigger = null;
            document.body.classList.remove('mega-menu-active');
        }

        function showPanel(trigger, panel) {
            if (currentOpenPanel && currentOpenPanel !== panel) {
                currentOpenPanel.classList.remove('active');
                if (currentOpenTrigger) {
                    currentOpenTrigger.setAttribute('aria-expanded', 'false');
                    currentOpenTrigger.classList.remove('active');
                }
            }

            panel.classList.add('active');
            trigger.setAttribute('aria-expanded', 'true');
            trigger.classList.add('active');
            document.body.classList.add('mega-menu-active');

            currentOpenPanel = panel;
            currentOpenTrigger = trigger;
        }

        function hidePanel(trigger, panel) {
            panel.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('active');

            if (currentOpenPanel === panel) {
                currentOpenPanel = null;
            }
            if (currentOpenTrigger === trigger) {
                currentOpenTrigger = null;
            }

            const anyOpen = $$('.mega-panel.active').length === 0;
            if (anyOpen) {
                document.body.classList.remove('mega-menu-active');
            }
        }

        // Configurar eventos para cada item do mega menu
        megaMenuItems.forEach(item => {
            const trigger = item.querySelector('.nav-link-dropdown');
            const panel = item.querySelector('.mega-panel');

            if (!trigger || !panel) return;

            // Mouse enter (desktop)
            trigger.addEventListener('mouseenter', function(e) {
                if (!isDesktop()) return;
                clearTimeout(hoverTimeout);
                showPanel(trigger, panel);
            });

            // Mouse leave (desktop)
            trigger.addEventListener('mouseleave', function(e) {
                if (!isDesktop()) return;
                hoverTimeout = setTimeout(() => {
                    if (currentOpenPanel === panel) {
                        hidePanel(trigger, panel);
                    }
                }, 300);
            });

            // Click (mobile/tablet)
            trigger.addEventListener('click', function(e) {
                if (isDesktop()) return;
                e.preventDefault();
                const isActive = panel.classList.contains('active');
                if (isActive) {
                    hidePanel(trigger, panel);
                } else {
                    closeAllPanels();
                    showPanel(trigger, panel);
                }
            });

            // Focus (accessibility)
            trigger.addEventListener('focus', function() {
                if (isDesktop()) {
                    showPanel(trigger, panel);
                }
            });

            // Panel mouse events
            panel.addEventListener('mouseenter', function() {
                if (!isDesktop()) return;
                clearTimeout(hoverTimeout);
            });

            panel.addEventListener('mouseleave', function() {
                if (!isDesktop()) return;
                hoverTimeout = setTimeout(() => {
                    hidePanel(trigger, panel);
                }, 300);
            });
        });

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && currentOpenPanel) {
                closeAllPanels();
                if (currentOpenTrigger) {
                    currentOpenTrigger.focus();
                }
            }
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.has-mega-menu') && currentOpenPanel) {
                closeAllPanels();
            }
        });

        // Handle resize
        window.addEventListener('resize', function() {
            if (isMobile() && currentOpenPanel) {
                closeAllPanels();
            }
        });
        
        // Inicializar tabs do mega menu
        initMegaMenuTabs();
        
        return true;
    }

    // ============================================
    // INICIALIZAÇÃO DO MENU MOBILE
    // ============================================
    function initMobileMenu() {
        const mobileMenu = getElement('mobile-menu');
        const menuToggle = getElement('mobile-menu-toggle');
        const menuClose = getElement('mobile-menu-close');
        const menuOverlay = getElement('mobile-menu-overlay');

        if (!mobileMenu) return;

        function toggleMenu() {
            const isActive = mobileMenu.classList.contains('active');
            mobileMenu.classList.toggle('active', !isActive);
            
            if (menuToggle) {
                menuToggle.classList.toggle('active', !isActive);
                menuToggle.setAttribute('aria-expanded', !isActive);
            }
            
            document.body.style.overflow = isActive ? '' : 'hidden';
        }

        function closeMenu() {
            mobileMenu.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }

        if (menuToggle) {
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                toggleMenu();
            });
        }

        if (menuClose) {
            menuClose.addEventListener('click', function(e) {
                e.preventDefault();
                closeMenu();
            });
        }

        if (menuOverlay) {
            menuOverlay.addEventListener('click', function(e) {
                e.preventDefault();
                closeMenu();
            });
        }

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Inicializar submenus mobile
        initMobileSubmenus();
    }

    function initMobileSubmenus() {
        // Inicializar primeiro nível - itens principais do menu mobile
        const mainNavItems = $$('.mobile-nav-item.has-mobile-submenu');

        mainNavItems.forEach(navItem => {
            const toggleBtn = navItem.querySelector('.mobile-nav-dropdown');
            const submenu = navItem.querySelector('.mobile-submenu');

            if (!toggleBtn || !submenu) return;

            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                
                // Fechar outros submenus do mesmo nível
                mainNavItems.forEach(otherItem => {
                    if (otherItem !== navItem) {
                        const otherBtn = otherItem.querySelector('.mobile-nav-dropdown');
                        const otherSubmenu = otherItem.querySelector('.mobile-submenu');
                        if (otherBtn && otherSubmenu) {
                            otherBtn.setAttribute('aria-expanded', 'false');
                            otherItem.classList.remove('active');
                            otherSubmenu.classList.remove('active');
                        }
                    }
                });

                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                navItem.classList.toggle('active', !isExpanded);
                submenu.classList.toggle('active', !isExpanded);
            });
        });

        // Inicializar segundo nível - submenus dentro dos submenus (level-2 e level-3)
        const nestedItems = $$('.mobile-submenu-item.has-mobile-submenu');

        nestedItems.forEach(navItem => {
            const toggleBtn = navItem.querySelector('.mobile-submenu-dropdown');
            const submenu = navItem.querySelector('.mobile-submenu');

            if (!toggleBtn || !submenu) return;

            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                
                // Fechar outros submenus do mesmo nível
                const siblingItems = navItem.parentElement.querySelectorAll('.mobile-submenu-item.has-mobile-submenu');
                siblingItems.forEach(otherItem => {
                    if (otherItem !== navItem) {
                        const otherBtn = otherItem.querySelector('.mobile-submenu-dropdown');
                        const otherSubmenu = otherItem.querySelector('.mobile-submenu');
                        if (otherBtn && otherSubmenu) {
                            otherBtn.setAttribute('aria-expanded', 'false');
                            otherItem.classList.remove('active');
                            otherSubmenu.classList.remove('active');
                        }
                    }
                });

                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                navItem.classList.toggle('active', !isExpanded);
                submenu.classList.toggle('active', !isExpanded);
                
                // Atualizar rotação da seta
                const arrow = toggleBtn.querySelector('.submenu-arrow');
                if (arrow) {
                    arrow.style.transform = !isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
                }
            });
        });
    }

    // ============================================
    // INICIALIZAÇÃO DO MENU DE IDIOMA MOBILE
    // ============================================
    function initMobileLanguageToggle() {
        const languageToggle = getElement('mobile-idiomas-toggle');
        const languageSection = getElement('mobile-idiomas-section');
        const languageList = getElement('mobile-idiomas-list');
        const languageArrow = getElement('mobile-idiomas-arrow');

        if (!languageToggle || !languageList) return;

        languageToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = languageToggle.getAttribute('aria-expanded') === 'true';
            
            // Alternar estado
            languageToggle.setAttribute('aria-expanded', !isExpanded);
            languageSection.classList.toggle('expanded', !isExpanded);
            languageList.classList.toggle('show', !isExpanded);
            
            // Rotacionar seta
            if (languageArrow) {
                languageArrow.style.transform = !isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.mobile-language-section') && languageList.classList.contains('show')) {
                languageToggle.setAttribute('aria-expanded', 'false');
                languageSection.classList.remove('expanded');
                languageList.classList.remove('show');
                if (languageArrow) {
                    languageArrow.style.transform = 'rotate(0deg)';
                }
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && languageList.classList.contains('show')) {
                languageToggle.setAttribute('aria-expanded', 'false');
                languageSection.classList.remove('expanded');
                languageList.classList.remove('show');
                if (languageArrow) {
                    languageArrow.style.transform = 'rotate(0deg)';
                }
            }
        });
    }

    // ============================================
    // INICIALIZAÇÃO DO BOTÃO DE PESQUISA MOBILE
    // ============================================
    function initMobileSearchToggle() {
        const searchToggle = getElement('mobile-search-toggle');
        const searchContainer = getElement('mobile-search-container');

        if (!searchToggle || !searchContainer) return;

        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = searchContainer.classList.contains('expanded');
            
            // Alternar estado
            searchContainer.classList.toggle('expanded', !isExpanded);
            searchToggle.classList.toggle('active', !isExpanded);
            searchToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Focar no campo de pesquisa quando expandir
            if (!isExpanded) {
                const searchInput = searchContainer.querySelector('.search-input');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.mobile-search-container') && !e.target.closest('.mobile-search-btn') && searchContainer.classList.contains('expanded')) {
                searchContainer.classList.remove('expanded');
                searchToggle.classList.remove('active');
                searchToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchContainer.classList.contains('expanded')) {
                searchContainer.classList.remove('expanded');
                searchToggle.classList.remove('active');
                searchToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ============================================
    // INICIALIZAÇÃO PRINCIPAL
    // ============================================
    function initialize() {
        // Verificar se os elementos existem
        const hasMegaMenuItems = $$('.has-mega-menu').length > 0;
        const hasMobileMenu = getElement('mobile-menu') !== null;

        if (!hasMegaMenuItems && !hasMobileMenu) {
            return false;
        }

        // Evitar inicialização dupla
        if (State.loaded) {
            return true;
        }

        // Carregar estados salvos
        loadFontSize();
        loadTheme();
        applyAnimationPreference();
        
        // Verificar se deve ocultar o preloader
        handlePreloader();

        // Aplicar configurações iniciais
        document.documentElement.style.fontSize = State.currentFontSize + 'px';

        // Inicializar componentes
        initFontControls();
        initAnimationControls();
        initMegaMenu();
        initMobileMenu();
        initMobileLanguageToggle();
        initMobileSearchToggle();

        State.loaded = true;
        return true;
    }

    // ============================================
    // EXPOSIÇÃO DA API PÚBLICA
    // ============================================
    window.HeaderModule = {
        init: function() {
            return initialize();
        },

        reinitMegaMenu: function() {
            return initMegaMenu();
        },

        isReady: function() {
            const hasMegaMenuItems = $$('.has-mega-menu').length > 0;
            const hasMobileMenu = getElement('mobile-menu') !== null;
            return hasMegaMenuItems || hasMobileMenu;
        },

        isLoaded: function() {
            return State.loaded;
        },

        // API para controle de animações
        toggleAnimations: function() {
            return handleAnimationToggle();
        },

        reduceAnimations: function() {
            return State.reduceAnimations;
        },

        applyAnimationPreference: function() {
            return applyAnimationPreference();
        }
    };

    // ============================================
    // ESCUTAR EVENTO DO INDEX.HTML
    // ============================================
    // O index.html emite 'module:header-v2-container:ready' após injetar o HTML
    // Vamos aguardar esse evento antes de inicializar

    function setupHeaderReadyListener() {
        // Verificar se já podemos inicializar
        if (window.EventBus && window.EventBus.events && window.EventBus.fired) {
            // O evento já pode ter sido disparado
            const firedEvent = window.EventBus.fired['module:header-v2-container:ready'];
            if (firedEvent) {
                setTimeout(initialize, 100);
                return;
            }
        }

        // Escutar o evento
        if (window.EventBus) {
            window.EventBus.on('module:header-v2-container:ready', function() {
                setTimeout(initialize, 50);
            });
        } else {
            // Se EventBus não existir ainda, aguardar
            window.addEventListener('eventbus:ready', function() {
                window.EventBus.on('module:header-v2-container:ready', function() {
                    setTimeout(initialize, 50);
                });
            });
        }
    }

    // ============================================
    // FALLBACK: Inicialização após delay
    // ============================================
    // Se o evento não for emitido (por exemplo, se o fetch falhar),
    // tentamos inicializar após um delay

    function setupFallbackInit() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkInterval = setInterval(function() {
            attempts++;
            
            // Se já inicializou, parar
            if (State.loaded) {
                clearInterval(checkInterval);
                return;
            }

            // Tentar inicializar
            if (initialize()) {
                clearInterval(checkInterval);
                return;
            }

            // Limite atingido
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
            }
        }, 200);
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function start() {
        // Setup listener para o evento do index.html
        setupHeaderReadyListener();
        
        // Setup fallback
        setupFallbackInit();
    }

    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    // ============================================
    // ADAPTADOR HeaderInit (para compatibilidade)
    // ============================================
    window.HeaderInit = function() {
        return initialize();
    };

})();
