/**
 * Módulo Unificado de Header e Acessibilidade - VERSÃO CORRIGIDA
 * Substitui header.js com integração total ao AccessControl
 * Resolve conflitos entre módulos e corrige problemas de menu
 * Integração com EventBus para comunicação entre módulos
 * 
 * CORREÇÕES IMPLEMENTADAS:
 * - Botão aumentar fonte: 3 níveis (120%, 150%, 200%)
 * - Botão reduzir fonte: 3 níveis (100%, 120%, 150%)
 * - Toggle claro/escuro centralizado no accessibility-v2.js
 * - Skip buttons funcionando corretamente
 * - Mega-menus e menu hamburguer corrigidos
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
        // Níveis de fonte cycling - CORRIGIDO
        fontSizeLevels: [13, 16, 19, 24, 32], // 85%, 100%, 120%, 150%, 200%
        fontSizeLabels: ['85%', '100%', '120%', '150%', '200%'],
        // Níveis para AUMENTAR (apenas 3 níveis: 120%, 150%, 200%)
        increaseFontLevels: [19, 24, 32], // 120%, 150%, 200%
        increaseFontLabels: ['120%', '150%', '200%'],
        // Níveis para REDUZIR (apenas 3 níveis: 100%, 120%, 150%)
        decreaseFontLevels: [16, 19, 24], // 100%, 120%, 150%
        decreaseFontLabels: ['100%', '120%', '150%']
    };

    const State = {
        currentFontSize: Config.defaultFontSize,
        currentFontIndex: 1, // Começa em 100% (índice 1)
        isDarkMode: false,
        loaded: false,
        initializationComplete: false,
        activeMegaPanel: null,
        activeMobileSubmenu: null,
        currentLanguage: 'pt-br',
        eventBusReady: false,
        increaseFontIndex: 0, // Índice no array de aumentar (0 = 120%)
        decreaseFontIndex: 0  // Índice no array de reduzir (0 = 100%)
    };

    // ============================================
    // EVENTBUS INTEGRATION
    // ============================================
    function setupEventBusIntegration() {
        if (window.EventBus && window.EventBus.initialized) {
            registerEventBusListeners();
            State.eventBusReady = true;
        } else {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerEventBusListeners();
                State.eventBusReady = true;
                console.log('[Header] EventBus integration activated');
            });
        }
    }

    function registerEventBusListeners() {
        if (!window.EventBus) return;

        // Escutar eventos do ThemeManager
        window.EventBus.on('theme:changed', function(data) {
            const isDark = data.isDark || data.theme === 'dark';
            State.isDarkMode = isDark;
            updateThemeIcons(isDark);
            console.log('[Header] Tema atualizado via EventBus:', data.theme);
        }, { module: 'header' });

        // Escutar mudanças de fonte de outros módulos
        window.EventBus.on('font:changed', function(data) {
            if (data.size && data.size !== State.currentFontSize) {
                const newIndex = Config.fontSizeLevels.indexOf(data.size);
                if (newIndex !== -1) {
                    State.currentFontSize = data.size;
                    State.currentFontIndex = newIndex;
                    updateFontButtons();
                }
            }
        }, { module: 'header' });

        // Escutar mudanças de idioma
        window.EventBus.on('language:changed', function(data) {
            if (data.language && data.language !== State.currentLanguage) {
                State.currentLanguage = data.language;
                updateActiveLanguageIndicators(data.language);
                console.log('[Header] Idioma atualizado via EventBus:', data.language);
            }
        }, { module: 'header' });

        // Escutar eventos de accessibility
        window.EventBus.on('accessibility:settings:changed', function(data) {
            console.log('[Header] Configurações de acessibilidade alteradas via EventBus:', data);
        }, { module: 'header' });

        // Escutar comando para sincronizar estado
        window.EventBus.on('header:sync', function() {
            syncWithAccessControl();
            if (window.ThemeManager && typeof window.ThemeManager.isDark === 'function') {
                const isDark = window.ThemeManager.isDark();
                State.isDarkMode = isDark;
                updateThemeIcons(isDark);
            }
        }, { module: 'header' });
    }

    function emitHeaderEvent(eventName, data) {
        if (window.EventBus && State.eventBusReady) {
            window.EventBus.emit('header:' + eventName, {
                ...data,
                source: 'header',
                timestamp: Date.now()
            });
        }

        window.dispatchEvent(new CustomEvent('header:' + eventName, {
            detail: {
                ...data,
                source: 'header'
            }
        }));
    }

    function emitThemeEvent(isDark, theme) {
        const eventData = { isDark, theme, source: 'header', timestamp: Date.now() };

        if (window.EventBus && State.eventBusReady) {
            window.EventBus.emit('theme:changed', eventData);
        }

        window.dispatchEvent(new CustomEvent('theme:changed', { detail: eventData }));
    }

    function emitFontEvent(size, index) {
        const eventData = { size, index, source: 'header', timestamp: Date.now() };

        if (window.EventBus && State.eventBusReady) {
            window.EventBus.emit('font:changed', eventData);
        }

        window.dispatchEvent(new CustomEvent('font:changed', { detail: eventData }));
    }

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
    // ACESSIBILIDADE - SCREEN READER
    // ============================================
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
    // CONTROLE DE FONTE - CORRIGIDO
    // ============================================
    
    /**
     * AUMENTAR FONTE - 3 níveis (120%, 150%, 200%)
     * Ciclo: 120% → 150% → 200% → 120%
     */
    function increaseFontSize(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Avançar no índice do array de aumentar
        State.increaseFontIndex = (State.increaseFontIndex + 1) % Config.increaseFontLevels.length;
        const newSize = Config.increaseFontLevels[State.increaseFontIndex];
        
        // Encontrar índice no array completo
        const fullIndex = Config.fontSizeLevels.indexOf(newSize);
        applyFontSize(newSize, fullIndex);
    }

    /**
     * REDUZIR FONTE - 3 níveis (100%, 120%, 150%)
     * Ciclo: 150% → 120% → 100% → 150%
     */
    function decreaseFontSize(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Retroceder no índice do array de reduzir
        State.decreaseFontIndex = (State.decreaseFontIndex - 1 + Config.decreaseFontLevels.length) % Config.decreaseFontLevels.length;
        const newSize = Config.decreaseFontLevels[State.decreaseFontIndex];
        
        // Encontrar índice no array completo
        const fullIndex = Config.fontSizeLevels.indexOf(newSize);
        applyFontSize(newSize, fullIndex);
    }

    function applyFontSize(size, index) {
        // Usar tamanho ou índice fornecido
        if (size !== undefined) {
            State.currentFontSize = size;
        }
        if (index !== undefined) {
            State.currentFontIndex = index;
            State.currentFontSize = Config.fontSizeLevels[index];
        }

        const clampedSize = Math.max(Config.minFontSize, Math.min(Config.maxFontSize, State.currentFontSize));
        State.currentFontSize = clampedSize;

        // Atualizar índice baseado no tamanho aplicado
        State.currentFontIndex = Config.fontSizeLevels.indexOf(clampedSize);
        if (State.currentFontIndex === -1) {
            State.currentFontIndex = 1; // Fallback para 100%
            State.currentFontSize = Config.defaultFontSize;
        }

        // Aplicar ao documento
        document.documentElement.style.fontSize = clampedSize + 'px';
        document.documentElement.style.setProperty('--font-size-base', clampedSize + 'px');

        // Atualizar variável CSS global para consistência
        const scale = clampedSize / Config.defaultFontSize;
        document.documentElement.style.setProperty('--font-scale', scale.toString());

        // Atualizar estado do body para compatibilidade
        document.body.setAttribute('data-font-scale', scale.toString());
        document.body.setAttribute('data-font-size-index', State.currentFontIndex.toString());

        // Atualizar visualização dos botões
        updateFontButtons();

        // Salvar no storage
        saveFontSize();

        // Emitir evento de mudança de fonte via EventBus
        emitFontEvent(State.currentFontSize, State.currentFontIndex);

        // Feedback para leitores de tela
        const label = Config.fontSizeLabels[State.currentFontIndex] || '100%';
        announceToScreenReader(`Tamanho da fonte ajustado para ${label}`);
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

        // Mostrar nível atual nos botões
        const currentLabel = Config.fontSizeLabels[State.currentFontIndex] || '100%';
        
        increaseBtns.forEach(btn => {
            if (btn) {
                // Próximo nível ao aumentar
                const nextIncreaseIndex = (State.increaseFontIndex + 1) % Config.increaseFontLevels.length;
                const nextLabel = Config.increaseFontLabels[nextIncreaseIndex];
                btn.title = `Aumentar fonte para ${nextLabel}`;
                btn.setAttribute('aria-label', `Aumentar fonte para ${nextLabel}`);
            }
        });

        decreaseBtns.forEach(btn => {
            if (btn) {
                // Próximo nível ao reduzir
                const prevDecreaseIndex = (State.decreaseFontIndex - 1 + Config.decreaseFontLevels.length) % Config.decreaseFontLevels.length;
                const prevLabel = Config.decreaseFontLabels[prevDecreaseIndex];
                btn.title = `Reduzir fonte para ${prevLabel}`;
                btn.setAttribute('aria-label', `Reduzir fonte para ${prevLabel}`);
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
                btn.addEventListener('click', handler, { passive: false });
                btn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    handler();
                }, { passive: false });
            }
        });

        decreaseBtns.forEach(({ btn, handler }) => {
            if (btn) {
                btn.addEventListener('click', handler, { passive: false });
                btn.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    handler();
                }, { passive: false });
            }
        });

        updateFontButtons();
    }

    // ============================================
    // CONTROLE DE TEMA - DELEGADO AO ThemeManager
    // ============================================
    function toggleTheme(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Delegar ao ThemeManager
        if (window.ThemeManager && window.ThemeManager.toggle) {
            window.ThemeManager.toggle();
        } else {
            // Fallback
            State.isDarkMode = !State.isDarkMode;
            applyTheme(State.isDarkMode);
        }
    }

    function applyTheme(isDark) {
        State.isDarkMode = isDark;
        
        // Aplicar classe ao documento
        document.documentElement.classList.toggle('dark-theme', isDark);
        document.body.classList.toggle('dark-theme', isDark);
        
        // Atualizar ícone do tema desktop
        const themeToggle = getElement('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon', 'fa-sun');
                icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
            }
        }

        // Salvar no storage
        saveTheme();

        // Emitir evento de mudança de tema via EventBus
        emitThemeEvent(isDark, isDark ? 'dark' : 'light');

        // Feedback para leitores de tela
        const themeName = isDark ? 'escuro' : 'claro';
        announceToScreenReader(`Tema ${themeName} ativado`);
    }

    function updateThemeIcons(isDark) {
        const themeToggle = getElement('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon', 'fa-sun');
                icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
            }
        }
    }

    function initThemeControl() {
        const themeToggle = getElement('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Carregar tema salvo
        loadTheme();
        updateThemeIcons(State.isDarkMode);
    }

    // ============================================
    // SKIP BUTTONS
    // ============================================
    function initSkipButtons() {
        const skipButtons = {
            'skip-top': 'main-header',
            'skip-content': 'main-content',
            'skip-footer': 'footer'
        };

        Object.entries(skipButtons).forEach(([btnId, targetId]) => {
            const btn = getElement(btnId);
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = getElement(targetId);
                    if (target) {
                        target.focus();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        announceToScreenReader(`Navegando para ${btnId.replace('skip-', '')}`);
                    }
                });
            }
        });
    }

    // ============================================
    // MEGA MENUS
    // ============================================
    function initMegaMenus() {
        const megaMenuButtons = $$('[data-menu]');
        
        megaMenuButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleMegaMenu(this);
            });

            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMegaMenu(this);
                }
            });
        });

        // Fechar mega menus ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('[data-menu]') && !e.target.closest('.mega-panel')) {
                closeMegaMenus();
            }
        });
    }

    function toggleMegaMenu(btn) {
        const menuName = btn.getAttribute('data-menu');
        const panel = getElement(`mega-panel-${menuName}`);
        
        if (!panel) return;

        const isOpen = !btn.getAttribute('aria-expanded') || btn.getAttribute('aria-expanded') === 'false';
        
        if (isOpen) {
            closeMegaMenus();
            panel.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            State.activeMegaPanel = menuName;
        } else {
            panel.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            State.activeMegaPanel = null;
        }
    }

    function closeMegaMenus() {
        $$('[data-menu]').forEach(btn => {
            btn.setAttribute('aria-expanded', 'false');
        });
        $$('.mega-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        State.activeMegaPanel = null;
    }

    // ============================================
    // MENU HAMBURGUER
    // ============================================
    function initMobileMenu() {
        const hamburger = getElement('mobile-menu-toggle');
        const mobileNav = getElement('mobile-nav');
        
        if (!hamburger || !mobileNav) return;

        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Fechar ao clicar em links
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#mobile-menu-toggle') && !e.target.closest('#mobile-nav')) {
                closeMobileMenu();
            }
        });
    }

    function toggleMobileMenu() {
        const hamburger = getElement('mobile-menu-toggle');
        const mobileNav = getElement('mobile-nav');
        
        if (!hamburger || !mobileNav) return;

        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            mobileNav.classList.remove('hidden');
            hamburger.setAttribute('aria-expanded', 'true');
            announceToScreenReader('Menu aberto');
        }
    }

    function closeMobileMenu() {
        const hamburger = getElement('mobile-menu-toggle');
        const mobileNav = getElement('mobile-nav');
        
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        if (mobileNav) mobileNav.classList.add('hidden');
    }

    // ============================================
    // INICIALIZAÇÃO PRINCIPAL
    // ============================================
    function initHeader() {
        if (State.initializationComplete) return;

        console.log('[Header] Iniciando módulo de header');

        // Carregar preferências salvas
        loadFontSize();
        loadTheme();

        // Inicializar controles
        initFontControls();
        initThemeControl();
        initSkipButtons();
        initMegaMenus();
        initMobileMenu();

        // Configurar EventBus
        setupEventBusIntegration();

        State.initializationComplete = true;
        State.loaded = true;

        console.log('[Header] Módulo de header inicializado com sucesso');
    }

    // ============================================
    // AUTO-INICIALIZAÇÃO
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeader);
    } else {
        initHeader();
    }

    // Expor API pública
    window.HeaderModule = {
        init: initHeader,
        increaseFontSize: increaseFontSize,
        decreaseFontSize: decreaseFontSize,
        toggleTheme: toggleTheme,
        state: State
    };
})();
