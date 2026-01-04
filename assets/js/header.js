/**
 * Módulo Unificado de Acessibilidade e Header
 * Substitui header.js e integra com AccessControl
 */
(function() {
    "use strict";

    // ============================================
    // CONFIGURAÇÕES E ESTADO COMPARTILHADO
    // ============================================
    const Config = {
        defaultFontSize: 16,
        minFontSize: 12,
        maxFontSize: 24,
        fontStep: 2,
        fontStorageKey: "nursing_calc_font_size",
        themeStorageKey: "nursing_calc_theme",
        animationDuration: 300
    };

    const State = {
        currentFontSize: Config.defaultFontSize,
        isDarkMode: false,
        loaded: false
    };

    // Elementos DOM cacheados
    let cachedElements = {};

    // ============================================
    // UTILITÁRIOS
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

    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function announceToScreenReader(message) {
        let announcer = document.getElementById('sr-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }

    // ============================================
    // PERSISTÊNCIA DE DADOS
    // ============================================
    function saveFontSize() {
        try {
            localStorage.setItem(Config.fontStorageKey, State.currentFontSize.toString());
        } catch (e) {
            console.warn('[Header] Erro ao salvar tamanho da fonte:', e);
        }
    }

    function loadFontSize() {
        try {
            const saved = localStorage.getItem(Config.fontStorageKey);
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= Config.minFontSize && parsed <= Config.maxFontSize) {
                    State.currentFontSize = parsed;
                    return true;
                }
            }
        } catch (e) {
            console.warn('[Header] Erro ao carregar tamanho da fonte:', e);
        }
        State.currentFontSize = Config.defaultFontSize;
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
    // CONTROLE DE FONTE
    // ============================================
    function applyFontSize(size) {
        const clampedSize = Math.max(Config.minFontSize, Math.min(Config.maxFontSize, size));
        State.currentFontSize = clampedSize;
        
        // Aplicar ao root element
        document.documentElement.style.fontSize = State.currentFontSize + "px";
        
        // Atualizar variável CSS para consistência
        document.documentElement.style.setProperty('--font-size-base', clampedSize + 'px');
        
        // Atualizar botões
        updateFontButtons();
        saveFontSize();
        
        // Sincronizar com AccessControl se disponível
        if (window.AccessControl && window.AccessControl.state) {
            const scaleMap = { 16: 1, 18: 1.2, 20: 1.5, 24: 2.0 };
            const scale = scaleMap[clampedSize] || 1;
            document.documentElement.style.setProperty('--font-scale', scale);
            document.body.setAttribute('data-font-scale', scale);
        }
        
        announceToScreenReader(`Tamanho da fonte: ${clampedSize} pixels`);
    }

    function increaseFontSize(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyFontSize(State.currentFontSize + Config.fontStep);
    }

    function decreaseFontSize(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyFontSize(State.currentFontSize - Config.fontStep);
    }

    function updateFontButtons() {
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
                btn.disabled = State.currentFontSize >= Config.maxFontSize;
                btn.style.opacity = State.currentFontSize >= Config.maxFontSize ? '0.5' : '1';
            }
        });

        decreaseBtns.forEach(btn => {
            if (btn) {
                btn.disabled = State.currentFontSize <= Config.minFontSize;
                btn.style.opacity = State.currentFontSize <= Config.minFontSize ? '0.5' : '1';
            }
        });
    }

    function initFontControls() {
        const increaseBtns = [
            { btn: getElement('font-increase'), handler: increaseFontSize },
            { btn: getElement('mobile-font-increase'), handler: increaseFontSize }
        ];
        const decreaseBtns = [
            { btn: getElement('font-reduce'), handler: decreaseFontSize },
            { btn: getElement('mobile-font-reduce'), handler: decreaseFontSize }
        ];

        increaseBtns.forEach(({ btn, handler }) => {
            if (btn) {
                btn.addEventListener('click', handler);
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });

        decreaseBtns.forEach(({ btn, handler }) => {
            if (btn) {
                btn.addEventListener('click', handler);
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });

        updateFontButtons();
    }

    // ============================================
    // CONTROLE DE TEMA
    // ============================================
    function applyTheme(isDark) {
        State.isDarkMode = isDark;
        
        // Aplicar classe dark-theme ao body
        document.body.classList.toggle('dark-theme', isDark);
        
        // Atualizar ícones do tema desktop
        const themeToggle = getElement('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon', 'fa-sun');
                icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
            }
        }
        
        // Atualizar ícones do tema mobile
        const mobileThemeToggle = getElement('mobile-theme-toggle');
        if (mobileThemeToggle) {
            const sunIcon = mobileThemeToggle.querySelector('.theme-icon.sun');
            const moonIcon = mobileThemeToggle.querySelector('.theme-icon.moon');
            if (sunIcon) sunIcon.style.display = isDark ? 'inline' : 'none';
            if (moonIcon) moonIcon.style.display = isDark ? 'none' : 'inline';
        }

        // Sincronizar com AccessControl
        if (window.AccessControl && window.AccessControl.ThemeManager) {
            window.AccessControl.ThemeManager.applyTheme(isDark ? 'dark' : 'light');
        }

        saveTheme();
        
        const themeName = isDark ? 'escuro' : 'claro';
        announceToScreenReader(`Tema ${themeName} ativado`);
    }

    function toggleTheme(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyTheme(!State.isDarkMode);
    }

    function initThemeControls() {
        const desktopToggle = getElement('theme-toggle');
        const mobileToggle = getElement('mobile-theme-toggle');

        if (desktopToggle) {
            desktopToggle.addEventListener('click', toggleTheme);
        }

        if (mobileToggle) {
            mobileToggle.addEventListener('click', toggleTheme);
        }

        // Inicializar com o tema salvo ou detectar sistema
        if (State.isDarkMode) {
            applyTheme(true);
        }
    }

    // ============================================
    // SKIP LINKS
    // ============================================
    function setupSkipLinks() {
        function setupSkipLink(link, targetId) {
            if (!link || !targetId) return;
            
            const target = getElement(targetId);
            if (!target) return;
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                target.setAttribute('tabindex', '-1');
                target.focus();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }

        setupSkipLink(getElement('skip-top'), 'main-header');
        setupSkipLink(getElement('skip-content'), 'main-content');
        setupSkipLink(getElement('skip-footer'), 'footer');
    }

    // ============================================
    // MENU MOBILE
    // ============================================
    function initMobileMenu() {
        const menuToggle = getElement('mobile-menu-toggle');
        const menuClose = getElement('mobile-menu-close');
        const menuOverlay = getElement('mobile-menu-overlay');
        const mobileMenu = getElement('mobile-menu');

        function openMenu() {
            if (mobileMenu) {
                mobileMenu.classList.add('active');
                mobileMenu.setAttribute('aria-expanded', 'true');
            }
            if (menuOverlay) {
                menuOverlay.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
            
            if (menuToggle) {
                menuToggle.classList.add('active');
                menuToggle.setAttribute('aria-expanded', 'true');
            }
        }

        function closeMenu() {
            if (mobileMenu) {
                mobileMenu.classList.remove('active');
                mobileMenu.setAttribute('aria-expanded', 'false');
            }
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
            }
            document.body.style.overflow = '';
            
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        }

        function toggleMenu() {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        }

        // Event listeners
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }

        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }

        if (menuOverlay) {
            menuOverlay.addEventListener('click', closeMenu);
        }

        // Fechar com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Configurar submenus mobile
        setupMobileSubmenus();
    }

    function setupMobileSubmenus() {
        // Primeiro nível - itens principais do menu
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
                
                // Toggle estado atual
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                navItem.classList.toggle('active', !isExpanded);
                submenu.classList.toggle('active', !isExpanded);
                
                // Animar flecha
                const arrow = toggleBtn.querySelector('.submenu-arrow');
                if (arrow) {
                    const chevron = arrow.querySelector('i');
                    if (chevron) {
                        chevron.classList.toggle('fa-chevron-up', !isExpanded);
                        chevron.classList.toggle('fa-chevron-down', isExpanded);
                    }
                }
            });
        });

        // Segundo nível - submenus dentro dos submenus
        const submenuItems = $$('.mobile-submenu-item.has-mobile-submenu');
        
        submenuItems.forEach(subItem => {
            const toggleBtn = subItem.querySelector('.mobile-submenu-dropdown');
            const submenu = subItem.querySelector('.mobile-submenu.level-3');
            
            if (!toggleBtn || !submenu) return;
            
            // Adicionar indicador de "Voltar" se não existir
            let backIndicator = submenu.querySelector('.submenu-back-item');
            if (!backIndicator) {
                backIndicator = document.createElement('li');
                backIndicator.className = 'submenu-back-item';
                backIndicator.innerHTML = '<a href="#" class="submenu-back-link"><i class="fas fa-arrow-left"></i> Voltar</a>';
                backIndicator.style.cssText = 'display: none; padding: 12px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;';
                submenu.insertBefore(backIndicator, submenu.firstChild);
                
                // Evento do botão Voltar
                const backLink = backIndicator.querySelector('.submenu-back-link');
                if (backLink) {
                    backLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        subItem.classList.remove('active');
                        submenu.classList.remove('active');
                        backIndicator.style.display = 'none';
                        
                        // Mostrar submenu pai
                        const parentSubmenu = subItem.closest('.mobile-submenu');
                        if (parentSubmenu) {
                            parentSubmenu.classList.add('active');
                        }
                    });
                }
            }
            
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                
                // Fechar outros submenus do mesmo nível
                submenuItems.forEach(otherItem => {
                    if (otherItem !== subItem) {
                        const otherBtn = otherItem.querySelector('.mobile-submenu-dropdown');
                        const otherSubmenu = otherItem.querySelector('.mobile-submenu.level-3');
                        if (otherBtn && otherSubmenu) {
                            otherBtn.setAttribute('aria-expanded', 'false');
                            otherItem.classList.remove('active');
                            otherSubmenu.classList.remove('active');
                            
                            const back = otherSubmenu.querySelector('.submenu-back-item');
                            if (back) back.style.display = 'none';
                        }
                    }
                });
                
                // Toggle estado atual
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                subItem.classList.toggle('active', !isExpanded);
                submenu.classList.toggle('active', !isExpanded);
                backIndicator.style.display = !isExpanded ? 'block' : 'none';
                
                // Ocultar submenu pai
                const parentSubmenu = subItem.closest('.mobile-submenu');
                if (parentSubmenu && !isExpanded) {
                    parentSubmenu.classList.remove('active');
                }
                
                // Animar flecha
                const arrow = toggleBtn.querySelector('.submenu-arrow');
                if (arrow) {
                    const chevron = arrow.querySelector('i');
                    if (chevron) {
                        chevron.classList.toggle('fa-chevron-up', !isExpanded);
                        chevron.classList.toggle('fa-chevron-down', isExpanded);
                    }
                }
            });
        });
    }

    // ============================================
    // MEGA MENU DESKTOP
    // ============================================
    function initMegaMenu() {
        const megaMenuItems = $$('.has-mega-menu');
        
        if (megaMenuItems.length === 0) return;
        
        let hoverTimeout;
        let currentOpenPanel = null;
        let currentOpenTrigger = null;

        function showPanel(trigger, panel) {
            // Fechar painel atual
            if (currentOpenPanel && currentOpenPanel !== panel) {
                currentOpenPanel.classList.remove('active');
            }
            if (currentOpenTrigger && currentOpenTrigger !== trigger) {
                currentOpenTrigger.setAttribute('aria-expanded', 'false');
                currentOpenTrigger.classList.remove('active');
            }
            
            // Abrir novo painel
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
            document.body.classList.remove('mega-menu-active');
            
            if (currentOpenPanel === panel) {
                currentOpenPanel = null;
            }
            if (currentOpenTrigger === trigger) {
                currentOpenTrigger = null;
            }
        }

        function handleMouseEnter(e) {
            const trigger = e.currentTarget;
            const panel = trigger.closest('.has-mega-menu').querySelector('.mega-panel');
            
            if (!panel) return;
            
            clearTimeout(hoverTimeout);
            
            if (window.matchMedia('(min-width: 1025px)').matches) {
                showPanel(trigger, panel);
            }
        }

        function handleMouseLeave(e) {
            const trigger = e.currentTarget;
            const panel = trigger.closest('.has-mega-menu').querySelector('.mega-panel');
            
            if (!panel) return;
            
            hoverTimeout = setTimeout(() => {
                if (currentOpenPanel === panel) {
                    hidePanel(trigger, panel);
                }
            }, 150);
        }

        function handleClick(e) {
            const trigger = e.currentTarget;
            const panel = trigger.closest('.has-mega-menu').querySelector('.mega-panel');
            
            if (!panel) return;
            
            if (window.matchMedia('(max-width: 1024px)').matches) {
                e.preventDefault();
                
                const isActive = panel.classList.contains('active');
                
                // Fechar todos primeiro
                megaMenuItems.forEach(item => {
                    const p = item.querySelector('.mega-panel');
                    const t = item.querySelector('.nav-link-dropdown');
                    if (p && t) {
                        p.classList.remove('active');
                        t.setAttribute('aria-expanded', 'false');
                        t.classList.remove('active');
                    }
                });
                
                if (!isActive) {
                    showPanel(trigger, panel);
                }
            }
        }

        function handlePanelMouseEnter() {
            clearTimeout(hoverTimeout);
        }

        function handlePanelMouseLeave(e) {
            const panel = e.currentTarget;
            const trigger = panel.closest('.has-mega-menu').querySelector('.nav-link-dropdown');
            
            if (trigger) {
                hoverTimeout = setTimeout(() => {
                    hidePanel(trigger, panel);
                }, 150);
            }
        }

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                if (currentOpenPanel) {
                    hidePanel(currentOpenTrigger, currentOpenPanel);
                }
            }
        }

        // Aplicar event listeners a cada item do mega menu
        megaMenuItems.forEach(item => {
            const trigger = item.querySelector('.nav-link-dropdown');
            const panel = item.querySelector('.mega-panel');
            
            if (!trigger || !panel) return;
            
            trigger.addEventListener('mouseenter', handleMouseEnter);
            trigger.addEventListener('mouseleave', handleMouseLeave);
            trigger.addEventListener('click', handleClick);
            trigger.addEventListener('focus', handleMouseEnter);
            
            panel.addEventListener('mouseenter', handlePanelMouseEnter);
            panel.addEventListener('mouseleave', handlePanelMouseLeave);
        });

        // Event listener global para ESC
        document.addEventListener('keydown', handleKeyDown);

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.has-mega-menu') && currentOpenPanel) {
                megaMenuItems.forEach(item => {
                    const panel = item.querySelector('.mega-panel');
                    const trigger = item.querySelector('.nav-link-dropdown');
                    if (panel && trigger) {
                        hidePanel(trigger, panel);
                    }
                });
            }
        });
    }

    // ============================================
    // MENU TABS (DENTRO DOS MEGA PANELS)
    // ============================================
    function initMenuTabs() {
        const tabContainers = $$('.menu-tabs');
        
        tabContainers.forEach(container => {
            if (!container || !container.parentElement) return;
            
            const parent = container.parentElement.parentElement;
            if (!parent) return;
            
            const tabContents = parent.querySelectorAll('.tab-content');
            const triggers = container.querySelectorAll('.menu-tab-trigger');
            
            triggers.forEach(trigger => {
                trigger.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Atualizar triggers
                    triggers.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-selected', 'true');
                    
                    // Atualizar conteúdos
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === 'tab-' + tabId) {
                            content.classList.add('active');
                        }
                    });
                });
            });
        });
    }

    // ============================================
    // SELETOR DE IDIOMA
    // ============================================
    function initLanguageSelector() {
        // Desktop mega panel
        const languageLinks = $$('.mega-panel-idiomas .idiomas-list li a');
        const activeLangFlag = getElement('active-lang-flag');
        
        if (languageLinks.length > 0) {
            languageLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    languageLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    const flagImg = this.querySelector('.idioma-flag-link');
                    if (flagImg && activeLangFlag) {
                        activeLangFlag.src = flagImg.src;
                        activeLangFlag.alt = flagImg.alt;
                    }
                    
                    // Fechar mega panel
                    const megaPanel = this.closest('.mega-panel');
                    if (megaPanel) {
                        megaPanel.classList.remove('active');
                    }
                    
                    const trigger = document.querySelector('[data-menu="idiomas"]');
                    if (trigger) {
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }

        // Mobile language section
        const mobileIdiomasSection = getElement('mobile-idiomas-section');
        const mobileIdiomasToggle = getElement('mobile-idiomas-toggle');
        const mobileIdiomasList = getElement('mobile-idiomas-list');
        const mobileIdiomasArrow = getElement('mobile-idiomas-arrow');
        
        if (mobileIdiomasToggle && mobileIdiomasList) {
            mobileIdiomasToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = mobileIdiomasSection.classList.contains('expanded');
                mobileIdiomasSection.classList.toggle('expanded', !isExpanded);
                mobileIdiomasList.style.display = isExpanded ? 'none' : 'grid';
                mobileIdiomasToggle.setAttribute('aria-expanded', !isExpanded);
                
                if (mobileIdiomasArrow) {
                    mobileIdiomasArrow.classList.toggle('fa-chevron-down', isExpanded);
                    mobileIdiomasArrow.classList.toggle('fa-chevron-up', !isExpanded);
                }
            });
        }

        // Mobile language selection
        const languageFlagItems = $$('.language-flag-item');
        const mobileIdiomasCurrent = getElement('mobile-idiomas-current');
        
        languageFlagItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                languageFlagItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const img = this.querySelector('img');
                if (img && mobileIdiomasCurrent) {
                    mobileIdiomasCurrent.innerHTML = img.outerHTML + '<span>' + img.alt + '</span>';
                }
                
                // Salvar idioma no localStorage
                try {
                    const lang = this.getAttribute('data-lang');
                    localStorage.setItem('nursing_calc_lang', lang);
                } catch (err) {
                    console.warn('[Header] Erro ao salvar idioma:', err);
                }
                
                // Fechar a lista
                if (mobileIdiomasSection && mobileIdiomasList) {
                    mobileIdiomasSection.classList.remove('expanded');
                    mobileIdiomasList.style.display = 'none';
                    if (mobileIdiomasToggle) {
                        mobileIdiomasToggle.setAttribute('aria-expanded', 'false');
                    }
                    if (mobileIdiomasArrow) {
                        mobileIdiomasArrow.classList.add('fa-chevron-down');
                        mobileIdiomasArrow.classList.remove('fa-chevron-up');
                    }
                }
            });
        });

        // Initialize saved language
        try {
            const savedLang = localStorage.getItem('nursing_calc_lang') || 'pt-br';
            const activeItem = mobileIdiomasList?.querySelector('[data-lang="' + savedLang + '"]');
            if (activeItem) {
                activeItem.classList.add('active');
                const img = activeItem.querySelector('img');
                if (img && mobileIdiomasCurrent) {
                    mobileIdiomasCurrent.innerHTML = img.outerHTML + '<span>' + img.alt + '</span>';
                }
            }
        } catch (err) {
            console.warn('[Header] Erro ao carregar idioma ativo:', err);
        }
    }

    // ============================================
    // BUSCA MOBILE
    // ============================================
    function initMobileSearch() {
        const searchToggle = getElement('mobile-search-toggle');
        const searchContainer = getElement('mobile-search-container');
        const searchInput = getElement('mobile-menu-search-input');
        
        if (!searchToggle || !searchContainer) return;
        
        function toggleSearch() {
            const isExpanded = searchContainer.classList.contains('expanded');
            searchContainer.classList.toggle('expanded', !isExpanded);
            searchToggle.classList.toggle('active', !isExpanded);
            searchToggle.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded && searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }

        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSearch();
        });

        // Fechar ao pressionar ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchContainer.classList.contains('expanded')) {
                toggleSearch();
            }
        });
    }

    // ============================================
    // SEARCH DESKTOP
    // ============================================
    function initSearch() {
        const searchContainer = $('.search-container');
        if (!searchContainer) return;
        
        const searchInput = searchContainer.querySelector('.search-input');
        const searchBtn = searchContainer.querySelector('.search-btn');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query) {
                    console.log('[Search] Buscando:', query);
                    // Implementar busca real aqui
                }
            });

            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });
        }
    }

    // ============================================
    // HEADER SCROLL EFFECTS
    // ============================================
    function initScrollEffects() {
        const header = $('.main-header');
        if (!header) return;
        
        let lastScrollY = 0;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.pageYOffset;
            
            // Add/remove scrolled class
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show on scroll
            if (scrollY > 100 && scrollY > lastScrollY) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            
            lastScrollY = scrollY;
            ticking = false;
        }

        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        updateHeader();
    }

    // ============================================
    // INICIALIZAÇÃO PRINCIPAL
    // ============================================
    function initialize() {
        if (State.loaded) return;
        
        console.log('[HeaderModule] Inicializando módulo unificado...');
        
        // Carregar estados salvos
        loadFontSize();
        loadTheme();
        
        // Aplicar configurações iniciais
        document.documentElement.style.fontSize = State.currentFontSize + 'px';
        if (State.isDarkMode) {
            document.body.classList.add('dark-theme');
        }
        
        // Inicializar controles
        initFontControls();
        initThemeControls();
        setupSkipLinks();
        initMobileMenu();
        initMegaMenu();
        initMenuTabs();
        initLanguageSelector();
        initMobileSearch();
        initSearch();
        initScrollEffects();
        
        State.loaded = true;
        console.log('[HeaderModule] Módulo inicializado com sucesso');
    }

    // Expor API pública
    window.HeaderModule = {
        init: function() {
            State.loaded = false;
            initialize();
        },
        setFontSize: function(size) {
            applyFontSize(size);
        },
        increaseFontSize: function() {
            increaseFontSize();
        },
        decreaseFontSize: function() {
            decreaseFontSize();
        },
        toggleTheme: function() {
            toggleTheme();
        },
        getFontSize: function() {
            return State.currentFontSize;
        },
        isDarkMode: function() {
            return State.isDarkMode;
        }
    };

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
