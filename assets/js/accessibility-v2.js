/**
 * accessibility-v2.js - Accessibility Widget Module (Module Version)
 * Gerencia o painel de acessibilidade e recursos de acessibilidade
 * 
 * Este módulo pode ser:
 * 1. Carregado diretamente (modo autônomo)
 * 2. Injetado como componente no teste5.html
 * 
 * Integração com EventBus para comunicação entre módulos
 */
(function() {
    'use strict';
    
    // ============================================
    // DETECÇÃO DE MODO DE EXECUÇÃO
    // ============================================
    const AccessibilityContext = {
        isIntegrated: false,
        isStandalone: false,
        containerId: 'accessibility-v2-container',
        
        detect() {
            // Verificar se existe container pai
            const container = document.getElementById(this.containerId);
            
            // Verificar se está em contexto de página completa
            const hasHeader = document.querySelector('header, .header, #header');
            const hasBodyHeader = document.body.querySelector(':scope > header, :scope > .header');
            
            this.isIntegrated = !!(
                (container && container.closest('#app, .app, main, body')) ||
                hasHeader || hasBodyHeader
            );
            
            this.isStandalone = !this.isIntegrated;
            
            console.log(`[Accessibility] Modo detectado: ${this.isIntegrated ? 'Integrado' : 'Autônomo'}`);
            return this;
        },
        
        getContainer() {
            return document.getElementById(this.containerId);
        }
    };
    
    // ============================================
    // CONFIGURAÇÕES E CONSTANTES
    // ==========================================
    const CONFIG = {
        storageKeys: {
            settings: 'ce_accessibility_settings'
        },
        fontSizeLevels: [0.875, 1, 1.125, 1.25, 1.5],
        fontSizeLabels: ['85%', '100%', '112.5%', '125%', '150%']
    };
    
    // ============================================
    // ESTADO DO MÓDULO
    // ==========================================
    const state = {
        elements: {},
        initialized: false,
        isPanelOpen: false,
        isLibrasActive: false,
        eventBusReady: false,
        currentSettings: {
            fontSize: 1,
            contrast: 'normal',
            colorblind: 'none',
            saturation: 'normal',
            cursor: 'normal',
            readingGuide: 'none',
            highlightLinks: false,
            highlightHeaders: false,
            boldText: false,
            stopAnim: false,
            hideImages: false,
            readingMode: false
        }
    };
    
    // ============================================
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
        
        // Escutar eventos de theme
        window.EventBus.on('theme:changed', function(data) {
            console.log('[Accessibility] Tema alterado detectado via EventBus:', data.theme);
        }, { module: 'accessibility' });
        
        // Escutar eventos de fonte
        window.EventBus.on('font:changed', function(data) {
            console.log('[Accessibility] Fonte alterada detectada via EventBus:', data.size);
        }, { module: 'accessibility' });
        
        // Escutar comandos de sync
        window.EventBus.on('accessibility:request-state', function(data) {
            emitAccessibilityEvent('state:sync', { settings: state.currentSettings });
        }, { module: 'accessibility' });
        
        // Escutar eventos do main
        window.EventBus.on('main:ready', function(data) {
            console.log('[Accessibility] Módulo main está pronto, sincronizando...');
            // Enviar estado atual para o main
            emitAccessibilityEvent('state:sync', { settings: state.currentSettings });
        }, { module: 'accessibility' });
    }
    
    function emitAccessibilityEvent(eventName, data) {
        const eventData = {
            ...data,
            source: 'accessibility',
            timestamp: Date.now()
        };
        
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('accessibility:' + eventName, eventData);
        }
        
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
        
        if (window.EventBus && state.eventBusReady) {
            window.EventBus.emit('accessibility:settings:changed', eventData);
        }
        
        window.dispatchEvent(new CustomEvent('accessibility:settings:changed', {
            detail: eventData
        }));
    }
    
    // ==========================================
    // FUNÇÕES DE UTILIDADE
    // ==========================================
    function log(message, type = 'info') {
        const prefix = '[Accessibility]';
        console[`${type}`](`${prefix} ${message}`);
    }
    
    function getElement(id) {
        return document.getElementById(id);
    }
    
    function getElements(selectors) {
        const result = {};
        Object.entries(selectors).forEach(([key, selector]) => {
            result[key] = selector.startsWith('#')
                ? getElement(selector)
                : document.querySelectorAll(selector);
        });
        return result;
    }
    
    function announce(message) {
        const announcer = getElement('sr-announcer') || document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        if (!getElement('sr-announcer')) {
            document.body.appendChild(announcer);
        }
    }
    
    // ==========================================
    // GERENCIADOR DO PAINEL
    // ==========================================
    const PanelManager = {
        open() {
            const { accessibilityPanel, accessibilityToggle } = state.elements;
            if (!accessibilityPanel) {
                log('Painel não encontrado - não é possível abrir', 'error');
                return;
            }
            
            state.isPanelOpen = true;
            accessibilityPanel.classList.remove('accessibility-panel-hidden');
            accessibilityPanel.classList.add('accessibility-panel-visible');
            accessibilityPanel.removeAttribute('hidden');
            
            if (accessibilityToggle) {
                accessibilityToggle.classList.add('active');
                accessibilityToggle.setAttribute('aria-expanded', 'true');
            }
            
            document.body.style.overflow = 'hidden';
            log('Painel de acessibilidade aberto');
            announce('Painel de acessibilidade aberto');
            
            // Focar no primeiro elemento interativo
            const firstFocusable = accessibilityPanel.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        },
        
        close() {
            const { accessibilityPanel, accessibilityToggle } = state.elements;
            if (!accessibilityPanel) {
                log('Painel não encontrado - não é possível fechar', 'error');
                return;
            }
            
            state.isPanelOpen = false;
            accessibilityPanel.classList.remove('accessibility-panel-visible');
            accessibilityPanel.classList.add('accessibility-panel-hidden');
            accessibilityPanel.setAttribute('hidden', '');
            
            if (accessibilityToggle) {
                accessibilityToggle.classList.remove('active');
                accessibilityToggle.setAttribute('aria-expanded', 'false');
            }
            
            document.body.style.overflow = '';
            log('Painel de acessibilidade fechado');
            announce('Painel de acessibilidade fechado');
        },
        
        toggle() {
            log(`Toggle painel - estado atual: ${state.isPanelOpen ? 'aberto' : 'fechado'}`);
            if (state.isPanelOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    };
    
    // ==========================================
    // GERENCIADOR DE LIBRAS
    // ==========================================
    const LibrasManager = {
        vlibrasWidget: null,
        isVLibrasLoaded: false,
        
        init() {
            const { librasToggle } = state.elements;
            if (librasToggle) {
                librasToggle.addEventListener('click', () => this.toggle());
            }
            this.checkVLibrasLoaded();
            this.observeVLibrasLoad();
            log('Gerenciador de Libras inicializado');
        },
        
        checkVLibrasLoaded() {
            if (window.vlibras) {
                this.isVLibrasLoaded = true;
                this.vlibrasWidget = window.vlibras;
                log('VLibras já carregado na página');
            }
            
            const vlibrasElements = document.querySelector('[class*="vlibras"], #vw-widget, #vlibras-widget');
            if (vlibrasElements) {
                this.isVLibrasLoaded = true;
                log('Elemento VLibras detectado na página');
            }
        },
        
        observeVLibrasLoad() {
            if (window.MutationObserver) {
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1) {
                                if (node.id && (node.id.toLowerCase().includes('vlibras') || node.id.toLowerCase().includes('vw'))) {
                                    this.isVLibrasLoaded = true;
                                    this.vlibrasWidget = node;
                                    log('VLibras detectado via MutationObserver');
                                    observer.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },
        
        toggle() {
            state.isLibrasActive = !state.isLibrasActive;
            const { librasToggle } = state.elements;
            
            if (librasToggle) {
                librasToggle.classList.toggle('active', state.isLibrasActive);
                librasToggle.setAttribute('aria-pressed', state.isLibrasActive);
            }
            
            if (state.isLibrasActive) {
                this.activateLibras();
            } else {
                this.deactivateLibras();
            }
            
            announce(state.isLibrasActive ? 'Tradutor de Libras ativado' : 'Tradutor de Libras desativado');
            log(state.isLibrasActive ? 'Libras ativado' : 'Libras desativado');
        },
        
        activateLibras() {
            log('Ativando tradução LIBRAS...');
            const pageContent = this.extractPageContent();
            
            if (pageContent && pageContent.text) {
                log(`Conteúdo extraído: ${pageContent.text.length} caracteres`);
                
                if (this.isVLibrasLoaded && this.vlibrasWidget) {
                    this.sendToVLibras(pageContent.text);
                } else {
                    this.showLibrasInstructions(pageContent);
                }
            } else {
                log('Nenhum conteúdo encontrado para tradução', 'warn');
                announce('Nenhum conteúdo encontrável para tradução');
            }
        },
        
        deactivateLibras() {
            log('Desativando tradução LIBRAS');
            
            const closeBtn = this.vlibrasWidget?.querySelector('.vw-close, .vlibras-close, [class*="close"]');
            if (closeBtn) {
                closeBtn.click();
            }
            
            const instructions = document.getElementById('libras-instructions');
            if (instructions) {
                instructions.remove();
            }
        },
        
        extractPageContent() {
            const contentSelectors = [
                'main', '[role="main"]', '#content', '#main-content',
                '.main-content', '.content', 'article', '.post',
                '.page-content', '.entry-content'
            ];
            
            let mainContent = null;
            
            for (const selector of contentSelectors) {
                mainContent = document.querySelector(selector);
                if (mainContent) {
                    log(`Elemento de conteúdo encontrado: ${selector}`);
                    break;
                }
            }
            
            if (!mainContent) {
                mainContent = document.body;
                log('Usando body como conteúdo fallback');
            }
            
            const text = this.extractTextFromElement(mainContent);
            
            return {
                title: document.title || 'Página sem título',
                text: text,
                url: window.location.href
            };
        },
        
        extractTextFromElement(element) {
            const excludeSelectors = [
                'script', 'style', 'noscript', 'iframe', 'nav', 'header', 'footer',
                '.navigation', '.nav', '.menu', '.sidebar', '.advertisement', '.ads',
                '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
            ];
            
            const clone = element.cloneNode(true);
            
            excludeSelectors.forEach(selector => {
                clone.querySelectorAll(selector).forEach(el => el.remove());
            });
            
            let text = clone.textContent || clone.innerText || '';
            
            text = text.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').trim();
            
            return text;
        },
        
        sendToVLibras(text) {
            log('Enviando conteúdo para VLibras');
            
            if (window.vlibras && typeof window.vlibras.translate === 'function') {
                try {
                    window.vlibras.translate(text);
                    log('Tradução enviada via API VLibras');
                    return true;
                } catch (e) {
                    log(`Erro ao usar API VLibras: ${e.message}`, 'warn');
                }
            }
            
            const vlibrasFrame = document.querySelector('iframe[src*="vlibras"]');
            if (vlibrasFrame) {
                try {
                    vlibrasFrame.contentWindow.postMessage({
                        type: 'VLIBRAS_TRANSLATE',
                        text: text
                    }, '*');
                    log('Tradução enviada via postMessage');
                    return true;
                } catch (e) {
                    log(`Erro ao enviar via postMessage: ${e.message}`, 'warn');
                }
            }
            
            this.openVLibrasWidget(text);
            return false;
        },
        
        openVLibrasWidget(text) {
            log('Abrindo widget VLibras para tradução');
            
            const vlibrasBtn = document.querySelector('[class*="vlibras"], #vw-button, .vw-widget-btn, [onclick*="vlibras"]');
            
            if (vlibrasBtn) {
                if (typeof vlibrasBtn.click === 'function') {
                    vlibrasBtn.click();
                    log('Botão VLibras clicado');
                }
            } else {
                this.showLibrasInstructions({ title: document.title, text: text });
            }
        },
        
        showLibrasInstructions(content) {
            log('Exibindo instruções do LIBRAS');
            
            const existingInstructions = document.getElementById('libras-instructions');
            if (existingInstructions) {
                existingInstructions.remove();
            }
            
            const instructions = document.createElement('div');
            instructions.id = 'libras-instructions';
            instructions.className = 'libras-instructions';
            instructions.setAttribute('role', 'alert');
            instructions.setAttribute('aria-live', 'polite');
            
            instructions.innerHTML = `
                <div class="libras-instructions-content">
                    <h3>Tradutor LIBRAS</h3>
                    <p>O conteúdo da página foi preparado para tradução.</p>
                    <p><strong>Instruções:</strong></p>
                    <ol>
                        <li>Clique no botão do VLibras disponível na página</li>
                        <li>O tradutor exibirá o conteúdo em língua de sinais</li>
                    </ol>
                    <button id="libras-close-instructions" class="libras-close-btn">Fechar</button>
                </div>
            `;
            
            instructions.style.cssText = `
                position: fixed; top: 20px; right: 20px; background: #fff;
                border: 2px solid #0066cc; border-radius: 8px; padding: 20px;
                max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 999999; font-family: Arial, sans-serif;
            `;
            
            document.body.appendChild(instructions);
            
            const closeBtn = instructions.querySelector('#libras-close-instructions');
            if (closeBtn) {
                closeBtn.style.cssText = `
                    background: #0066cc; color: white; border: none;
                    padding: 8px 16px; border-radius: 4px; cursor: pointer;
                    margin-top: 10px;
                `;
                closeBtn.addEventListener('click', () => instructions.remove());
            }
            
            setTimeout(() => instructions.focus(), 100);
        },
        
        getPageContent() {
            return this.extractPageContent();
        },
        
        getVLibrasStatus() {
            return {
                isLoaded: this.isVLibrasLoaded,
                hasWidget: !!this.vlibrasWidget,
                isActive: state.isLibrasActive
            };
        }
    };
    
    // ==========================================
    // GERENCIADOR DE ACESSIBILIDADE
    // ==========================================
    const AccessibilityManager = {
        init() {
            this.setupCards();
            this.setupSpecialButtons();
            log('Gerenciador de acessibilidade inicializado');
        },
        
        setupCards() {
            const cards = document.querySelectorAll('.accessibility-card[data-action]');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const action = card.dataset.action;
                    const param = card.dataset.param || null;
                    this.applyAction(action, param);
                });
            });
        },
        
        setupSpecialButtons() {
            const shortcutsBtn = getElement('shortcuts-btn');
            if (shortcutsBtn) {
                shortcutsBtn.addEventListener('click', () => this.showShortcuts());
            }
            
            const glossaryBtn = getElement('glossary-btn');
            if (glossaryBtn) {
                glossaryBtn.addEventListener('click', () => this.showGlossary());
            }
            
            const restoreBtn = getElement('accessibility-restore');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', () => {
                    this.restoreAll();
                    announce('Configurações de acessibilidade restauradas para padrões');
                });
            }
        },
        
        applyAction(action, param) {
            switch (action) {
                case 'font-size':
                    this.applyFontSize(param);
                    break;
                case 'contrast':
                    this.applyContrast(param);
                    break;
                case 'colorblind':
                    this.applyColorblind(param);
                    break;
                case 'saturation':
                    this.applySaturation(param);
                    break;
                case 'cursor':
                    this.applyCursor(param);
                    break;
                case 'reading-guide':
                    this.applyReadingGuide(param);
                    break;
                case 'highlight-links':
                    this.toggleHighlightLinks();
                    break;
                case 'highlight-headers':
                    this.toggleHighlightHeaders();
                    break;
                case 'bold-text':
                    this.toggleBoldText();
                    break;
                case 'stop-anim':
                    this.toggleStopAnim();
                    break;
                case 'hide-images':
                    this.toggleHideImages();
                    break;
                case 'reading-mode':
                    this.toggleReadingMode();
                    break;
                default:
                    log(`Ação desconhecida: ${action}`, 'warn');
            }
            
            emitSettingsChangedEvent(state.currentSettings);
        },
        
        applyFontSize(param) {
            let index = state.currentSettings.fontSize;
            switch (param) {
                case 'decrease':
                    index = Math.max(0, index - 1);
                    break;
                case 'increase':
                    index = Math.min(CONFIG.fontSizeLevels.length - 1, index + 1);
                    break;
                case 'reset':
                    index = 1;
                    break;
            }
            state.currentSettings.fontSize = index;
            const multiplier = CONFIG.fontSizeLevels[index];
            document.documentElement.style.setProperty('--font-size-multiplier', multiplier);
            document.body.setAttribute('data-font-index', index);
            announce(`Tamanho da fonte: ${CONFIG.fontSizeLabels[index]}`);
            log(`Fonte ajustada para: ${CONFIG.fontSizeLabels[index]}`);
        },
        
        applyContrast(param) {
            state.currentSettings.contrast = param;
            document.body.classList.remove('inverted-colors', 'high-contrast-light', 'high-contrast-dark', 'inverted', 'light-contrast', 'dark-contrast');
            
            switch (param) {
                case 'inverted':
                case 'inverted-colors':
                    document.body.classList.add('inverted-colors', 'inverted');
                    announce('Cores invertidas ativadas');
                    break;
                case 'light-contrast':
                    document.body.classList.add('high-contrast-light', 'light-contrast');
                    announce('Alto contraste claro ativado');
                    break;
                case 'dark-contrast':
                    document.body.classList.add('high-contrast-dark', 'dark-contrast');
                    announce('Alto contraste escuro ativado');
                    break;
                default:
                    announce('Contraste normal');
            }
        },
        
        applyColorblind(param) {
            state.currentSettings.colorblind = param;
            const html = document.documentElement;
            html.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
            
            if (param !== 'none' && param !== 'normal') {
                html.classList.add(param);
            }
            
            const labels = { protanopia: 'Protanopia', deuteranopia: 'Deuteranopia', tritanopia: 'Tritanopia' };
            announce(param !== 'none' && param !== 'normal' ? `${labels[param]} ativado` : 'Filtros de cores desativados');
        },
        
        applySaturation(param) {
            state.currentSettings.saturation = param;
            document.body.classList.remove('low-saturation', 'high-saturation', 'monochrome', 'saturation-low', 'saturation-high');
            
            switch (param) {
                case 'low':
                case 'saturation-low':
                    document.body.classList.add('low-saturation', 'saturation-low');
                    announce('Baixa saturação ativada');
                    break;
                case 'high':
                case 'saturation-high':
                    document.body.classList.add('high-saturation', 'saturation-high');
                    announce('Alta saturação ativada');
                    break;
                case 'monochrome':
                    document.body.classList.add('monochrome');
                    announce('Modo monocromático ativado');
                    break;
                default:
                    announce('Saturação normal');
            }
        },
        
        applyCursor(param) {
            state.currentSettings.cursor = param;
            document.body.classList.remove('large-cursor', 'xl-cursor', 'big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge');
            
            switch (param) {
                case 'medium':
                    document.body.classList.add('large-cursor', 'big-cursor-medium');
                    announce('Cursor grande ativado');
                    break;
                case 'large':
                    document.body.classList.add('xl-cursor', 'big-cursor-large');
                    announce('Cursor extra grande ativado');
                    break;
                default:
                    announce('Cursor normal');
            }
        },
        
        applyReadingGuide(param) {
            state.currentSettings.readingGuide = param;
            
            const existingGuide = document.querySelector('.reading-guide, #reading-guide');
            if (existingGuide) {
                existingGuide.remove();
            }
            
            if (param !== 'none' && param !== 'off') {
                const guide = document.createElement('div');
                guide.id = 'reading-guide';
                guide.className = 'reading-guide';
                guide.style.display = 'block';
                
                switch (param) {
                    case 'azul':
                        guide.classList.add('guide-azul');
                        break;
                    case 'laranja':
                        guide.classList.add('guide-laranja');
                        break;
                    case 'preto':
                        guide.classList.add('guide-preto');
                        break;
                }
                
                document.body.appendChild(guide);
                
                document.addEventListener('mousemove', function guideFollow(e) {
                    const g = document.getElementById('reading-guide');
                    if (g) {
                        g.style.top = `${e.clientY - 25}px`;
                        g.style.left = `${e.clientX - 100}px`;
                    } else {
                        document.removeEventListener('mousemove', guideFollow);
                    }
                });
                
                announce('Guia de leitura ativado');
            } else {
                announce('Guia de leitura desativado');
            }
        },
        
        toggleHighlightLinks() {
            state.currentSettings.highlightLinks = !state.currentSettings.highlightLinks;
            document.body.classList.toggle('highlight-links', state.currentSettings.highlightLinks);
            announce(state.currentSettings.highlightLinks ? 'Links destacados' : 'Links não destacados');
        },
        
        toggleHighlightHeaders() {
            state.currentSettings.highlightHeaders = !state.currentSettings.highlightHeaders;
            document.body.classList.toggle('highlight-headers', state.currentSettings.highlightHeaders);
            announce(state.currentSettings.highlightHeaders ? 'Títulos destacados' : 'Títulos não destacados');
        },
        
        toggleBoldText() {
            state.currentSettings.boldText = !state.currentSettings.boldText;
            document.body.classList.toggle('bold-text', state.currentSettings.boldText);
            announce(state.currentSettings.boldText ? 'Texto em negrito ativado' : 'Texto em negrito desativado');
        },
        
        toggleStopAnim() {
            state.currentSettings.stopAnim = !state.currentSettings.stopAnim;
            document.body.classList.toggle('reduced-motion', state.currentSettings.stopAnim);
            document.body.classList.toggle('stop-anim', state.currentSettings.stopAnim);
            
            if (state.currentSettings.stopAnim) {
                document.documentElement.style.setProperty('--transition-duration', '0s');
            } else {
                document.documentElement.style.removeProperty('--transition-duration');
            }
            announce(state.currentSettings.stopAnim ? 'Animações paradas' : 'Animações ativadas');
        },
        
        toggleHideImages() {
            state.currentSettings.hideImages = !state.currentSettings.hideImages;
            document.body.classList.toggle('hide-images', state.currentSettings.hideImages);
            announce(state.currentSettings.hideImages ? 'Imagens escondidas' : 'Imagens visíveis');
        },
        
        toggleReadingMode() {
            state.currentSettings.readingMode = !state.currentSettings.readingMode;
            document.body.classList.toggle('reading-mode', state.currentSettings.readingMode);
            
            if (state.currentSettings.readingMode) {
                document.body.classList.add('hide-navigational', 'focused-content');
            } else {
                document.body.classList.remove('hide-navigational', 'focused-content');
            }
            announce(state.currentSettings.readingMode ? 'Modo leitura ativado' : 'Modo leitura desativado');
        },
        
        showShortcuts() {
            const modal = getElement('shortcuts-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('visible');
                modal.setAttribute('aria-hidden', 'false');
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                this.renderShortcuts();
                
                const closeBtn = modal.querySelector('#shortcuts-close');
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
            }
        },
        
        renderShortcuts() {
            const shortcutsList = getElement('shortcuts-list');
            if (!shortcutsList) return;
            
            const shortcuts = [
                { key: 'Alt + 1', action: 'Ir para conteúdo principal' },
                { key: 'Alt + 2', action: 'Ir para rodapé' },
                { key: 'Alt + A', action: 'Abrir painel de acessibilidade' },
                { key: 'Alt + +', action: 'Aumentar fonte' },
                { key: 'Alt + -', action: 'Diminuir fonte' },
                { key: 'Alt + 0', action: 'Restaurar tamanho padrão' },
                { key: 'Esc', action: 'Fechar painéis modais' }
            ];
            
            shortcutsList.innerHTML = shortcuts.map(shortcut => `
                <div class="shortcut-item">
                    <kbd>${shortcut.key}</kbd>
                    <span>${shortcut.action}</span>
                </div>
            `).join('');
            
            this.setupShortcutsTabs();
        },
        
        setupShortcutsTabs() {
            const tabs = document.querySelectorAll('.browser-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => {
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    });
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                });
            });
        },
        
        showGlossary() {
            const modal = getElement('glossary-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('visible');
                modal.setAttribute('aria-hidden', 'false');
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                this.renderGlossary();
                
                const searchInput = getElement('glossary-search-input');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        },
        
        renderGlossary() {
            const glossaryList = getElement('glossary-list');
            if (!glossaryList) return;
            
            const terms = [
                { letter: 'A', term: 'Afusão', definition: 'Introdução gradual de líquido em uma veia.' },
                { letter: 'B', term: 'Balanço Hídrico', definition: 'Registro de líquidos administrados e eliminados.' },
                { letter: 'C', term: 'Cateterismo', definition: 'Introdução de cateter em cavidade corporal.' },
                { letter: 'D', term: 'Diurético', definition: 'Medicamento que aumenta a produção de urina.' },
                { letter: 'G', term: 'Glicemia', definition: 'Taxa de açúcar no sangue.' },
                { letter: 'H', term: 'Hematoma', definition: 'Acúmulo de sangue fora dos vasos.' },
                { letter: 'I', term: 'Insulina', definition: 'Hormônio que regula a glicose no sangue.' },
                { letter: 'P', term: 'Punção Venosa', definition: 'Procedimento para acessar veia periférica.' },
                { letter: 'S', term: 'Soro', definition: 'Solução aquosa de sais minerais.' },
                { letter: 'V', term: 'Venopunção', definition: 'Procedimento de punctura de veia.' }
            ];
            
            glossaryList.innerHTML = terms.map(item => `
                <li class="glossary-item" data-letter="${item.letter}">
                    <dt class="glossary-term">${item.term}</dt>
                    <dd class="glossary-definition">${item.definition}</dd>
                </li>
            `).join('');
            
            this.setupGlossarySearch();
            this.setupGlossaryFilter();
        },
        
        setupGlossarySearch() {
            const searchInput = getElement('glossary-search-input');
            if (!searchInput) return;
            
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase();
                const items = document.querySelectorAll('.glossary-item');
                const empty = getElement('glossary-empty');
                
                let hasResults = false;
                items.forEach(item => {
                    const term = item.querySelector('.glossary-term').textContent.toLowerCase();
                    const definition = item.querySelector('.glossary-definition').textContent.toLowerCase();
                    const matches = term.includes(query) || definition.includes(query);
                    item.style.display = matches ? 'block' : 'none';
                    if (matches) hasResults = true;
                });
                
                if (empty) {
                    empty.style.display = hasResults ? 'none' : 'block';
                }
            });
        },
        
        setupGlossaryFilter() {
            const letters = document.querySelectorAll('.alphabet-letter');
            letters.forEach(letter => {
                letter.addEventListener('click', () => {
                    const selectedLetter = letter.dataset.letter;
                    letters.forEach(l => l.classList.remove('active'));
                    letter.classList.add('active');
                    
                    const items = document.querySelectorAll('.glossary-item');
                    items.forEach(item => {
                        if (selectedLetter === 'all') {
                            item.style.display = 'block';
                        } else {
                            item.style.display = item.dataset.letter === selectedLetter ? 'block' : 'none';
                        }
                    });
                });
            });
        },
        
        restoreAll() {
            state.currentSettings = {
                fontSize: 1,
                contrast: 'normal',
                colorblind: 'none',
                saturation: 'normal',
                cursor: 'normal',
                readingGuide: 'none',
                highlightLinks: false,
                highlightHeaders: false,
                boldText: false,
                stopAnim: false,
                hideImages: false,
                readingMode: false
            };
            
            document.body.classList.remove(
                'inverted-colors', 'high-contrast-light', 'high-contrast-dark',
                'inverted', 'light-contrast', 'dark-contrast',
                'low-saturation', 'high-saturation', 'monochrome',
                'saturation-low', 'saturation-high',
                'large-cursor', 'xl-cursor',
                'big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge',
                'highlight-links', 'highlight-headers',
                'bold-text', 'reduced-motion', 'stop-anim',
                'hide-images', 'reading-mode',
                'hide-navigational', 'focused-content'
            );
            
            document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
            
            const readingGuide = document.querySelector('.reading-guide, #reading-guide');
            if (readingGuide) {
                readingGuide.remove();
            }
            
            document.documentElement.style.removeProperty('--font-size-multiplier');
            document.documentElement.style.removeProperty('--transition-duration');
            document.body.removeAttribute('data-font-index');
            
            const images = document.querySelectorAll('img, video');
            images.forEach(img => {
                img.style.visibility = '';
            });
            
            log('Todos os recursos de acessibilidade restaurados');
            emitSettingsChangedEvent(state.currentSettings);
        }
    };
    
    // ==========================================
    // GERENCIADOR DE EVENTOS
    // ==========================================
    function setupEventListeners() {
        const { accessibilityToggle, accessibilityClose, accessibilityPanel } = state.elements;
        
        if (accessibilityToggle) {
            accessibilityToggle.addEventListener('click', (e) => {
                e.preventDefault();
                PanelManager.toggle();
            });
        }
        
        if (accessibilityClose) {
            accessibilityClose.addEventListener('click', (e) => {
                e.preventDefault();
                PanelManager.close();
            });
        }
        
        if (accessibilityPanel) {
            accessibilityPanel.addEventListener('click', (e) => {
                if (e.target === accessibilityPanel) {
                    PanelManager.close();
                }
            });
        }
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (state.isPanelOpen) {
                    PanelManager.close();
                    return;
                }
                
                const shortcutsModal = getElement('shortcuts-modal');
                const glossaryModal = getElement('glossary-modal');
                
                [shortcutsModal, glossaryModal].forEach(modal => {
                    if (modal && modal.classList.contains('visible')) {
                        modal.classList.remove('visible');
                        modal.classList.add('hidden');
                        modal.setAttribute('aria-hidden', 'true');
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                });
            }
        });
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                PanelManager.toggle();
            }
        });
        
        // Botões de fechar modais
        const shortcutsClose = getElement('shortcuts-close');
        if (shortcutsClose) {
            shortcutsClose.addEventListener('click', (e) => {
                e.preventDefault();
                const shortcutsModal = getElement('shortcuts-modal');
                if (shortcutsModal) {
                    shortcutsModal.classList.remove('visible');
                    shortcutsModal.classList.add('hidden');
                    shortcutsModal.setAttribute('aria-hidden', 'true');
                    shortcutsModal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }
        
        const glossaryClose = getElement('glossary-modal');
        if (glossaryClose) {
            const closeBtn = glossaryClose.querySelector('.icon-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    glossaryClose.classList.remove('visible');
                    glossaryClose.classList.add('hidden');
                    glossaryClose.setAttribute('aria-hidden', 'true');
                    glossaryClose.style.display = 'none';
                    document.body.style.overflow = '';
                });
            }
        }
        
        // Fechar modais ao clicar fora
        [getElement('shortcuts-modal'), getElement('glossary-modal')].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('visible');
                        modal.classList.add('hidden');
                        modal.setAttribute('aria-hidden', 'true');
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                });
            }
        });
    }
    
    // ==========================================
    // CONTEÚDO DO TEMPLATE
    // ==========================================
    const ACCESSIBILITY_HTML = `
        <!-- Botão Flutuante de Acessibilidade -->
        <button id="accessibility-toggle" class="icon-btn accessibility-btn" aria-label="Recursos de Acessibilidade" aria-expanded="false" aria-controls="accessibility-panel">
            <span class="btn-icon">
                <i class="fas fa-eye" aria-hidden="true"></i>
            </span>
        </button>
        
        <!-- Botão Libras (VLibras) -->
        <button id="libras-toggle-top" class="icon-btn accessibility-btn" aria-label="Tradutor de Libras" aria-pressed="false" title="Tradutor de Libras">
            <span class="btn-icon">
                <i class="fas fa-sign-language" aria-hidden="true"></i>
            </span>
        </button>
        
        <!-- Painel de Acessibilidade -->
        <div id="accessibility-panel" class="accessibility-panel accessibility-panel-hidden" role="dialog" aria-label="Configurações de Acessibilidade" aria-modal="true" hidden>
            <div class="accessibility-header">
                <h2 class="accessibility-title">
                    <i class="fas fa-eye" aria-hidden="true"></i>
                    Acessibilidade
                </h2>
                <p class="accessibility-subtitle">Personalize sua experiência</p>
                <button id="accessibility-close" class="icon-btn close-btn" aria-label="Fechar painel de acessibilidade">
                    <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <!-- Tamanho da Fonte -->
            <div class="accessibility-card" data-action="font-size" data-param="decrease">
                <div class="card-icon">
                    <svg class="icon-font-decrease" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 6h16M4 12h10M4 18h16"/><path d="M10 12h4"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Tamanho da Fonte</h3>
                </div>
                <div class="card-actions">
                    <span class="font-size-label">Diminuir</span>
                    <span class="font-size-icon">A-</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="font-size" data-param="reset">
                <div class="card-icon">
                    <svg class="icon-font-normal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Normal</h3>
                </div>
                <div class="card-actions">
                    <span class="font-size-label">100%</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="font-size" data-param="increase">
                <div class="card-icon">
                    <svg class="icon-font-increase" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h16"/><path d="M12 12h8"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Aumentar</h3>
                </div>
                <div class="card-actions">
                    <span class="font-size-label">A+</span>
                </div>
            </div>
            
            <!-- Contraste -->
            <div class="accessibility-card" data-action="contrast" data-param="inverted-colors">
                <div class="card-icon">
                    <svg class="icon-contrast-inverted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20"/><path d="M2 12h20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Contraste</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Cores Invertidas</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="contrast" data-param="light-contrast">
                <div class="card-icon">
                    <svg class="icon-contrast-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Alto Contraste Claro</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="contrast" data-param="dark-contrast">
                <div class="card-icon">
                    <svg class="icon-contrast-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M12 2a10 10 0 0 0 0 20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Alto Contraste Escuro</span>
                </div>
            </div>
            
            <!-- Filtros de Daltonismo -->
            <div class="accessibility-card" data-action="colorblind" data-param="protanopia">
                <div class="card-icon">
                    <svg class="icon-colorblind-protanopia" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Filtros de Daltonismo</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Protanopia (Vermelho)</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="colorblind" data-param="deuteranopia">
                <div class="card-icon">
                    <svg class="icon-colorblind-deuteranopia" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Deuteranopia (Verde)</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="colorblind" data-param="tritanopia">
                <div class="card-icon">
                    <svg class="icon-colorblind-tritanopia" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2v20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Tritanopia (Azul)</span>
                </div>
            </div>
            
            <!-- Saturação -->
            <div class="accessibility-card" data-action="saturation" data-param="low">
                <div class="card-icon">
                    <svg class="icon-saturation-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Saturação</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Baixa Saturação</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="saturation" data-param="high">
                <div class="card-icon">
                    <svg class="icon-saturation-high" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><path d="M12 2v20"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Alta Saturação</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="saturation" data-param="monochrome">
                <div class="card-icon">
                    <svg class="icon-saturation-monochrome" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Monocromático</span>
                </div>
            </div>
            
            <!-- Tamanho do Cursor -->
            <div class="accessibility-card" data-action="cursor" data-param="medium">
                <div class="card-icon">
                    <svg class="cursor-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 4l16 8-8 3-3 8-3-8-4-3z"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Tamanho do Cursor</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Cursor Grande</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="cursor" data-param="large">
                <div class="card-icon">
                    <svg class="cursor-large" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 4l16 8-8 3-3 8-3-8-4-3z"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Cursor Extra Grande</span>
                </div>
            </div>
            
            <!-- Guia de Leitura -->
            <div class="accessibility-card" data-action="reading-guide" data-param="azul">
                <div class="card-icon">
                    <svg class="reading-guide-azul" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2 12h20"/><rect x="2" y="8" width="20" height="4" fill="currentColor" opacity="0.3"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Guia de Leitura</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Guia Azul</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="reading-guide" data-param="laranja">
                <div class="card-icon">
                    <svg class="reading-guide-laranja" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2 12h20"/><rect x="2" y="8" width="20" height="4" fill="currentColor" opacity="0.3"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Guia Laranja</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="reading-guide" data-param="preto">
                <div class="card-icon">
                    <svg class="reading-guide-preto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2 12h20"/><rect x="2" y="8" width="20" height="4" fill="currentColor" opacity="0.3"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Guia Preto</span>
                </div>
            </div>
            
            <!-- Recursos Adicionais -->
            <div class="accessibility-card" data-action="highlight-links">
                <div class="card-icon">
                    <svg class="highlight-links" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Recursos Adicionais</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Destacar Links</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="highlight-headers">
                <div class="card-icon">
                    <svg class="highlight-headers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 6h16M4 12h10M4 18h16"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Destacar Títulos</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="bold-text">
                <div class="card-icon">
                    <svg class="bold-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Texto em Negrito</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="stop-anim">
                <div class="card-icon">
                    <svg class="stop-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Parar Animações</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="hide-images">
                <div class="card-icon">
                    <svg class="hide-images" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 21l-18-0"/><path d="M1 1l22 22"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Esconder Imagens</span>
                </div>
            </div>
            
            <div class="accessibility-card" data-action="reading-mode">
                <div class="card-icon">
                    <svg class="reading-mode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title"></h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Modo Leitura</span>
                </div>
            </div>
            
            <!-- Atalhos de Teclado -->
            <div class="accessibility-card" id="shortcuts-btn">
                <div class="card-icon">
                    <svg class="shortcuts" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M6 8h4M10 8h4M6 12h8M10 12h8M6 16h4M10 16h4"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Atalhos de Teclado</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Ver todos os atalhos disponíveis</span>
                </div>
            </div>
            
            <!-- Dicionário -->
            <div class="accessibility-card" id="glossary-btn">
                <div class="card-icon">
                    <svg class="glossary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Dicionário de Termos</h3>
                </div>
                <div class="card-actions">
                    <span class="action-label">Glossário de termos de enfermagem</span>
                </div>
            </div>
            
            <!-- Restaurar Padrões -->
            <div class="accessibility-card" id="accessibility-restore">
                <div class="card-icon">
                    <svg class="restore" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M2.5 2v6h6M21.5 22v-6h-6"/>
                        <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">Restaurar Padrões</h3>
                </div>
            </div>
        </div>
        
        <!-- Modal de Atalhos de Teclado -->
        <div id="shortcuts-modal" class="modal hidden" role="dialog" aria-label="Atalhos de Teclado" aria-modal="true" hidden>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Atalhos de Teclado</h2>
                    <button id="shortcuts-close" class="icon-btn close-btn" aria-label="Fechar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="browser-tabs">
                    <button class="browser-tab active" data-browser="chrome">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                        Chrome
                    </button>
                    <button class="browser-tab" data-browser="firefox">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.8-.13 2.61-.36-.14-.76-.22-1.55-.22-2.36 0-3.52 1.28-6.63 3.32-8.77-1.08-.72-2.26-1.08-3.51-1.08-1.25 0-2.43.36-3.51 1.08 2.04 2.14 3.32 5.25 3.32 8.77 0 .81-.08 1.6-.22 2.36.81.23 1.68.36 2.61.36 5.5 0 10-4.5 10-10s-4.5-10-10-10z"/>
                        </svg>
                        Firefox
                    </button>
                </div>
                <div class="shortcuts-list" id="shortcuts-list"></div>
            </div>
        </div>
        
        <!-- Modal de Dicionário -->
        <div id="glossary-modal" class="modal hidden" role="dialog" aria-label="Dicionário de Termos" aria-modal="true" hidden>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Dicionário de Termos</h2>
                    <button class="icon-btn close-btn" aria-label="Fechar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="glossary-search">
                    <input type="text" id="glossary-search-input" placeholder="Buscar termo..." aria-label="Buscar no dicionário">
                </div>
                <div class="glossary-filter">
                    <button class="alphabet-letter active" data-letter="all">Todos</button>
                    <button class="alphabet-letter" data-letter="A">A</button>
                    <button class="alphabet-letter" data-letter="B">B</button>
                    <button class="alphabet-letter" data-letter="C">C</button>
                    <button class="alphabet-letter" data-letter="D">D</button>
                    <button class="alphabet-letter" data-letter="G">G</button>
                    <button class="alphabet-letter" data-letter="H">H</button>
                    <button class="alphabet-letter" data-letter="I">I</button>
                    <button class="alphabet-letter" data-letter="P">P</button>
                    <button class="alphabet-letter" data-letter="S">S</button>
                    <button class="alphabet-letter" data-letter="V">V</button>
                </div>
                <div class="glossary-list" id="glossary-list"></div>
                <div id="glossary-empty" class="glossary-empty" style="display: none;">Nenhum termo encontrado</div>
            </div>
        </div>
        
        <!-- Announcer para Leitores de Tela -->
        <div id="sr-announcer" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    `;
    
    // ==========================================
    // INJEÇÃO DE HTML NO CONTAINER
    // ==========================================
    function injectAccessibilityHTML() {
        const container = AccessibilityContext.getContainer();
        if (!container) {
            log('Container #accessibility-v2-container não encontrado', 'error');
            return false;
        }
        
        if (container.querySelector('#accessibility-toggle')) {
            log('HTML de acessibilidade já injetado anteriormente');
            return true;
        }
        
        container.innerHTML = ACCESSIBILITY_HTML;
        log('HTML de acessibilidade injetado com sucesso');
        return true;
    }
    
    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function init() {
        if (state.initialized) {
            log('Módulo já inicializado', 'warn');
            return;
        }
        
        log('Inicializando módulo de acessibilidade...');
        
        // Detectar contexto
        AccessibilityContext.detect();
        
        // Injetar HTML no container
        if (!injectAccessibilityHTML()) {
            log('Falha ao injetar HTML de acessibilidade', 'error');
            return;
        }
        
        // Selecionar elementos do DOM
        const selectors = {
            accessibilityToggle: '#accessibility-toggle',
            accessibilityClose: '#accessibility-close',
            accessibilityPanel: '#accessibility-panel',
            librasToggle: '#libras-toggle-top',
            shortcutsModal: '#shortcuts-modal',
            glossaryModal: '#glossary-modal'
        };
        
        state.elements = getElements(selectors);
        
        if (!state.elements.accessibilityPanel) {
            log('Elementos do painel de acessibilidade não encontrados', 'error');
            return;
        }
        
        // Garantir que todos os modais estejam escondidos no início
        [state.elements.shortcutsModal, state.elements.glossaryModal].forEach(modal => {
            if (modal) {
                modal.classList.remove('visible');
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
                modal.style.display = 'none';
            }
        });
        
        // Iniciar integração com EventBus
        setupAccessibilityEventBusIntegration();
        
        // Inicializar gerenciadores
        AccessibilityManager.init();
        LibrasManager.init();
        setupEventListeners();
        
        state.initialized = true;
        log('Módulo de acessibilidade inicializado com sucesso');
        
        // Disparar evento de ready
        emitAccessibilityEvent('ready', { initialized: true });
    }
    
    function initAccessibility() {
        const checkContainer = () => {
            if (AccessibilityContext.getContainer()) {
                init();
            } else {
                setTimeout(checkContainer, 50);
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkContainer);
        } else {
            checkContainer();
        }
    }
    
    // ==========================================
    // EXPOR API PÚBLICA
    // ==========================================
    window.AccessibilityInit = initAccessibility;
    
    window.AccessibilityAPI = {
        openPanel: () => PanelManager.open(),
        closePanel: () => PanelManager.close(),
        togglePanel: () => PanelManager.toggle(),
        toggleLibras: () => LibrasManager.toggle(),
        applyAction: (action, param) => AccessibilityManager.applyAction(action, param),
        restoreAll: () => AccessibilityManager.restoreAll(),
        getState: () => ({ ...state }),
        getPageContent: () => LibrasManager.getPageContent(),
        getVLibrasStatus: () => LibrasManager.getVLibrasStatus(),
        activateLibras: () => {
            state.isLibrasActive = true;
            LibrasManager.activateLibras();
        },
        deactivateLibras: () => {
            state.isLibrasActive = false;
            LibrasManager.deactivateLibras();
        }
    };
    
    // Expor objeto global para coordenação
    window.AccessibilityApp = {
        isReady: () => state.initialized,
        getState: () => window.AccessibilityAPI.getState()
    };
    
})();
