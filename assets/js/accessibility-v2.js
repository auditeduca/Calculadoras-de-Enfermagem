/**
 * Accessibility Widget Module - VERSÃO CORRIGIDA
 * Gerencia o painel de acessibilidade e recursos de acessibilidade
 * Lógica centralizada de tema claro/escuro
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES E CONSTANTES
    // ==========================================
    const CONFIG = {
        storageKeys: {
            settings: "ce_accessibility_settings",
            theme: "ce_theme"
        },
        fontSizeLevels: [13, 16, 19, 24, 32], // 85%, 100%, 120%, 150%, 200%
        fontSizeLabels: ["85%", "100%", "120%", "150%", "200%"],
        fontSizePercentages: [85, 100, 120, 150, 200]
    };

    // ==========================================
    // ESTADO DO MÓDULO
    // ==========================================
    const state = {
        elements: {},
        initialized: false,
        isPanelOpen: false,
        isLibrasActive: false,
        eventBusReady: false,
        currentFontIndex: 1, // Começa em 100% (índice 1)
        isDarkMode: false,
        // Estado atual dos recursos (false = desativado, true = ativado)
        currentSettings: {
            fontSize: 1,
            contrast: "normal",
            colorblind: "none",
            saturation: "normal",
            cursor: "normal",
            readingGuide: "none",
            highlightLinks: false,
            highlightHeaders: false,
            boldText: false,
            stopAnim: false,
            hideImages: false,
            readingMode: false
        }
    };

    // ==========================================
    // THEME MANAGER - LÓGICA CENTRALIZADA
    // ==========================================
    const ThemeManager = {
        isDarkMode: false,

        init: function() {
            this.loadTheme();
            this.applyTheme(this.isDarkMode ? 'dark' : 'light');
        },

        loadTheme: function() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKeys.theme);
                if (saved) {
                    this.isDarkMode = saved === 'dark';
                } else {
                    // Detectar preferência do sistema
                    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
            } catch (e) {
                console.warn('[Accessibility] Erro ao carregar tema:', e);
                this.isDarkMode = false;
            }
        },

        saveTheme: function() {
            try {
                localStorage.setItem(CONFIG.storageKeys.theme, this.isDarkMode ? 'dark' : 'light');
            } catch (e) {
                console.warn('[Accessibility] Erro ao salvar tema:', e);
            }
        },

        applyTheme: function(theme) {
            const isDark = theme === 'dark';
            this.isDarkMode = isDark;
            
            // Aplicar classe ao documento
            document.documentElement.classList.toggle('dark-theme', isDark);
            document.body.classList.toggle('dark-theme', isDark);
            
            // Atualizar atributo data
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            
            // Salvar preferência
            this.saveTheme();
            
            // Emitir evento
            emitThemeEvent(isDark, theme);
            
            // Feedback para leitores de tela
            const themeName = isDark ? 'escuro' : 'claro';
            announce(`Tema ${themeName} ativado`);
        },

        toggle: function() {
            this.applyTheme(this.isDarkMode ? 'light' : 'dark');
        },

        isDark: function() {
            return this.isDarkMode;
        }
    };

    // ==========================================
    // EVENTBUS INTEGRATION
    // ==========================================
    function setupAccessibilityEventBusIntegration() {
        if (!window.EventBus) {
            window.addEventListener('eventbus:ready', function onEventBusReady() {
                window.removeEventListener('eventbus:ready', onEventBusReady);
                registerAccessibilityEventBusListeners();
                state.eventBusReady = true;
                console.log('[Accessibility] EventBus integration activated');
            });
        } else {
            registerAccessibilityEventBusListeners();
            state.eventBusReady = true;
        }
    }

    function registerAccessibilityEventBusListeners() {
        if (!window.EventBus) return;

        // Escutar eventos de theme de outros módulos
        window.EventBus.on('theme:changed', function(data) {
            console.log('[Accessibility] Tema alterado detectado via EventBus:', data.theme);
            if (data.theme && data.theme !== (state.isDarkMode ? 'dark' : 'light')) {
                ThemeManager.applyTheme(data.theme);
            }
        }, { module: 'accessibility' });

        // Escutar eventos de fonte
        window.EventBus.on('font:changed', function(data) {
            console.log('[Accessibility] Fonte alterada detectada via EventBus:', data.size);
            if (data.size) {
                const newIndex = CONFIG.fontSizeLevels.indexOf(data.size);
                if (newIndex !== -1) {
                    state.currentFontIndex = newIndex;
                }
            }
        }, { module: 'accessibility' });

        // Escutar comandos de sync
        window.EventBus.on('accessibility:request-state', function(data) {
            // Enviar estado atual quando solicitado
            emitAccessibilityEvent('state:sync', { settings: state.currentSettings });
        }, { module: 'accessibility' });
    }

    function emitAccessibilityEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'accessibility',
            timestamp: Date.now()
        };

        // Emitir via EventBus
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('accessibility:' + eventName, eventData);
        }

        // Manter compatibilidade com CustomEvents legados
        window.dispatchEvent(new CustomEvent('accessibility:' + eventName, {
            detail: eventData
        }));
    }

    function emitSettingsChangedEvent(settings) {
        const eventData = {
            settings: settings,
            source: 'accessibility',
            timestamp: Date.now()
        };

        // Emitir via EventBus
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('accessibility:settings:changed', eventData);
        }

        // Manter compatibilidade com CustomEvents legados
        window.dispatchEvent(new CustomEvent('accessibility:settings:changed', {
            detail: eventData
        }));
    }

    function emitThemeEvent(isDark, theme) {
        const eventData = {
            isDark: isDark,
            theme: theme,
            source: 'accessibility',
            timestamp: Date.now()
        };

        // Emitir via EventBus
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('theme:changed', eventData);
        }

        // Manter compatibilidade com CustomEvents legados
        window.dispatchEvent(new CustomEvent('theme:changed', {
            detail: eventData
        }));
    }

    // ==========================================
    // FUNÇÕES DE UTILIDADE
    // ==========================================
    function log(message, type = "info") {
        const prefix = "[Accessibility]";
        console[`${type}`](`${prefix} ${message}`);
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function getElements(selectors) {
        const result = {};
        Object.entries(selectors).forEach(([key, selector]) => {
            result[key] = selector.startsWith("#")
                ? getElement(selector)
                : document.querySelectorAll(selector);
        });
        return result;
    }

    function announce(message) {
        const announcer = getElement("sr-announcer") || document.createElement("div");
        announcer.id = "sr-announcer";
        announcer.setAttribute("role", "status");
        announcer.setAttribute("aria-live", "polite");
        announcer.setAttribute("aria-atomic", "true");
        announcer.className = "sr-only";
        if (!announcer.parentElement) {
            document.body.appendChild(announcer);
        }
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 100);
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function initializeAccessibilityPanel() {
        if (state.initialized) return;
        
        state.elements = getElements({
            panel: "#accessibility-panel",
            toggle: "#accessibility-toggle",
            close: "#accessibility-close",
            cards: ".accessibility-card"
        });

        if (!state.elements.panel || !state.elements.toggle) {
            console.warn('[Accessibility] Painel ou toggle não encontrado');
            return;
        }

        // Inicializar tema
        ThemeManager.init();
        state.isDarkMode = ThemeManager.isDarkMode;

        // Configurar eventos
        setupAccessibilityEventBusIntegration();
        setupToggleButton();
        setupCloseButton();
        setupAccessibilityCards();
        setupLibrasToggle();
        setupSkipButtons();

        state.initialized = true;
        log('Painel de acessibilidade inicializado');
    }

    // ==========================================
    // TOGGLE DO PAINEL
    // ==========================================
    function setupToggleButton() {
        const toggle = state.elements.toggle;
        if (!toggle) return;

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleAccessibilityPanel();
        });
    }

    function toggleAccessibilityPanel() {
        const panel = state.elements.panel;
        if (!panel) return;

        state.isPanelOpen = !state.isPanelOpen;
        
        if (state.isPanelOpen) {
            panel.classList.remove('accessibility-panel-hidden');
            panel.removeAttribute('hidden');
            panel.setAttribute('aria-hidden', 'false');
            state.elements.toggle.setAttribute('aria-expanded', 'true');
            announce('Painel de acessibilidade aberto');
        } else {
            panel.classList.add('accessibility-panel-hidden');
            panel.setAttribute('hidden', '');
            panel.setAttribute('aria-hidden', 'true');
            state.elements.toggle.setAttribute('aria-expanded', 'false');
            announce('Painel de acessibilidade fechado');
        }
    }

    // ==========================================
    // BOTÃO FECHAR
    // ==========================================
    function setupCloseButton() {
        const closeBtn = state.elements.close;
        if (!closeBtn) return;

        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (state.isPanelOpen) {
                toggleAccessibilityPanel();
            }
        });
    }

    // ==========================================
    // CARTÕES DE ACESSIBILIDADE
    // ==========================================
    function setupAccessibilityCards() {
        const cards = state.elements.cards;
        if (!cards || cards.length === 0) return;

        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                handleAccessibilityAction(this);
            });

            // Acessibilidade com teclado
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAccessibilityAction(this);
                }
            });
        });
    }

    function handleAccessibilityAction(card) {
        const action = card.getAttribute('data-action');
        const param = card.getAttribute('data-param');

        switch (action) {
            case 'font-size':
                handleFontSizeAction(param);
                break;
            case 'contrast':
                handleContrastAction(param);
                break;
            case 'colorblind':
                handleColorblindAction(param);
                break;
            case 'saturation':
                handleSaturationAction(param);
                break;
            case 'cursor':
                handleCursorAction(param);
                break;
            case 'reading-guide':
                handleReadingGuideAction(param);
                break;
            case 'highlight-links':
                toggleHighlightLinks();
                break;
            case 'highlight-headers':
                toggleHighlightHeaders();
                break;
            case 'bold-text':
                toggleBoldText();
                break;
            case 'stop-anim':
                toggleStopAnimations();
                break;
            case 'hide-images':
                toggleHideImages();
                break;
            case 'reading-mode':
                toggleReadingMode();
                break;
            case 'reset':
                resetAccessibilitySettings();
                break;
            default:
                console.warn('[Accessibility] Ação desconhecida:', action);
        }
    }

    // ==========================================
    // CONTROLE DE FONTE
    // ==========================================
    function handleFontSizeAction(param) {
        let newIndex = state.currentFontIndex;

        switch (param) {
            case 'decrease':
                newIndex = Math.max(0, state.currentFontIndex - 1);
                break;
            case 'increase':
                newIndex = Math.min(CONFIG.fontSizeLevels.length - 1, state.currentFontIndex + 1);
                break;
            case 'reset':
                newIndex = 1; // 100%
                break;
        }

        applyFontSize(newIndex);
    }

    function applyFontSize(index) {
        state.currentFontIndex = Math.max(0, Math.min(CONFIG.fontSizeLevels.length - 1, index));
        const fontSize = CONFIG.fontSizeLevels[state.currentFontIndex];
        const percentage = CONFIG.fontSizePercentages[state.currentFontIndex];

        // Aplicar ao documento
        document.documentElement.style.fontSize = fontSize + 'px';
        document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');

        // Atualizar variável CSS global
        const scale = fontSize / 16;
        document.documentElement.style.setProperty('--font-scale', scale.toString());

        // Atualizar estado
        document.body.setAttribute('data-font-scale', scale.toString());
        document.body.setAttribute('data-font-size-index', state.currentFontIndex.toString());

        // Salvar no storage
        try {
            localStorage.setItem('ce_font_size', JSON.stringify({
                size: fontSize,
                index: state.currentFontIndex
            }));
        } catch (e) {
            console.warn('[Accessibility] Erro ao salvar tamanho da fonte:', e);
        }

        // Emitir evento
        window.dispatchEvent(new CustomEvent('font:changed', {
            detail: { size: fontSize, index: state.currentFontIndex }
        }));

        // Feedback
        announce(`Tamanho da fonte ajustado para ${percentage}%`);
    }

    // ==========================================
    // CONTROLES DE CONTRASTE E CORES
    // ==========================================
    function handleContrastAction(param) {
        state.currentSettings.contrast = param;
        document.body.setAttribute('data-contrast', param);
        announce(`Contraste alterado para ${param}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function handleColorblindAction(param) {
        state.currentSettings.colorblind = param;
        document.body.setAttribute('data-colorblind', param);
        announce(`Filtro de daltonismo: ${param}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function handleSaturationAction(param) {
        state.currentSettings.saturation = param;
        document.body.setAttribute('data-saturation', param);
        announce(`Saturação alterada para ${param}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    // ==========================================
    // CONTROLES DE CURSOR E GUIA
    // ==========================================
    function handleCursorAction(param) {
        state.currentSettings.cursor = param;
        document.body.setAttribute('data-cursor', param);
        announce(`Tamanho do cursor alterado para ${param}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function handleReadingGuideAction(param) {
        state.currentSettings.readingGuide = param;
        document.body.setAttribute('data-reading-guide', param);
        announce(`Guia de leitura: ${param}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    // ==========================================
    // TOGGLES DE RECURSOS
    // ==========================================
    function toggleHighlightLinks() {
        state.currentSettings.highlightLinks = !state.currentSettings.highlightLinks;
        document.body.classList.toggle('highlight-links', state.currentSettings.highlightLinks);
        announce(`Destaque de links ${state.currentSettings.highlightLinks ? 'ativado' : 'desativado'}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function toggleHighlightHeaders() {
        state.currentSettings.highlightHeaders = !state.currentSettings.highlightHeaders;
        document.body.classList.toggle('highlight-headers', state.currentSettings.highlightHeaders);
        announce(`Destaque de títulos ${state.currentSettings.highlightHeaders ? 'ativado' : 'desativado'}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function toggleBoldText() {
        state.currentSettings.boldText = !state.currentSettings.boldText;
        document.body.classList.toggle('bold-text', state.currentSettings.boldText);
        announce(`Texto em negrito ${state.currentSettings.boldText ? 'ativado' : 'desativado'}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function toggleStopAnimations() {
        state.currentSettings.stopAnim = !state.currentSettings.stopAnim;
        document.body.classList.toggle('stop-animations', state.currentSettings.stopAnim);
        announce(`Parar animações ${state.currentSettings.stopAnim ? 'ativado' : 'desativado'}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function toggleHideImages() {
        state.currentSettings.hideImages = !state.currentSettings.hideImages;
        document.body.classList.toggle('hide-images', state.currentSettings.hideImages);
        announce(`Esconder imagens ${state.currentSettings.hideImages ? 'ativado' : 'desativado'}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    function toggleReadingMode() {
        state.currentSettings.readingMode = !state.currentSettings.readingMode;
        document.body.classList.toggle('reading-mode', state.currentSettings.readingMode);
        announce(`Modo leitura ${state.currentSettings.readingMode ? 'ativado' : 'desativado'}`);
        emitSettingsChangedEvent(state.currentSettings);
    }

    // ==========================================
    // RESET DE CONFIGURAÇÕES
    // ==========================================
    function resetAccessibilitySettings() {
        state.currentSettings = {
            fontSize: 1,
            contrast: "normal",
            colorblind: "none",
            saturation: "normal",
            cursor: "normal",
            readingGuide: "none",
            highlightLinks: false,
            highlightHeaders: false,
            boldText: false,
            stopAnim: false,
            hideImages: false,
            readingMode: false
        };

        // Limpar classes
        document.body.className = '';
        
        // Resetar atributos
        document.body.removeAttribute('data-contrast');
        document.body.removeAttribute('data-colorblind');
        document.body.removeAttribute('data-saturation');
        document.body.removeAttribute('data-cursor');
        document.body.removeAttribute('data-reading-guide');

        // Resetar fonte
        applyFontSize(1);

        announce('Configurações de acessibilidade restauradas aos padrões');
        emitSettingsChangedEvent(state.currentSettings);
    }

    // ==========================================
    // LIBRAS TOGGLE
    // ==========================================
    function setupLibrasToggle() {
        const librasToggle = getElement('libras-toggle-top');
        if (!librasToggle) return;

        librasToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleLibras();
        });
    }

    function toggleLibras() {
        state.isLibrasActive = !state.isLibrasActive;
        
        if (state.isLibrasActive) {
            // Carregar VLibras se não estiver carregado
            if (!window.vLibras) {
                const script = document.createElement('script');
                script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
                script.onload = function() {
                    new window.VLibras.Widget('https://vlibras.gov.br/app');
                };
                document.head.appendChild(script);
            }
            announce('Tradutor de Libras ativado');
        } else {
            announce('Tradutor de Libras desativado');
        }
    }

    // ==========================================
    // SKIP BUTTONS
    // ==========================================
    function setupSkipButtons() {
        const skipButtons = {
            top: getElement('skip-top'),
            content: getElement('skip-content'),
            footer: getElement('skip-footer')
        };

        Object.entries(skipButtons).forEach(([key, btn]) => {
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleSkipButton(key, this);
                });

                btn.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSkipButton(key, this);
                    }
                });
            }
        });
    }

    function handleSkipButton(type, element) {
        let targetId;
        switch (type) {
            case 'top':
                targetId = 'main-header';
                break;
            case 'content':
                targetId = 'main-content';
                break;
            case 'footer':
                targetId = 'footer';
                break;
        }

        const target = getElement(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            announce(`Navegando para ${type}`);
        }
    }

    // ==========================================
    // EXPOSIÇÃO DA API PÚBLICA
    // ==========================================
    window.AccessibilityPanel = {
        init: initializeAccessibilityPanel,
        toggle: toggleAccessibilityPanel,
        ThemeManager: ThemeManager,
        state: state
    };

    // Expor ThemeManager globalmente para outros módulos
    window.ThemeManager = ThemeManager;

    // ==========================================
    // AUTO-INICIALIZAÇÃO
    // ==========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccessibilityPanel);
    } else {
        initializeAccessibilityPanel();
    }
})();
