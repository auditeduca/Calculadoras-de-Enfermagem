/**
 * Módulo de Acessibilidade - JavaScript
 */
(function() {
    'use strict';

    // ============================================
    // CONFIGURAÇÕES
    // ============================================
    const CONFIG = {
        storagePrefix: 'nursing_calc_a11y_',
        features: {
            fontSizeIncrease: { values: [1.2, 1.5, 2.0], default: 1, currentIndex: 0 },
            fontSizeDecrease: { values: [0.8, 0.5, 1.0], default: 1, currentIndex: 2 },
            fontStyle: { values: ['default', 'atkinson', 'newsreader', 'opendyslexic'], default: 'default' },
            bold: { type: 'toggle', default: false },
            lineHeight: { values: [1, 1.2, 1.5, 2.0], default: 1 },
            letterSpacing: { values: [1, 1.2, 1.5, 2.0], default: 1 },
            bigCursor: { values: [1, 1.5, 2, 2.5], default: 1 },
            readingMode: { type: 'toggle', default: false },
            readingMask: { values: ['sm', 'md', 'lg'], default: 'md', active: false },
            readingGuide: { values: ['azul', 'laranja', 'preto'], default: 'azul', active: false },
            highlightLinks: { type: 'toggle', default: false },
            highlightHeaders: { type: 'toggle', default: false },
            magnifier: { type: 'toggle', default: false },
            hideImages: { type: 'toggle', default: false },
            stopAnim: { type: 'toggle', default: false },
            stopSounds: { type: 'toggle', default: false },
            contrast: { values: ['default', 'inverted', 'dark', 'light'], default: 'default' },
            saturation: { values: ['default', 'low', 'high', 'mono'], default: 'default' },
            colorblind: { values: ['default', 'deuteranopia', 'protanopia', 'tritanopia'], default: 'default' },
            theme: { type: 'toggle', default: false }
        },
        fontIncreaseSteps: [1.2, 1.5, 2.0],
        fontDecreaseSteps: [0.8, 0.5, 1.0]
    };

    // ============================================
    // ESTADO
    // ============================================
    const state = {
        panelOpen: false,
        panelMinimized: false,
        settings: {},
        initialized: false
    };

    // ============================================
    // LOG
    // ============================================
    function log(msg) {
        console.log('[A11y]', msg);
    }

    function logError(msg) {
        console.error('[A11y]', msg);
    }

    // ============================================
    // PERSISTÊNCIA
    // ============================================
    function saveSetting(key, value) {
        try {
            localStorage.setItem(CONFIG.storagePrefix + key, JSON.stringify(value));
        } catch (e) {
            logError('Erro ao salvar: ' + key);
        }
    }

    function loadSetting(key, defaultValue) {
        try {
            const saved = localStorage.getItem(CONFIG.storagePrefix + key);
            if (saved !== null) {
                return JSON.parse(saved);
            }
        } catch (e) {
            logError('Erro ao carregar: ' + key);
        }
        return defaultValue;
    }

    function loadAllSettings() {
        Object.keys(CONFIG.features).forEach(key => {
            state.settings[key] = loadSetting(key, CONFIG.features[key].default);
        });
    }

    function saveAllSettings() {
        Object.keys(state.settings).forEach(key => {
            saveSetting(key, state.settings[key]);
        });
    }

    // ============================================
    // CONTROLE DO PAINEL
    // ============================================
    function togglePanel() {
        var panel = document.getElementById('a11y-panel');
        var toggleBtn = document.getElementById('a11y-toggle-btn');

        if (!panel) {
            logError('Painel não encontrado');
            return;
        }

        state.panelOpen = !state.panelOpen;

        log('Toggle panel: ' + (state.panelOpen ? 'abrindo' : 'fechando'));

        if (state.panelOpen) {
            panel.classList.remove('a11y-hidden');
            panel.removeAttribute('style');
            panel.setAttribute('aria-hidden', 'false');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
            log('Painel aberto');
        } else {
            panel.classList.add('a11y-hidden');
            panel.setAttribute('aria-hidden', 'true');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
            log('Painel fechado');
        }
    }

    function closePanel() {
        var panel = document.getElementById('a11y-panel');
        var toggleBtn = document.getElementById('a11y-toggle-btn');

        if (panel && !panel.classList.contains('a11y-hidden')) {
            panel.classList.add('a11y-hidden');
            panel.setAttribute('aria-hidden', 'true');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
            state.panelOpen = false;
            log('Painel fechado');
        }
    }

    function toggleMaximize() {
        var panel = document.getElementById('a11y-panel');
        if (!panel) return;

        var btn = panel.querySelector('.a11y-maximize-btn');
        var expandIcon = btn ? btn.querySelector('.fa-expand') : null;
        var compressIcon = btn ? btn.querySelector('.fa-compress-alt') : null;

        state.panelMinimized = !state.panelMinimized;
        panel.classList.toggle('a11y-minimized', state.panelMinimized);

        // Alternar ícones
        if (expandIcon && compressIcon) {
            if (state.panelMinimized) {
                expandIcon.style.display = 'none';
                compressIcon.style.display = 'block';
            } else {
                expandIcon.style.display = 'block';
                compressIcon.style.display = 'none';
            }
        }
    }

    // ============================================
    // RECURSOS DE ACESSIBILIDADE
    // ============================================
    function applySetting(feature, value) {
        state.settings[feature] = value;

        switch (feature) {
            case 'fontSizeIncrease':
                var increaseValues = CONFIG.fontIncreaseSteps;
                var increaseIndex = increaseValues.indexOf(state.settings.fontSizeIncrease);
                var nextIncreaseIndex = (increaseIndex + 1) % increaseValues.length;
                var newIncreaseValue = increaseValues[nextIncreaseIndex];
                state.settings.fontSizeIncrease = newIncreaseValue;
                // Aplicar aumento de fonte
                document.documentElement.style.setProperty('--a11y-font-scale', newIncreaseValue);
                document.body.setAttribute('data-a11y-font-scale', newIncreaseValue);
                // Resetar decrease quando aumentar
                state.settings.fontSizeDecrease = 1;
                break;
            case 'fontSizeDecrease':
                var decreaseValues = CONFIG.fontDecreaseSteps;
                var decreaseIndex = decreaseValues.indexOf(state.settings.fontSizeDecrease);
                var nextDecreaseIndex = (decreaseIndex + 1) % decreaseValues.length;
                var newDecreaseValue = decreaseValues[nextDecreaseIndex];
                state.settings.fontSizeDecrease = newDecreaseValue;
                // Aplicar redução de fonte
                document.documentElement.style.setProperty('--a11y-font-scale', newDecreaseValue);
                document.body.setAttribute('data-a11y-font-scale', newDecreaseValue);
                // Resetar increase quando reduzir
                state.settings.fontSizeIncrease = 1;
                break;
            case 'fontStyle':
                document.body.setAttribute('data-a11y-font', value);
                break;
            case 'bold':
                document.body.setAttribute('data-a11y-bold', value);
                break;
            case 'lineHeight':
                document.documentElement.style.setProperty('--a11y-line-height', value);
                document.body.setAttribute('data-a11y-line-height', value);
                break;
            case 'letterSpacing':
                var spacing = (value - 1) * 0.05;
                document.documentElement.style.setProperty('--a11y-letter-spacing', spacing + 'em');
                document.body.setAttribute('data-a11y-letter-spacing', spacing + 'em');
                break;
            case 'bigCursor':
                document.documentElement.style.setProperty('--a11y-cursor', "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + (48 * value) + "\" height=\"" + (48 * value) + "\" viewBox=\"0 0 24 24\"><path fill=\"%231A3E74\" d=\"M7 2l12 11.5-5.5 1.2 3.3 6-2.5 1.5-3.3-6L7 19V2z\"/></svg>') 0 0, auto");
                document.body.setAttribute('data-a11y-big-cursor', value > 1 ? 'true' : 'false');
                break;
            case 'readingMode':
                document.body.setAttribute('data-a11y-reading', value);
                break;
            case 'readingMask':
                toggleReadingMask(value);
                break;
            case 'readingGuide':
                toggleReadingGuide(value);
                break;
            case 'highlightLinks':
                document.body.setAttribute('data-a11y-links', value);
                break;
            case 'highlightHeaders':
                document.body.setAttribute('data-a11y-headers', value);
                break;
            case 'magnifier':
                document.body.setAttribute('data-a11y-magnifier', value);
                break;
            case 'hideImages':
                document.body.setAttribute('data-a11y-hide-images', value);
                break;
            case 'stopAnim':
                document.body.setAttribute('data-a11y-stop-anim', value);
                break;
            case 'stopSounds':
                toggleStopSounds(value);
                break;
            case 'contrast':
                document.body.setAttribute('data-a11y-contrast', value);
                break;
            case 'saturation':
                document.body.setAttribute('data-a11y-saturation', value);
                break;
            case 'colorblind':
                document.body.setAttribute('data-a11y-colorblind', value);
                break;
            case 'theme':
                document.body.setAttribute('data-a11y-theme', value);
                updateThemeIcon(value);
                break;
        }

        saveSetting(feature, value);
        updateButtonStates();
    }

    function cycleValue(feature) {
        var current = state.settings[feature];
        var featureConfig = CONFIG.features[feature];
        var values = featureConfig.values;
        var currentIndex = values.indexOf(current);
        var nextIndex = (currentIndex + 1) % values.length;
        var nextValue = values[nextIndex];

        applySetting(feature, nextValue);
    }

    function toggleSetting(feature) {
        applySetting(feature, !state.settings[feature]);
    }

    // ============================================
    // RECURSOS ESPECÍFICOS
    // ============================================
    var maskMoveHandler = null;
    var guideMoveHandler = null;

    function toggleReadingMask(size) {
        var maskTop = document.getElementById('a11y-mask-top');
        var maskBottom = document.getElementById('a11y-mask-bottom');
        var active = state.settings.readingMask && state.settings.readingMask !== false;

        if (maskTop && maskBottom) {
            maskTop.classList.toggle('a11y-active', active);
            maskBottom.classList.toggle('a11y-active', active);

            var heights = { sm: 80, md: 150, lg: 250 };
            var height = heights[state.settings.readingMask] || 150;

            if (maskMoveHandler) {
                document.removeEventListener('mousemove', maskMoveHandler);
                maskMoveHandler = null;
            }

            if (active) {
                maskMoveHandler = debounce(function(e) {
                    maskTop.style.height = (e.clientY - height/2) + 'px';
                    maskBottom.style.top = (e.clientY + height/2) + 'px';
                    maskBottom.style.height = (window.innerHeight - e.clientY - height/2) + 'px';
                });
                document.addEventListener('mousemove', maskMoveHandler);
            }
        }
    }

    function toggleReadingGuide(color) {
        var guide = document.getElementById('a11y-reading-guide');
        var active = state.settings.readingGuide && state.settings.readingGuide !== false;

        if (guide) {
            guide.classList.toggle('a11y-active', active);

            var colors = { azul: 'rgba(33, 150, 243, 0.3)', laranja: 'rgba(255, 152, 0, 0.3)', preto: 'rgba(0, 0, 0, 0.3)' };
            guide.style.backgroundColor = colors[state.settings.readingGuide] || colors.azul;

            if (guideMoveHandler) {
                document.removeEventListener('mousemove', guideMoveHandler);
                guideMoveHandler = null;
            }

            if (active) {
                guideMoveHandler = debounce(function(e) {
                    guide.style.top = (e.clientY - 20) + 'px';
                });
                document.addEventListener('mousemove', guideMoveHandler);
            }
        }
    }

    function toggleStopSounds(active) {
        var mediaElements = document.querySelectorAll('audio, video');
        for (var i = 0; i < mediaElements.length; i++) {
            mediaElements[i].muted = active;
            if (active) mediaElements[i].pause();
        }
        var iframes = document.querySelectorAll('iframe');
        for (var j = 0; j < iframes.length; j++) {
            try {
                if (active && iframes[j].src.indexOf('youtube') !== -1) {
                    iframes[j].setAttribute('data-original-src', iframes[j].src);
                    iframes[j].src = iframes[j].src + (iframes[j].src.indexOf('?') !== -1 ? '&' : '?') + 'mute=1';
                }
            } catch (e) {}
        }
    }

    function debounce(fn) {
        var delay = 16;
        var timeout;
        return function() {
            var args = arguments;
            var self = this;
            cancelAnimationFrame(timeout);
            timeout = requestAnimationFrame(function() {
                fn.apply(self, args);
            });
        };
    }

    // ============================================
    // UI - ATUALIZAÇÃO DE ESTADOS
    // ============================================
    function updateButtonStates() {
        var buttons = document.querySelectorAll('[data-a11y-feature]');
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var feature = btn.dataset.a11yFeature;
            var featureConfig = CONFIG.features[feature];
            var value = state.settings[feature];

            if (featureConfig.type === 'toggle') {
                btn.classList.toggle('a11y-active', value);
                btn.setAttribute('aria-pressed', value);
            } else {
                var values = featureConfig.values;
                var index = values.indexOf(value);
                btn.classList.toggle('a11y-active', index > 0);
                btn.setAttribute('aria-pressed', index > 0);
            }
        }
    }

    // ============================================
    // PAINEL DE ATALHOS
    // ============================================
    function showShortcutsModal() {
        var modal = document.getElementById('a11y-shortcuts-modal');
        if (!modal) return;

        renderShortcuts();
        modal.classList.remove('a11y-hidden');
        modal.classList.add('a11y-active');
        modal.removeAttribute('style');
        modal.setAttribute('aria-hidden', 'false');

        var closeBtn = modal.querySelector('.a11y-close-btn');
        if (closeBtn) closeBtn.focus();
    }

    function hideShortcutsModal() {
        var modal = document.getElementById('a11y-shortcuts-modal');
        if (!modal) return;

        modal.classList.remove('a11y-active');
        modal.classList.add('a11y-hidden');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    }

    function renderShortcuts() {
        var list = document.getElementById('a11y-shortcuts-list');
        if (!list) return;

        var shortcuts = [
            { keys: 'Alt+1', desc: 'Abrir menu' },
            { keys: 'Alt+2', desc: 'Aumentar fonte' },
            { keys: 'Alt+3', desc: 'Diminuir fonte' },
            { keys: 'Alt+4', desc: 'Contraste' },
            { keys: 'Alt+5', desc: 'Guia leitura' },
            { keys: 'Escape', desc: 'Fechar' }
        ];

        var html = '';
        for (var i = 0; i < shortcuts.length; i++) {
            html += '<div class="a11y-shortcut-item"><kbd>' + shortcuts[i].keys + '</kbd><span>' + shortcuts[i].desc + '</span></div>';
        }
        list.innerHTML = html;
    }

    // ============================================
    // GLOSSÁRIO DE TERMOS DE ENFERMAGEM
    // ============================================
    var glossaryData = [];
    var glossaryLoaded = false;

    function loadGlossaryData() {
        if (glossaryLoaded) return Promise.resolve(glossaryData);

        return fetch('assets/data/glossario.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Erro ao carregar glossário');
                }
                return response.json();
            })
            .then(function(data) {
                glossaryData = data.glossario || [];
                glossaryLoaded = true;
                return glossaryData;
            })
            .catch(function(error) {
                logError('Erro ao carregar glossário: ' + error.message);
                return [];
            });
    }

    function renderGlossaryTerms(terms, searchTerm) {
        var list = document.getElementById('a11y-glossary-list');
        if (!list) return;

        if (!terms || terms.length === 0) {
            list.innerHTML = '<div class="a11y-glossary-empty">Nenhum termo encontrado</div>';
            return;
        }

        var html = '';
        var searchLower = searchTerm ? searchTerm.toLowerCase() : '';

        for (var i = 0; i < terms.length; i++) {
            var term = terms[i];
            var termoTermo = term.termo || '';
            var termoDefinicao = term.definicao || '';
            var termoCategoria = term.categoria || '';

            // Filtrar por termo de busca
            if (searchLower) {
                if (termoTermo.toLowerCase().indexOf(searchLower) === -1 &&
                    termoDefinicao.toLowerCase().indexOf(searchLower) === -1) {
                    continue;
                }
            }

            html += '<div class="a11y-glossary-item">';
            html += '<div class="a11y-glossary-category">' + escapeHtml(termoCategoria) + '</div>';
            html += '<div class="a11y-glossary-term">' + escapeHtml(termoTermo) + '</div>';
            html += '<div class="a11y-glossary-definition">' + escapeHtml(termoDefinicao) + '</div>';
            html += '</div>';
        }

        if (!html) {
            html = '<div class="a11y-glossary-empty">Nenhum termo encontrado para "' + escapeHtml(searchTerm) + '"</div>';
        }

        list.innerHTML = html;
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showGlossaryModal() {
        var modal = document.getElementById('a11y-glossary-modal');
        if (!modal) return;

        // Carregar dados do glossário se ainda não carregados
        if (!glossaryLoaded) {
            loadGlossaryData().then(function(terms) {
                renderGlossaryTerms(terms, '');
            });
        } else {
            renderGlossaryTerms(glossaryData, '');
        }

        modal.classList.remove('a11y-hidden');
        modal.classList.add('a11y-active');
        modal.removeAttribute('style');
        modal.setAttribute('aria-hidden', 'false');

        var searchInput = document.getElementById('a11y-glossary-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }

        var closeBtn = modal.querySelector('.a11y-close-btn');
        if (closeBtn) closeBtn.focus();
    }

    function hideGlossaryModal() {
        var modal = document.getElementById('a11y-glossary-modal');
        if (!modal) return;

        modal.classList.remove('a11y-active');
        modal.classList.add('a11y-hidden');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
    }

    function setupGlossarySearch() {
        var searchInput = document.getElementById('a11y-glossary-search');
        if (!searchInput) return;

        var debounceSearch = debounce(function() {
            var searchTerm = searchInput.value;
            renderGlossaryTerms(glossaryData, searchTerm);
        }, 300);

        searchInput.oninput = debounceSearch;
    }

    // ============================================
    // RESETAR TUDO
    // ============================================
    function resetAll() {
        Object.keys(CONFIG.features).forEach(function(key) {
            state.settings[key] = CONFIG.features[key].default;
        });

        var attrs = [
            'data-a11y-font-scale', 'data-a11y-font', 'data-a11y-bold',
            'data-a11y-line-height', 'data-a11y-letter-spacing',
            'data-a11y-big-cursor', 'data-a11y-reading', 'data-a11y-links',
            'data-a11y-headers', 'data-a11y-magnifier', 'data-a11y-hide-images',
            'data-a11y-stop-anim', 'data-a11y-contrast', 'data-a11y-saturation',
            'data-a11y-colorblind', 'data-a11y-theme'
        ];

        for (var a = 0; a < attrs.length; a++) {
            document.body.removeAttribute(attrs[a]);
        }

        var guide = document.getElementById('a11y-reading-guide');
        var maskTop = document.getElementById('a11y-mask-top');
        var maskBottom = document.getElementById('a11y-mask-bottom');
        var magnifier = document.getElementById('a11y-magnifier');

        if (guide) guide.classList.remove('a11y-active');
        if (maskTop) maskTop.classList.remove('a11y-active');
        if (maskBottom) maskBottom.classList.remove('a11y-active');
        if (magnifier) magnifier.classList.remove('a11y-active');

        if (maskMoveHandler) {
            document.removeEventListener('mousemove', maskMoveHandler);
            maskMoveHandler = null;
        }
        if (guideMoveHandler) {
            document.removeEventListener('mousemove', guideMoveHandler);
            guideMoveHandler = null;
        }

        updateButtonStates();
        saveAllSettings();
    }

    // ============================================
    // FUNÇÕES DE TEMA
    // ============================================
    function updateThemeIcon(isDark) {
        var themeIcons = document.querySelectorAll('#theme-toggle .fa-moon, #mobile-theme-toggle .fa-moon, #theme-toggle .fa-sun, #mobile-theme-toggle .fa-sun');
        themeIcons.forEach(function(icon) {
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    function toggleTheme() {
        var newValue = !state.settings.theme;
        state.settings.theme = newValue;
        document.body.setAttribute('data-a11y-theme', newValue);
        updateThemeIcon(newValue);
        saveSetting('theme', newValue);
        updateButtonStates();
    }

    // ============================================
    // FUNÇÕES DE FONTE DO HEADER
    // ============================================
    function increaseFont() {
        var increaseValues = CONFIG.fontIncreaseSteps;
        var currentIndex = increaseValues.indexOf(state.settings.fontSizeIncrease);
        var nextIndex = (currentIndex + 1) % increaseValues.length;
        var newValue = increaseValues[nextIndex];
        
        state.settings.fontSizeIncrease = newValue;
        state.settings.fontSizeDecrease = 1;
        
        document.documentElement.style.setProperty('--a11y-font-scale', newValue);
        document.body.setAttribute('data-a11y-font-scale', newValue);
        
        saveSetting('fontSizeIncrease', newValue);
        saveSetting('fontSizeDecrease', 1);
        updateButtonStates();
    }

    function decreaseFont() {
        var decreaseValues = CONFIG.fontDecreaseSteps;
        var currentIndex = decreaseValues.indexOf(state.settings.fontSizeDecrease);
        var nextIndex = (currentIndex + 1) % decreaseValues.length;
        var newValue = decreaseValues[nextIndex];
        
        state.settings.fontSizeDecrease = newValue;
        state.settings.fontSizeIncrease = 1;
        
        document.documentElement.style.setProperty('--a11y-font-scale', newValue);
        document.body.setAttribute('data-a11y-font-scale', newValue);
        
        saveSetting('fontSizeDecrease', newValue);
        saveSetting('fontSizeIncrease', 1);
        updateButtonStates();
    }

    // ============================================
    // CONFIGURAÇÃO DE EVENTOS
    // ============================================
    function setupEventListeners() {
        var toggleBtn = document.getElementById('a11y-toggle-btn');
        var panel = document.getElementById('a11y-panel');

        if (toggleBtn) {
            toggleBtn.onclick = togglePanel;
            log('Evento click adicionado ao botão toggle');
        } else {
            logError('Botão toggle não encontrado');
        }

        if (panel) {
            var closeBtn = panel.querySelector('.a11y-close-btn');
            var maximizeBtn = panel.querySelector('.a11y-maximize-btn');

            if (closeBtn) closeBtn.onclick = togglePanel;
            if (maximizeBtn) maximizeBtn.onclick = toggleMaximize;
        }

        // Botões do header - Controle de fonte
        var fontIncreaseBtn = document.getElementById('font-increase');
        var fontDecreaseBtn = document.getElementById('font-reduce');
        
        if (fontIncreaseBtn) {
            fontIncreaseBtn.onclick = increaseFont;
            log('Evento click adicionado ao botão aumentar fonte');
        }
        
        if (fontDecreaseBtn) {
            fontDecreaseBtn.onclick = decreaseFont;
            log('Evento click adicionado ao botão reduzir fonte');
        }

        // Botões do header - Tema claro/escuro
        var themeToggleBtn = document.getElementById('theme-toggle');
        var mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
        
        if (themeToggleBtn) {
            themeToggleBtn.onclick = toggleTheme;
            log('Evento click adicionado ao botão tema');
        }
        
        if (mobileThemeToggleBtn) {
            mobileThemeToggleBtn.onclick = toggleTheme;
            log('Evento click adicionado ao botão tema mobile');
        }

        // Atalhos de teclado
        document.onkeydown = function(e) {
            if (e.key === 'Escape') {
                var shortcutsModal = document.getElementById('a11y-shortcuts-modal');
                if (shortcutsModal && shortcutsModal.classList.contains('a11y-active')) {
                    hideShortcutsModal();
                    return;
                }
                if (state.panelOpen) {
                    closePanel();
                    return;
                }
            }

            if (e.altKey && e.key === '1') {
                e.preventDefault();
                togglePanel();
            }
        };

        // Cards de recursos
        var featureBtns = document.querySelectorAll('[data-a11y-feature]');
        for (var i = 0; i < featureBtns.length; i++) {
            featureBtns[i].onclick = function() {
                var feature = this.dataset.a11yFeature;
                var featureConfig = CONFIG.features[feature];

                if (featureConfig.type === 'toggle') {
                    toggleSetting(feature);
                } else {
                    cycleValue(feature);
                }
            };
        }

        // Botão de atalhos
        var showShortcutsBtn = document.querySelector('[data-a11y-action="show-shortcuts"]');
        if (showShortcutsBtn) showShortcutsBtn.onclick = showShortcutsModal;

        var closeShortcutsBtn = document.querySelector('[data-a11y-action="close-shortcuts"]');
        if (closeShortcutsBtn) closeShortcutsBtn.onclick = hideShortcutsModal;

        // Botão de glossário
        var showGlossaryBtn = document.querySelector('[data-a11y-action="show-glossary"]');
        if (showGlossaryBtn) showGlossaryBtn.onclick = showGlossaryModal;

        var closeGlossaryBtn = document.querySelector('[data-a11y-action="close-glossary"]');
        if (closeGlossaryBtn) closeGlossaryBtn.onclick = hideGlossaryModal;

        // Configurar busca do glossário
        setupGlossarySearch();

        // Fechar modal ao clicar fora
        var shortcutsModal = document.getElementById('a11y-shortcuts-modal');
        if (shortcutsModal) {
            shortcutsModal.onclick = function(e) {
                if (e.target.id === 'a11y-shortcuts-modal') {
                    hideShortcutsModal();
                }
            };
        }

        // Fechar modal de glossário ao clicar fora
        var glossaryModal = document.getElementById('a11y-glossary-modal');
        if (glossaryModal) {
            glossaryModal.onclick = function(e) {
                if (e.target.id === 'a11y-glossary-modal') {
                    hideGlossaryModal();
                }
            };
        }

        // Restaurar tudo
        var resetBtn = document.querySelector('[data-a11y-action="reset-all"]');
        if (resetBtn) resetBtn.onclick = resetAll;

        // Fechar painel ao clicar fora
        document.onclick = function(e) {
            if (!state.panelOpen) return;

            var panelEl = document.getElementById('a11y-panel');
            var widgets = document.getElementById('side-widgets');
            var modal = document.getElementById('a11y-shortcuts-modal');

            var clickedInsidePanel = panelEl && panelEl.contains(e.target);
            var clickedInsideWidgets = widgets && widgets.contains(e.target);
            var clickedInsideModal = modal && modal.contains(e.target);

            if (!clickedInsidePanel && !clickedInsideWidgets && !clickedInsideModal) {
                closePanel();
            }
        };

        log('Event listeners configurados');
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    function initialize() {
        if (state.initialized) {
            log('Já inicializado');
            return;
        }

        log('Inicializando...');

        var panel = document.getElementById('a11y-panel');
        var toggleBtn = document.getElementById('a11y-toggle-btn');
        var shortcutsModal = document.getElementById('a11y-shortcuts-modal');

        // Debug: log dos elementos encontrados
        log('Painel encontrado: ' + (panel ? 'sim' : 'não'));
        log('Botão toggle encontrado: ' + (toggleBtn ? 'sim' : 'não'));
        log('Modal de atalhos encontrado: ' + (shortcutsModal ? 'sim' : 'não'));

        if (panel) {
            panel.classList.add('a11y-hidden');
            panel.setAttribute('aria-hidden', 'true');
            state.panelOpen = false;
        } else {
            logError('Painel não encontrado durante inicialização');
        }

        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        if (shortcutsModal) {
            shortcutsModal.classList.add('a11y-hidden');
            shortcutsModal.setAttribute('aria-hidden', 'true');
            shortcutsModal.style.display = 'none';
        }

        // Inicializar modal de glossário
        var glossaryModal = document.getElementById('a11y-glossary-modal');
        if (glossaryModal) {
            glossaryModal.classList.add('a11y-hidden');
            glossaryModal.setAttribute('aria-hidden', 'true');
            glossaryModal.style.display = 'none';
        }

        loadAllSettings();

        Object.keys(state.settings).forEach(function(feature) {
            var value = state.settings[feature];
            var featureConfig = CONFIG.features[feature];

            if (featureConfig.type === 'toggle') {
                if (value && value !== featureConfig.default) {
                    applySetting(feature, value);
                }
            } else {
                if (value !== featureConfig.default) {
                    applySetting(feature, value);
                }
            }
        });

        setupEventListeners();
        updateButtonStates();

        state.initialized = true;
        log('Inicializado com sucesso');
    }

    // ============================================
    // INICIALIZAÇÃO AUTOMÁTICA - ROBUSTA
    // ============================================
    function start() {
        log('Iniciando módulo de acessibilidade...');

        // Estratégia 1: Verificar elementos imediatamente (caso já carregados)
        function tryInit() {
            if (document.getElementById('a11y-panel') && document.getElementById('a11y-toggle-btn')) {
                log('Elementos encontrados, inicializando imediatamente');
                initialize();
                return true;
            }
            return false;
        }

        if (tryInit()) return;

        // Estratégia 2: Escutar evento do EventBus
        function onModuleReady() {
            log('Evento module:accessibility-v2-container:ready recebido');
            // Pequeno delay para garantir que o DOM foi atualizado
            setTimeout(function() {
                if (!state.initialized) {
                    initialize();
                }
            }, 100);
        }

        // Registrar listener do EventBus
        if (window.EventBus) {
            window.EventBus.on('module:accessibility-v2-container:ready', onModuleReady, { module: 'accessibility' });
            log('Registrado listener do EventBus');
        } else {
            window.addEventListener('eventbus:ready', function() {
                window.EventBus.on('module:accessibility-v2-container:ready', onModuleReady, { module: 'accessibility' });
            });
            log('Aguardando EventBus estar pronto');
        }

        // Estratégia 3: Fallback com polling
        var attempts = 0;
        var maxAttempts = 100; // Aumentado para 10 segundos (100 x 100ms)
        var pollInterval = setInterval(function() {
            attempts++;
            
            if (state.initialized) {
                clearInterval(pollInterval);
                return;
            }
            
            if (tryInit()) {
                clearInterval(pollInterval);
                log('Inicializado via polling após ' + attempts + ' tentativas');
                return;
            }

            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                logError('Timeout: elementos não encontrados após ' + attempts + ' tentativas');
                // Tentar inicializar mesmo assim para debug
                initialize();
            }
        }, 100);
    }

    // API pública
    window.A11yModule = {
        init: initialize,
        togglePanel: togglePanel,
        closePanel: closePanel,
        reset: resetAll,
        getState: function() { return state; },
        isReady: function() { return state.initialized; }
    };

    // Iniciar
    start();
    log('Módulo carregado');

})();
