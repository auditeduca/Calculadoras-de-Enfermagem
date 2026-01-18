/**
 * Módulo de Controle de Acessibilidade (AccessControl)
 * Gerencia todas as funcionalidades de acessibilidade do site
 * Versão completa com suporte a daltonismo, TTS, glossário, atalhos de teclado e mais
 */

window.AccessControl = window.AccessControl || (function() {
    'use strict';

    // ============================================
    // ESTADO DO MÓDULO
    // ============================================
    const state = {
        fontSize: 0,
        fontStyle: 0,
        letterSpacing: 0,
        lineHeight: 0,
        readingMask: 0,
        readingGuide: 0,
        contrast: 0,
        colorblind: 0,
        saturation: 0,
        bigCursor: 0,
        ttsSpeed: 0,
        ttsActive: false,
        stopSounds: false,
        magnifierActive: false,
        theme: 'system',
        _initialized: false
    };

    // Elementos cacheados
    let elements = {};

    // Handlers de eventos
    let mouseMoveHandler = null;
    let readingGuideHandler = null;
    let magnifierHandler = null;
    let magnifierMoveHandler = null;
    let ttsClickHandler = null;

    // Dados do glossário
    let glossaryData = [];

    // ============================================
    // UTILITÁRIOS
    // ============================================
    function debounce(fn, delay = 16) {
        let timeout;
        return function(...args) {
            cancelAnimationFrame(timeout);
            timeout = requestAnimationFrame(() => fn.apply(this, args));
        };
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
    // NOMES PARA EXIBIÇÃO
    // ============================================
    const displayNames = {
        fontSize: { '1.2': '120%', '1.5': '150%', '2.0': '200%' },
        fontStyle: { atkinson: 'Atkinson', newsreader: 'Newsreader', opendyslexic: 'OpenDyslexic' },
        lineHeight: { '1.2': '120%', '1.5': '150%', '2.0': '200%' },
        letterSpacing: { '1.2': '120%', '1.5': '150%', '2.0': '200%' },
        contrast: { inverted: 'Invertido', 'dark-contrast': 'Escuro', 'light-contrast': 'Claro' },
        colorblind: { deuteranopia: 'Verde', protanopia: 'Vermelho', tritanopia: 'Azul' },
        saturation: { low: 'Baixa', high: 'Alta', monochrome: 'Mono' },
        readingMask: { sm: 'Pequeno', md: 'Medio', lg: 'Grande' },
        readingGuide: { azul: 'Azul', laranja: 'Laranja', preto: 'Preto' },
        bigCursor: { medium: '120%', large: '150%', xlarge: '200%' },
        tts: { normal: 'Normal', slow: 'Lento', fast: 'Rapido' }
    };

    // ============================================
    // CLASSES CSS SUPORTADAS
    // ============================================
    const allClasses = [
        'inverted', 'dark-contrast', 'light-contrast',
        'protanopia', 'deuteranopia', 'tritanopia',
        'saturation-low', 'saturation-high', 'monochrome',
        'highlight-links', 'highlight-headers', 'bold-text',
        'stop-anim', 'stop-sounds', 'hide-images',
        'font-atkinson', 'font-newsreader', 'font-opendyslexic',
        'reading-mode', 'glossary', 'magnifier-active',
        'reading-guide-azul', 'reading-guide-laranja', 'reading-guide-preto',
        'big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge'
    ];

    // ============================================
    // ATAJOS DE TECLADO POR NAVEGADOR
    // ============================================
    const shortcutsByBrowser = {
        chrome: [
            { keys: ['Alt', 'A'], desc: 'Abrir/Fechar menu acessibilidade' },
            { keys: ['Alt', '1'], desc: 'Aumentar fonte' },
            { keys: ['Alt', '2'], desc: 'Diminuir fonte' },
            { keys: ['Alt', 'C'], desc: 'Alto contraste' },
            { keys: ['Alt', 'L'], desc: 'Destacar links' },
            { keys: ['Alt', 'H'], desc: 'Destacar cabecalhos' },
            { keys: ['Alt', 'M'], desc: 'Mascara de leitura' },
            { keys: ['Alt', 'G'], desc: 'Guia de leitura' },
            { keys: ['Alt', 'R'], desc: 'Modo leitura' },
            { keys: ['Alt', 'T'], desc: 'Leitor TTS' },
            { keys: ['Alt', 'I'], desc: 'Esconder imagens' },
            { keys: ['Alt', '0'], desc: 'Restaurar tudo' },
            { keys: ['Esc'], desc: 'Fechar paineis' }
        ],
        firefox: [
            { keys: ['Alt', 'Shift', 'A'], desc: 'Abrir/Fechar menu acessibilidade' },
            { keys: ['Alt', 'Shift', '1'], desc: 'Aumentar fonte' },
            { keys: ['Alt', 'Shift', '2'], desc: 'Diminuir fonte' },
            { keys: ['Alt', 'Shift', 'C'], desc: 'Alto contraste' },
            { keys: ['Alt', 'Shift', 'L'], desc: 'Destacar links' },
            { keys: ['Alt', 'Shift', 'H'], desc: 'Destacar cabecalhos' },
            { keys: ['Alt', 'Shift', 'M'], desc: 'Mascara de leitura' },
            { keys: ['Alt', 'Shift', 'G'], desc: 'Guia de leitura' },
            { keys: ['Alt', 'Shift', 'R'], desc: 'Modo leitura' },
            { keys: ['Alt', 'Shift', 'T'], desc: 'Leitor TTS' },
            { keys: ['Alt', 'Shift', 'I'], desc: 'Esconder imagens' },
            { keys: ['Alt', 'Shift', '0'], desc: 'Restaurar tudo' },
            { keys: ['Esc'], desc: 'Fechar paineis' }
        ],
        safari: [
            { keys: ['Ctrl', 'Option', 'A'], desc: 'Abrir/Fechar menu acessibilidade' },
            { keys: ['Ctrl', 'Option', '1'], desc: 'Aumentar fonte' },
            { keys: ['Ctrl', 'Option', '2'], desc: 'Diminuir fonte' },
            { keys: ['Ctrl', 'Option', 'C'], desc: 'Alto contraste' },
            { keys: ['Ctrl', 'Option', 'L'], desc: 'Destacar links' },
            { keys: ['Ctrl', 'Option', 'H'], desc: 'Destacar cabecalhos' },
            { keys: ['Ctrl', 'Option', 'M'], desc: 'Mascara de leitura' },
            { keys: ['Ctrl', 'Option', 'G'], desc: 'Guia de leitura' },
            { keys: ['Ctrl', 'Option', 'R'], desc: 'Modo leitura' },
            { keys: ['Ctrl', 'Option', 'T'], desc: 'Leitor TTS' },
            { keys: ['Ctrl', 'Option', 'I'], desc: 'Esconder imagens' },
            { keys: ['Ctrl', 'Option', '0'], desc: 'Restaurar tudo' },
            { keys: ['Esc'], desc: 'Fechar paineis' }
        ]
    };

    // ============================================
    // GERENCIADOR DE TEMA
    // ============================================
    const ThemeManager = {
        detectSystemTheme() {
            return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        },

        getTheme() {
            return localStorage.getItem('acc_theme') || 'system';
        },

        applyTheme(theme) {
            const isDark = theme === 'dark' || (theme === 'system' && this.detectSystemTheme() === 'dark');
            document.body.classList.toggle('dark-theme', isDark);
            localStorage.setItem('acc_theme', theme);
            state.theme = theme;

            // Sincronizar com HeaderModule se disponível
            if (window.HeaderModule && typeof window.HeaderModule.toggleTheme === 'function') {
                window.HeaderModule.toggleTheme();
            }
        },

        init() {
            this.applyTheme(this.getTheme());
            window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.getTheme() === 'system') {
                    this.applyTheme('system');
                }
            });
        },

        resetToSystem() {
            localStorage.removeItem('acc_theme');
            this.applyTheme('system');
        }
    };

    // ============================================
    // VERIFICAÇÃO DE ELEMENTOS
    // ============================================
    function ensureElements() {
        if (elements.panel && document.body.contains(elements.panel)) {
            return true;
        }
        elements = {
            body: document.body,
            panel: document.getElementById('accessibility-panel'),
            sideWidgets: document.getElementById('side-widgets'),
            closeBtn: document.getElementById('close-panel-btn'),
            openBtn: document.getElementById('accessibility-btn'),
            shortcutsModal: document.getElementById('keyboard-shortcuts-modal'),
            magnifierTooltip: document.getElementById('magnifier-tooltip'),
            readingGuide: document.getElementById('reading-guide')
        };
        return !!elements.panel;
    }

    function isPanelClosed() {
        return !ensureElements() || elements.panel.classList.contains('accessibility-panel-hidden');
    }

    // ============================================
    // PERSISTÊNCIA DE ESTADO (Sob demanda - Regra Opt-In)
    // ============================================
    function saveState() {
        localStorage.setItem('accessControlState', JSON.stringify(state));
    }

    function loadSavedState() {
        // NÃO é chamado automaticamente - viola regra opt-in
        // Mantido para uso explícito quando usuário solicita restaurar
        try {
            const saved = JSON.parse(localStorage.getItem('accessControlState') || '{}');
            Object.assign(state, saved);
        } catch (e) {
            localStorage.removeItem('accessControlState');
        }
    }

    function restoreFromStorage() {
        // Função explícita para restaurar estado anterior
        // Usuário deve acionar esta função manualmente
        loadSavedState();
        
        // Aplicar recursos restaurados
        if (state.fontSize > 0) {
            const values = ['1.2', '1.5', '2.0'];
            applyFeature('fontSize', values[state.fontSize - 1]);
        }
        if (state.fontStyle > 0) {
            const values = ['atkinson', 'newsreader', 'opendyslexic'];
            applyFeature('fontStyle', values[state.fontStyle - 1]);
        }
        if (state.letterSpacing > 0) {
            const values = ['1.2', '1.5', '2.0'];
            applyFeature('letterSpacing', values[state.letterSpacing - 1]);
        }
        if (state.lineHeight > 0) {
            const values = ['1.2', '1.5', '2.0'];
            applyFeature('lineHeight', values[state.lineHeight - 1]);
        }
        if (state.contrast > 0) {
            const values = ['inverted', 'dark-contrast', 'light-contrast'];
            applyFeature('contrast', values[state.contrast - 1]);
        }
        if (state.colorblind > 0) {
            const values = ['deuteranopia', 'protanopia', 'tritanopia'];
            applyFeature('colorblind', values[state.colorblind - 1]);
        }
        if (state.saturation > 0) {
            const values = ['low', 'high', 'monochrome'];
            applyFeature('saturation', values[state.saturation - 1]);
        }
        if (state.bigCursor > 0) {
            const values = ['medium', 'large', 'xlarge'];
            applyFeature('bigCursor', values[state.bigCursor - 1]);
        }
        
        announceToScreenReader('Configurações de acessibilidade restauradas');
    }

    // ============================================
    // ATUALIZAÇÃO DE UI
    // ============================================
    function updateDots(element, level = 1) {
        element?.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i < level);
        });
    }

    function resetDots(element) {
        element?.querySelectorAll('.dot').forEach(dot => dot.classList.remove('active'));
    }

    function updateAriaPressed(element, isActive) {
        element?.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }

    // ============================================
    // CONTROLE DO PAINEL
    // ============================================
    function openPanel() {
        if (!ensureElements()) return;
        elements.panel.classList.remove('accessibility-panel-hidden');
        elements.sideWidgets?.classList.add('side-widgets-hidden');
        setTimeout(() => elements.closeBtn?.focus(), 100);
    }

    function closePanel() {
        if (!ensureElements() || isPanelClosed()) return;
        elements.panel.classList.add('accessibility-panel-hidden');
        elements.sideWidgets?.classList.remove('side-widgets-hidden');
        elements.openBtn?.focus();
    }

    function togglePanel() {
        isPanelClosed() ? openPanel() : closePanel();
    }

    function toggleMaximize() {
        ensureElements();
        elements.panel?.classList.toggle('panel-expanded');
    }

    // ============================================
    // ATAJOS DE TECLADO
    // ============================================
    function showKeyboardShortcuts() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) {
            modal.hidden = false;
            renderShortcuts('chrome');
            setupBrowserTabs();
            modal.querySelector('button')?.focus();
        }
    }

    function closeShortcutsModal() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        if (modal) modal.hidden = true;
    }

    function renderShortcuts(browser) {
        const list = document.getElementById('shortcuts-list');
        if (!list) return;
        const shortcuts = shortcutsByBrowser[browser] || shortcutsByBrowser.chrome;
        list.innerHTML = shortcuts.map(s => `
            <div class="shortcut-item">
                ${s.keys.map(k => `<kbd>${k}</kbd>`).join('+')}
                <span>${s.desc}</span>
            </div>
        `).join('');
    }

    function setupBrowserTabs() {
        document.querySelectorAll('.browser-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.browser-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderShortcuts(tab.dataset.browser);
            });
        });
    }

    // ============================================
    // CONTROLE DE RECURSOS SIMPLES (Com marcação de interação)
    // ============================================
    function toggleSimple(className, element) {
        if (!ensureElements()) return;
        
        // Marcar interação do usuário para regra opt-in
        if (window.AccessibilityRule) {
            AccessibilityRule.markUserInteraction();
        }
        
        const isActive = elements.body.classList.toggle(className);
        element?.classList.toggle('active', isActive);
        updateAriaPressed(element, isActive);
        updateDots(element, isActive ? 1 : 0);

        if (className === 'stop-sounds') toggleStopSounds(isActive);
        if (className === 'magnifier') toggleMagnifier(isActive);
        if (className === 'stop-anim') {
            // Apenas adicionar/remover classe CSS, sem estilos inline
            if (isActive) {
                document.body.classList.add('stop-anim');
            } else {
                document.body.classList.remove('stop-anim');
            }
            announceToScreenReader(isActive ? 'Animações pausadas' : 'Animações retomadas');
        }

        saveState();
    }

    // ============================================
    // CONTROLE DE ANIMAÇÕES
    // ============================================
    function toggleAnimations(active) {
        if (active) {
            document.body.classList.add('stop-anim-active');
            // Pausar todas as animações
            const animatedElements = document.querySelectorAll('*');
            animatedElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                if (computedStyle.animationName !== 'none') {
                    el.style.animationPlayState = 'paused';
                }
            });
            // Pausar transições
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                el.style.transitionPlayState = 'paused';
            });
        } else {
            document.body.classList.remove('stop-anim-active');
            // Retomar animações
            const animatedElements = document.querySelectorAll('*');
            animatedElements.forEach(el => {
                el.style.animationPlayState = '';
            });
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                el.style.transitionPlayState = '';
            });
        }
    }

    // ============================================
    // CICLO DE RECURSOS (Com marcação de interação)
    // ============================================
    function cycleFeature(feature, values, element) {
        if (!ensureElements()) return;

        // Marcar interação do usuário para regra opt-in
        if (window.AccessibilityRule) {
            AccessibilityRule.markUserInteraction();
        }
        
        state[feature] = ((state[feature] || 0) + 1) % (values.length + 1);
        const index = state[feature] - 1;
        const value = values[index];
        const badge = element?.querySelector('.level-badge');

        cleanupFeatureClasses(feature);

        if (index === -1) {
            element?.classList.remove('active');
            updateAriaPressed(element, false);
            if (badge) badge.style.display = 'none';
            resetDots(element);
            resetFeatureCSS(feature);
        } else {
            element?.classList.add('active');
            updateAriaPressed(element, true);
            updateDots(element, state[feature]);
            if (badge) {
                badge.textContent = displayNames[feature]?.[value] || value;
                badge.style.display = 'block';
            }
            applyFeature(feature, value);

            const featureNames = {
                fontSize: 'Tamanho de fonte',
                fontStyle: 'Estilo de fonte',
                letterSpacing: 'Espaçamento entre letras',
                lineHeight: 'Altura de linha',
                contrast: 'Contraste',
                colorblind: 'Modo daltonico',
                saturation: 'Saturacao',
                bigCursor: 'Cursor grande'
            };

            const name = featureNames[feature] || feature;
            const displayValue = displayNames[feature]?.[value] || value;
            announceToScreenReader(`${name}: ${displayValue}`);
        }

        // Disparar evento para sincronização com botões externos
        window.dispatchEvent(new CustomEvent('accessibility:featureChanged', {
            detail: { feature, value, isActive: index !== -1 }
        }));

        saveState();
    }

    function cleanupFeatureClasses(feature) {
        const classMap = {
            fontStyle: ['font-atkinson', 'font-newsreader', 'font-opendyslexic'],
            contrast: ['inverted', 'dark-contrast', 'light-contrast'],
            colorblind: ['protanopia', 'deuteranopia', 'tritanopia'],
            saturation: ['saturation-low', 'saturation-high', 'monochrome'],
            readingGuide: ['reading-guide-azul', 'reading-guide-laranja', 'reading-guide-preto'],
            bigCursor: ['big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge']
        };
        classMap[feature]?.forEach(cls => elements.body.classList.remove(cls));
    }

    function resetFeatureCSS(feature) {
        const resets = {
            fontSize: () => {
                document.documentElement.style.setProperty('--font-scale', '1');
                document.body.removeAttribute('data-font-scale');
                document.getElementById('accessibility-panel')?.classList.remove('font-large');
            },
            letterSpacing: () => document.documentElement.style.setProperty('--letter-spacing', '0'),
            lineHeight: () => document.documentElement.style.setProperty('--line-height', '1.6'),
            readingMask: () => toggleReadingMask(false),
            readingGuide: () => toggleReadingGuide(false),
            bigCursor: () => cleanupFeatureClasses('bigCursor')
        };
        resets[feature]?.();
    }

    function applyFeature(feature, value) {
        const actions = {
            fontSize: () => {
                document.documentElement.style.setProperty('--font-scale', value);
                document.body.setAttribute('data-font-scale', value);
                const panel = document.getElementById('accessibility-panel');
                if (panel) panel.classList.toggle('font-large', value === '2.0');
            },
            letterSpacing: () => {
                const spacing = (parseFloat(value) - 1) * 0.1;
                document.documentElement.style.setProperty('--letter-spacing', spacing + 'em');
            },
            lineHeight: () => {
                const height = 1.6 * parseFloat(value);
                document.documentElement.style.setProperty('--line-height', height);
            },
            fontStyle: () => elements.body.classList.add('font-' + value),
            contrast: () => elements.body.classList.add(value),
            colorblind: () => elements.body.classList.add(value),
            saturation: () => elements.body.classList.add(value === 'monochrome' ? 'monochrome' : `saturation-${value}`),
            readingMask: () => toggleReadingMask(true, value),
            readingGuide: () => toggleReadingGuide(true, value),
            bigCursor: () => elements.body.classList.add('big-cursor-' + value)
        };
        actions[feature]?.();
    }

    // ============================================
    // MÁSCARA DE LEITURA
    // ============================================
    function toggleReadingMask(active, size) {
        const maskTop = document.getElementById('reading-mask-top');
        const maskBottom = document.getElementById('reading-mask-bottom');
        if (!maskTop || !maskBottom) return;

        maskTop.style.display = active ? 'block' : 'none';
        maskBottom.style.display = active ? 'block' : 'none';

        if (mouseMoveHandler) {
            window.removeEventListener('mousemove', mouseMoveHandler);
            mouseMoveHandler = null;
        }

        if (active) {
            const height = size === 'sm' ? 60 : size === 'md' ? 120 : 200;
            mouseMoveHandler = debounce((e) => {
                maskTop.style.height = Math.max(0, e.clientY - height / 2) + 'px';
                maskBottom.style.top = (e.clientY + height / 2) + 'px';
            });
            window.addEventListener('mousemove', mouseMoveHandler);
            announceToScreenReader(`Mascara de leitura ativada: ${size === 'sm' ? 'pequena' : size === 'md' ? 'media' : 'grande'}`);
        }
    }

    // ============================================
    // GUIA DE LEITURA
    // ============================================
    function toggleReadingGuide(active, color) {
        const guide = document.getElementById('reading-guide');
        if (!guide) return;

        guide.style.display = active ? 'block' : 'none';
        guide.classList.remove('guide-azul', 'guide-laranja', 'guide-preto');
        elements.body.classList.remove('reading-guide-azul', 'reading-guide-laranja', 'reading-guide-preto');

        if (active && color) {
            guide.classList.add('guide-' + color);
            elements.body.classList.add('reading-guide-' + color);
        }

        if (readingGuideHandler) {
            window.removeEventListener('mousemove', readingGuideHandler);
            readingGuideHandler = null;
        }

        if (active) {
            readingGuideHandler = debounce((e) => {
                guide.style.top = e.clientY + 'px';
            });
            window.addEventListener('mousemove', readingGuideHandler);
            announceToScreenReader(`Guia de leitura ativado: cor ${color}`);
        }
    }

    // ============================================
    // LUPA DE CONTEÚDO - CORRIGIDA
    // ============================================
    function toggleMagnifier(active) {
        state.magnifierActive = active;
        
        // Garantir que o tooltip existe
        let tooltip = document.getElementById('magnifier-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'magnifier-tooltip';
            tooltip.className = 'magnifier-tooltip';
            tooltip.setAttribute('role', 'tooltip');
            tooltip.setAttribute('aria-hidden', 'true');
            document.body.appendChild(tooltip);
        }

        // Limpar handlers anteriores
        if (magnifierHandler) {
            document.removeEventListener('mouseover', magnifierHandler, true);
            magnifierHandler = null;
        }
        if (magnifierMoveHandler) {
            document.removeEventListener('mousemove', magnifierMoveHandler, true);
            magnifierMoveHandler = null;
        }

        if (active) {
            magnifierHandler = function(e) {
                const target = e.target;
                
                // Ignorar elementos de UI
                if (target.closest('#accessibility-panel') || 
                    target.closest('.side-widgets-container') || 
                    target.closest('#glossary-modal') || 
                    target.closest('.shortcuts-modal') || 
                    target.closest('.cookie-banner')) {
                    tooltip.style.display = 'none';
                    tooltip.setAttribute('aria-hidden', 'true');
                    return;
                }

                // Buscar texto visível
                let text = '';
                
                if (target.childNodes.length === 1 && target.childNodes[0].nodeType === Node.TEXT_NODE) {
                    text = target.textContent.trim();
                } else if (target.textContent) {
                    // Limpar tags HTML e pegar texto limpo
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = target.innerHTML;
                    text = tempDiv.textContent.trim();
                }

                if (text && text.length > 0 && text.length < 500) {
                    tooltip.textContent = text.length > 200 ? text.substring(0, 200) + '...' : text;
                    tooltip.style.display = 'block';
                    tooltip.setAttribute('aria-hidden', 'false');
                    
                    // Posicionar tooltip
                    const rect = target.getBoundingClientRect();
                    const tooltipRect = tooltip.getBoundingClientRect();
                    let x = rect.right + 15;
                    let y = rect.top;
                    
                    if (x + tooltipRect.width > window.innerWidth - 20) {
                        x = rect.left - tooltipRect.width - 15;
                    }
                    if (y + tooltipRect.height > window.innerHeight - 20) {
                        y = window.innerHeight - tooltipRect.height - 20;
                    }
                    
                    tooltip.style.left = Math.max(10, x) + 'px';
                    tooltip.style.top = Math.max(10, y) + 'px';
                } else {
                    tooltip.style.display = 'none';
                    tooltip.setAttribute('aria-hidden', 'true');
                }
            };

            magnifierMoveHandler = function(e) {
                if (tooltip.style.display === 'block') {
                    const x = e.clientX + 20;
                    const y = e.clientY + 20;
                    const tooltipRect = tooltip.getBoundingClientRect();
                    
                    if (x + tooltipRect.width > window.innerWidth - 10) {
                        tooltip.style.left = (e.clientX - tooltipRect.width - 20) + 'px';
                    } else {
                        tooltip.style.left = x + 'px';
                    }
                    
                    if (y + tooltipRect.height > window.innerHeight - 10) {
                        tooltip.style.top = (e.clientY - tooltipRect.height - 20) + 'px';
                    } else {
                        tooltip.style.top = y + 'px';
                    }
                }
            };

            announceToScreenReader('Lupa ativada - passe o mouse sobre o texto');
            document.addEventListener('mouseover', magnifierHandler, true);
            document.addEventListener('mousemove', magnifierMoveHandler, true);
        } else {
            tooltip.style.display = 'none';
            tooltip.setAttribute('aria-hidden', 'true');
            announceToScreenReader('Lupa desativada');
        }
    }

    // ============================================
    // LEITOR DE TEXTO (TTS) (Com marcação de interação)
    // ============================================
    function toggleTTSClick(element) {
        if (!ensureElements()) return;

        // Marcar interação do usuário para regra opt-in
        if (window.AccessibilityRule) {
            AccessibilityRule.markUserInteraction();
        }

        state.ttsSpeed = ((state.ttsSpeed || 0) + 1) % 4;
        const speedMap = { 1: 'normal', 2: 'slow', 3: 'fast' };
        const rateMap = { 1: 1, 2: 0.7, 3: 1.5 };
        const badge = element?.querySelector('.level-badge');

        if (state.ttsSpeed === 0) {
            state.ttsActive = false;
            element?.classList.remove('active');
            updateAriaPressed(element, false);
            if (badge) badge.style.display = 'none';
            resetDots(element);
            elements.body.style.cursor = '';

            if (ttsClickHandler) {
                document.removeEventListener('click', ttsClickHandler, true);
                ttsClickHandler = null;
            }

            window.speechSynthesis.cancel();
        } else {
            state.ttsActive = true;
            state.ttsRate = rateMap[state.ttsSpeed];
            element?.classList.add('active');
            updateAriaPressed(element, true);
            updateDots(element, state.ttsSpeed);

            if (badge) {
                badge.textContent = displayNames.tts[speedMap[state.ttsSpeed]];
                badge.style.display = 'block';
            }

            elements.body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%231A3E74\' d=\'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z\'/%3E%3C/svg%3E") 16 16, pointer';

            if (ttsClickHandler) {
                document.removeEventListener('click', ttsClickHandler, true);
            }

            ttsClickHandler = (e) => {
                if (e.target.closest('#accessibility-panel, #accessibility-module, .side-widgets-container, .shortcuts-modal, #glossary-modal')) return;

                const target = e.target;
                const textElement = target.closest('p, span, h1, h2, h3, h4, h5, h6, li, td, th, a, label, article, section, div');

                if (textElement) {
                    e.preventDefault();
                    e.stopPropagation();

                    const selection = window.getSelection();
                    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                    let textToRead = '';

                    if (range) {
                        const fullText = textElement.textContent || '';
                        const offset = range.startOffset;
                        const nodeText = range.startContainer.textContent || '';
                        const clickedIndex = fullText.indexOf(nodeText) + offset;
                        textToRead = fullText.substring(clickedIndex).trim();
                    }

                    if (!textToRead || textToRead.length < 3) {
                        textToRead = textElement.textContent?.trim() || '';
                    }

                    if (textToRead.length > 0) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(textToRead);
                        utterance.lang = 'pt-BR';
                        utterance.rate = state.ttsRate || 1;
                        window.speechSynthesis.speak(utterance);
                    }
                }
            };

            document.addEventListener('click', ttsClickHandler, true);
        }

        saveState();
    }

    // ============================================
    // PARAR SONS
    // ============================================
    function toggleStopSounds(active) {
        state.stopSounds = active;
        document.querySelectorAll('audio, video').forEach(media => {
            media.muted = active;
            if (active) media.pause();
        });

        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                const src = iframe.src;
                if (active) {
                    if (src.includes('youtube')) {
                        if (!src.includes('mute=1')) {
                            iframe.src = src + (src.includes('?') ? '&' : '?') + 'mute=1';
                        }
                    }
                    iframe.setAttribute('data-original-src', src);
                }
            } catch (e) {}
        });
    }

    // ============================================
    // WIDGET VLIBRAS
    // ============================================
    function toggleLibrasWidget() {
        document.querySelector('[vw-access-button]')?.click();
    }

    // ============================================
    // GLOSSÁRIO
    // ============================================
    let currentGlossaryLetter = 'A';
    let alphabetExpanded = true;

    async function loadGlossary() {
        try {
            const response = await fetch('https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/data/glossario.json');
            glossaryData = (await response.json()).termos || [];
        } catch (e) {
            console.warn('Glossario nao encontrado');
            glossaryData = [];
        }
    }

    function openGlossary(searchTerm = null) {
        let modal = document.getElementById('glossary-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'glossary-modal';
            modal.className = 'glossary-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');

            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

            modal.innerHTML = `
                <div class="glossary-content">
                    <header class="glossary-header">
                        <h2><i class="fas fa-book-medical"></i> Glossário de Enfermagem</h2>
                        <button type="button" class="glossary-close" data-action="closeGlossary" aria-label="Fechar">
                            <i class="fas fa-times"></i>
                        </button>
                    </header>
                    <div class="glossary-body">
                        <nav class="glossary-alphabet" id="glossary-alphabet">
                            <button type="button" class="alphabet-toggle" id="alphabet-toggle" title="Expandir/Retrair">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <div class="alphabet-letters" id="alphabet-letters">
                                ${alphabet.map(l => `<button type="button" class="alphabet-letter${l === 'A' ? ' active' : ''}" data-letter="${l}">${l}</button>`).join('')}
                            </div>
                        </nav>
                        <div class="glossary-main">
                            <div class="glossary-search">
                                <input type="text" id="glossary-search-input" placeholder="Buscar termo..." autocomplete="off">
                            </div>
                            <ul class="glossary-list" id="glossary-list"></ul>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('#alphabet-toggle').addEventListener('click', () => {
                alphabetExpanded = !alphabetExpanded;
                modal.querySelector('.glossary-alphabet').classList.toggle('collapsed', !alphabetExpanded);
                // CSS will handle the rotation animation via .collapsed .alphabet-toggle i
            });

            modal.querySelectorAll('.alphabet-letter').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.querySelectorAll('.alphabet-letter').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentGlossaryLetter = btn.dataset.letter;
                    modal.querySelector('#glossary-search-input').value = '';
                    renderGlossaryList();
                });
            });

            modal.querySelector('#glossary-search-input').addEventListener('input', (e) => {
                const val = e.target.value;
                if (val) {
                    modal.querySelectorAll('.alphabet-letter').forEach(b => b.classList.remove('active'));
                    renderGlossaryList(val);
                } else {
                    modal.querySelector(`.alphabet-letter[data-letter="${currentGlossaryLetter}"]`)?.classList.add('active');
                    renderGlossaryList();
                }
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeGlossary();
            });
        }

        modal.hidden = false;

        if (searchTerm) {
            const input = modal.querySelector('#glossary-search-input');
            input.value = searchTerm;
            modal.querySelectorAll('.alphabet-letter').forEach(b => b.classList.remove('active'));
            renderGlossaryList(searchTerm);
        } else {
            renderGlossaryList();
        }

        setTimeout(() => modal.querySelector('#glossary-search-input')?.focus(), 100);
    }

    function renderGlossaryList(filter = '') {
        const list = document.getElementById('glossary-list');
        if (!list) return;

        let filtered;
        if (filter) {
            filtered = glossaryData.filter(item =>
                item.termo.toLowerCase().includes(filter.toLowerCase()) ||
                item.definicao.toLowerCase().includes(filter.toLowerCase())
            );
        } else {
            filtered = glossaryData.filter(item => item.termo.charAt(0).toUpperCase() === currentGlossaryLetter);
        }

        if (filtered.length === 0) {
            list.innerHTML = `<li class="glossary-empty"><i class="fas fa-info-circle"></i> Nenhum termo com "${filter || currentGlossaryLetter}"</li>`;
            return;
        }

        list.innerHTML = filtered.map(item => `
            <li class="glossary-item">
                <div class="glossary-term">${sanitizeHTML(item.termo)}</div>
                <div class="glossary-definition">${sanitizeHTML(item.definicao)}</div>
            </li>
        `).join('');
    }

    function closeGlossary() {
        const modal = document.getElementById('glossary-modal');
        if (modal) modal.hidden = true;
    }

    function setupTermLinks() {
        document.addEventListener('click', (e) => {
            // Verificar se clicou em um elemento abbr ou com data-definition
            const term = e.target.closest('[data-definition], abbr[title]');
            
            // Verificar se o elemento está dentro de painéis de acessibilidade
            if (term && !term.closest('#accessibility-panel, #glossary-modal, .shortcuts-modal, #keyboard-shortcuts-modal')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Obter o termo para busca
                let searchTerm = '';
                
                if (term.tagName === 'ABBR') {
                    // Para abbr, usar o texto visível ou o atributo title
                    searchTerm = term.textContent?.trim() || term.getAttribute('title') || '';
                } else {
                    // Para data-definition
                    searchTerm = term.textContent?.trim() || term.getAttribute('data-definition') || term.getAttribute('title') || '';
                }
                
                if (searchTerm && searchTerm.length > 0) {
                    openGlossary(searchTerm);
                }
            }
        });
        
        // Adicionar cursor pointer e underline pontilhado em abbr para indicar que são clicáveis
        document.querySelectorAll('abbr[title]').forEach(abbr => {
            abbr.style.cursor = 'pointer';
            abbr.style.textDecoration = 'none';
            abbr.style.borderBottom = '2px dotted #1A3E74';
            abbr.setAttribute('role', 'button');
            abbr.setAttribute('tabindex', '0');
            abbr.setAttribute('aria-label', `Ver definição de ${abbr.textContent?.trim()}`);
        });
        
        // Suporte para teclado em abbr
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const abbr = e.target.closest('abbr[title]');
                if (abbr && !abbr.closest('#accessibility-panel, #glossary-modal, .shortcuts-modal')) {
                    e.preventDefault();
                    const searchTerm = abbr.textContent?.trim() || abbr.getAttribute('title') || '';
                    if (searchTerm) {
                        openGlossary(searchTerm);
                    }
                }
            }
        });
    }

    // ============================================
    // RESTAURAR TUDO
    // ============================================
    function resetAll() {
        ensureElements();

        // Salvar posição do scroll antes de limpar
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        Object.keys(state).forEach(key => {
            if (!key.startsWith('_')) {
                state[key] = typeof state[key] === 'boolean' ? false : 0;
            }
        });

        state.ttsRate = 1;

        // Limpar estilos inline - apenas restaurar variáveis CSS
        document.documentElement.style.removeProperty('--font-scale');
        document.documentElement.style.removeProperty('--letter-spacing');
        document.documentElement.style.removeProperty('--line-height');
        document.body.removeAttribute('data-font-scale');
        document.getElementById('accessibility-panel')?.classList.remove('font-large');

        // Remover classes de recursos
        allClasses.forEach(cls => elements.body?.classList.remove(cls));
        
        // Limpar cursor customizado
        document.body.style.cursor = '';

        // Remover handlers
        if (mouseMoveHandler) {
            window.removeEventListener('mousemove', mouseMoveHandler);
            mouseMoveHandler = null;
        }
        if (readingGuideHandler) {
            window.removeEventListener('mousemove', readingGuideHandler);
            readingGuideHandler = null;
        }
        if (magnifierHandler) {
            document.removeEventListener('mouseover', magnifierHandler);
            magnifierHandler = null;
        }
        if (ttsClickHandler) {
            document.removeEventListener('click', ttsClickHandler);
            ttsClickHandler = null;
        }

        // Desativar recursos
        toggleReadingMask(false);
        toggleReadingGuide(false);
        toggleMagnifier(false);
        toggleStopSounds(false);
        window.speechSynthesis.cancel();

        ThemeManager.resetToSystem();

        // Atualizar UI dos cards
        document.querySelectorAll('.accessibility-card').forEach(card => {
            card.classList.remove('active');
            updateAriaPressed(card, false);
            resetDots(card);
            const badge = card.querySelector('.level-badge');
            if (badge) badge.style.display = 'none';
        });

        // Ocultar elementos de suporte
        ['reading-mask-top', 'reading-mask-bottom', 'reading-guide', 'magnifier-tooltip'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Limpar storage
        localStorage.removeItem('accessControlState');
        
        // Disparar evento de reset
        window.dispatchEvent(new CustomEvent('Accessibility:Reset'));
        
        announceToScreenReader('Todas as configuracoes de acessibilidade foram restauradas');

        // Feedback visual no botão
        const btn = document.querySelector('[data-action="resetAll"]');
        if (btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" style="color:#10b981"></i> Restaurado!';
            setTimeout(() => btn.innerHTML = original, 1500);
        }
        
        // Restaurar posição do scroll para evitar movimento da página
        requestAnimationFrame(() => {
            window.scrollTo(scrollX, scrollY);
        });
    }

    // ============================================
    // TRATAMENTO DE EVENTOS
    // ============================================
    function handleCardClick(card) {
        const type = card.dataset.type;
        const feature = card.dataset.feature;

        if (feature === 'glossary') {
            openGlossary();
            return;
        }

        if (type === 'simple') {
            toggleSimple(feature, card);
        } else if (type === 'cycle') {
            cycleFeature(feature, card.dataset.values.split(','), card);
        } else if (type === 'tts-click') {
            toggleTTSClick(card);
        }
    }

    function handleAction(action) {
        const actions = {
            togglePanel, toggleMaximize, toggleLibras: toggleLibrasWidget,
            resetAll, showKeyboardShortcuts, closeShortcutsModal,
            openGlossary, closeGlossary
        };
        actions[action]?.();
    }

    function setupEvents() {
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (action) {
                e.preventDefault();
                return handleAction(action.dataset.action);
            }

            const card = e.target.closest('.accessibility-card');
            if (card) {
                e.preventDefault();
                return handleCardClick(card);
            }

            // Fechar painel ao clicar fora, exceto em widgets e modais
            if (!isPanelClosed()) {
                const inPanel = elements.panel?.contains(e.target);
                const inWidgets = elements.sideWidgets?.contains(e.target);
                const inModal = elements.shortcutsModal?.contains(e.target);
                const inGlossary = document.getElementById('glossary-modal')?.contains(e.target);
                const inCookieBanner = e.target.closest('.cookie-banner, .cookie-modal, .cookie-preferences');
                
                if (!inPanel && !inWidgets && !inModal && !inGlossary && !inCookieBanner) {
                    closePanel();
                }
            }
        });

        // Sincronização com botão de aumentar fonte do header
        window.addEventListener('accessibility:featureChanged', (e) => {
            if (e.detail.feature === 'fontSize' && e.detail.value) {
                const value = e.detail.value;
                const level = ['1.2', '1.5', '2.0'].indexOf(value) + 1;
                
                // Atualizar indicador visual no header se existir
                const headerIndicator = document.querySelector('.font-size-indicator, .header-font-level');
                if (headerIndicator) {
                    const dots = headerIndicator.querySelectorAll('.dot, .level-dot');
                    dots.forEach((dot, i) => {
                        dot.classList.toggle('active', i < level);
                    });
                }
                
                // Atualizar badge do card no painel
                const panelCard = document.querySelector('[data-feature="fontSize"]');
                if (panelCard && e.detail.isActive !== false) {
                    const badge = panelCard.querySelector('.level-badge');
                    if (badge) {
                        const displayValue = displayNames.fontSize?.[value] || value;
                        badge.textContent = displayValue;
                        badge.style.display = 'block';
                    }
                    const dots = panelCard.querySelectorAll('.dot');
                    dots.forEach((dot, i) => {
                        dot.classList.toggle('active', i < level);
                    });
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeShortcutsModal();
                closePanel();
                return;
            }

            if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.accessibility-card')) {
                e.preventDefault();
                handleCardClick(e.target.closest('.accessibility-card'));
                return;
            }

            if (e.altKey) {
                const shortcuts = {
                    'a': togglePanel,
                    '1': () => document.querySelector('[data-feature="fontSize"]')?.click(),
                    'c': () => document.querySelector('[data-feature="contrast"]')?.click(),
                    'l': () => document.querySelector('[data-feature="highlight-links"]')?.click(),
                    'h': () => document.querySelector('[data-feature="highlight-headers"]')?.click(),
                    'm': () => document.querySelector('[data-feature="readingMask"]')?.click(),
                    'g': () => document.querySelector('[data-feature="readingGuide"]')?.click(),
                    'r': () => document.querySelector('[data-feature="reading-mode"]')?.click(),
                    't': () => document.querySelector('[data-feature="tts"]')?.click(),
                    'i': () => document.querySelector('[data-feature="hide-images"]')?.click(),
                    '0': resetAll
                };

                if (shortcuts[e.key]) {
                    e.preventDefault();
                    shortcuts[e.key]();
                }
            }
        });
    }

    // ============================================
    // ARRASTAR PAINEL
    // ============================================
    function setupDrag() {
        const panel = document.getElementById('accessibility-panel');
        const handle = document.getElementById('panel-drag-handle');
        if (!panel || !handle) return;

        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        handle.addEventListener('mousedown', (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;
            handle.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, e.clientX - offsetX));
            const y = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, e.clientY - offsetY));
            panel.style.left = x + 'px';
            panel.style.top = y + 'px';
            panel.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            handle.style.cursor = 'grab';
        });
    }

    // ============================================
    // INICIALIZAÇÃO (Comportamento Opt-In)
    // ============================================
    function init() {
        if (state._initialized) return;

        ThemeManager.init();

        if (ensureElements()) {
            setupEvents();
            setupDrag();
            // REMOVIDO: loadSavedState() - não restaura automaticamente
            // Regra opt-in: recursos só são aplicados após interação explícita
            loadGlossary();
            setupTermLinks();

            // Carregar VLibras
            if (!document.querySelector('script[src*="vlibras"]')) {
                const vScript = document.createElement('script');
                vScript.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
                vScript.async = true;
                document.head.appendChild(vScript);
            }

            const vlInterval = setInterval(() => {
                if (window.VLibras?.Widget) {
                    clearInterval(vlInterval);
                    if (!document.querySelector('[vw]')) {
                        new window.VLibras.Widget('https://vlibras.gov.br/app');
                    }
                }
            }, 300);

            setTimeout(() => clearInterval(vlInterval), 15000);
        }

        state._initialized = true;
    }

    // ============================================
    // API PÚBLICA
    // ============================================
    return {
        init,
        togglePanel,
        toggleMaximize,
        resetAll,
        restoreFromStorage, // Nova: restaura estado sob demanda
        ThemeManager,
        state
    };

})();

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================
function tryInit() {
    const panel = document.getElementById('accessibility-panel');
    if (panel) {
        window.AccessControl.init();
    } else {
        setTimeout(tryInit, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
} else {
    tryInit();
}
