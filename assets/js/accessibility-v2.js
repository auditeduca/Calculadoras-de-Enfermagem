/**
 * Accessibility Widget Module v2.1 - Ajustado para teste5.html
 * Gerencia o painel de acessibilidade e recursos assistivos
 * Integração otimizada para Calculadoras de Enfermagem
 * Integração com EventBus para comunicação entre módulos
 * Suporte melhorado para VLibras
 */
(function() {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES E CONSTANTES
    // ==========================================
    const CONFIG = {
        storageKeys: {
            settings: "ce_accessibility_settings"
        },
        fontSizeLevels: [0.875, 1, 1.125, 1.25, 1.5],
        fontSizeLabels: ["85%", "100%", "112.5%", "125%", "150%"],
        containerId: "accessibility-v2-container",
        vlibrasConfig: {
            scriptUrl: "https://vlibras.gov.br/app/vlibras.js",
            autoLoad: true,
            autoInit: true
        }
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
        vlibrasReady: false,
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
        announcer.textContent = message;
        if (!getElement("sr-announcer")) {
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
                log("Painel não encontrado - não é possível abrir", "error");
                return;
            }

            state.isPanelOpen = true;
            accessibilityPanel.classList.remove("accessibility-panel-hidden");
            accessibilityPanel.classList.add("accessibility-panel-visible");
            accessibilityPanel.removeAttribute("hidden");

            if (accessibilityToggle) {
                accessibilityToggle.classList.add("active");
                accessibilityToggle.setAttribute("aria-expanded", "true");
            }

            // Usar classe CSS em vez de style inline
            document.body.classList.add("accessibility-panel-open");
            log("Painel de acessibilidade aberto");
            announce("Painel de acessibilidade aberto");

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
                log("Painel não encontrado - não é possível fechar", "error");
                return;
            }

            state.isPanelOpen = false;
            accessibilityPanel.classList.remove("accessibility-panel-visible");
            accessibilityPanel.classList.add("accessibility-panel-hidden");
            accessibilityPanel.setAttribute("hidden", "");

            if (accessibilityToggle) {
                accessibilityToggle.classList.remove("active");
                accessibilityToggle.setAttribute("aria-expanded", "false");
            }

            // Usar classe CSS em vez de style inline
            document.body.classList.remove("accessibility-panel-open");
            log("Painel de acessibilidade fechado");
            announce("Painel de acessibilidade fechado");
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
    // GERENCIADOR DE VLIBRAS (MELHORADO)
    // ==========================================
    const LibrasManager = {
        vlibrasWidget: null,
        isVLibrasLoaded: false,
        vlibrasAPI: null,
        
        init() {
            const { librasToggle } = state.elements;
            if (librasToggle) {
                librasToggle.addEventListener("click", () => this.toggle());
            } else {
                log("Botão de Libras não encontrado no DOM", "warn");
            }
            
            this.checkVLibrasLoaded();
            this.observeVLibrasLoad();
            this.setupVLibrasAPI();
            
            log("Gerenciador de Libras inicializado");
        },

        checkVLibrasLoaded() {
            // Verificar VLibras oficial
            if (window.vw) {
                this.isVLibrasLoaded = true;
                this.vlibrasAPI = window.vw;
                log("VLibras oficial detectado");
                state.vlibrasReady = true;
                return;
            }
            
            // Verificar elemento VLibras
            const vlibrasElements = document.querySelector('[class*="vlibras"], #vw-widget, #vlibras-widget, [vw-plugin-wrapper]');
            if (vlibrasElements) {
                this.isVLibrasLoaded = true;
                this.vlibrasWidget = vlibrasElements;
                log("Elemento VLibras detectado na página");
                state.vlibrasReady = true;
            }
        },

        setupVLibrasAPI() {
            // Verificar se VLibras está disponível via API
            if (window.vw && typeof window.vw.start === 'function') {
                this.vlibrasAPI = window.vw;
                log("VLibras API oficial disponível");
                state.vlibrasReady = true;
            }
        },

        observeVLibrasLoad() {
            if (window.MutationObserver) {
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1) {
                                // Verificar por ID
                                if (node.id && (node.id.toLowerCase().includes('vlibras') || node.id.toLowerCase().includes('vw'))) {
                                    this.isVLibrasLoaded = true;
                                    this.vlibrasWidget = node;
                                    state.vlibrasReady = true;
                                    log("VLibras detectado via MutationObserver");
                                    observer.disconnect();
                                    return;
                                }
                                // Verificar por classe
                                if (node.className && typeof node.className === 'string' && 
                                    (node.className.toLowerCase().includes('vlibras') || 
                                     node.className.toLowerCase().includes('vw-widget'))) {
                                    this.isVLibrasLoaded = true;
                                    this.vlibrasWidget = node;
                                    state.vlibrasReady = true;
                                    log("VLibras detectado via MutationObserver");
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
                librasToggle.classList.toggle("active", state.isLibrasActive);
                librasToggle.setAttribute("aria-pressed", state.isLibrasActive);
            }
            
            if (state.isLibrasActive) {
                this.activateLibras();
            } else {
                this.deactivateLibras();
            }
            
            // Emitir evento via EventBus
            emitAccessibilityEvent('libras:toggled', {
                isActive: state.isLibrasActive,
                vlibrasReady: state.vlibrasReady
            });
            
            announce(state.isLibrasActive ? "Tradutor de Libras ativado" : "Tradutor de Libras desativado");
            log(state.isLibrasActive ? "Libras ativado" : "Libras desativado");
        },

        activateLibras() {
            log("Ativando tradução LIBRAS...");
            
            // Tentar usar API VLibras oficial
            if (this.vlibrasAPI && typeof this.vlibrasAPI.start === 'function') {
                try {
                    this.vlibrasAPI.start();
                    log("VLibras ativado via API oficial");
                    return;
                } catch (e) {
                    log(`Erro ao usar API VLibras: ${e.message}`, "warn");
                }
            }
            
            // Fallback: extrair conteúdo para tradução
            const pageContent = this.extractPageContent();
            
            if (pageContent && pageContent.text) {
                log(`Conteúdo extraído: ${pageContent.text.length} caracteres`);
                
                if (this.isVLibrasLoaded && this.vlibrasWidget) {
                    this.sendToVLibras(pageContent.text);
                } else {
                    this.showLibrasInstructions(pageContent);
                }
            } else {
                log("Nenhum conteúdo encontrado para tradução", "warn");
                announce("Nenhum conteúdo encontrável para tradução");
            }
        },

        deactivateLibras() {
            log("Desativando tradução LIBRAS");
            
            // Tentar usar API VLibras oficial
            if (this.vlibrasAPI && typeof this.vlibrasAPI.stop === 'function') {
                try {
                    this.vlibrasAPI.stop();
                    log("VLibras desativado via API oficial");
                    return;
                } catch (e) {
                    log(`Erro ao desativar VLibras: ${e.message}`, "warn");
                }
            }
            
            // Fallback: fechar widget
            if (this.vlibrasWidget) {
                const closeBtn = this.vlibrasWidget.querySelector('.vw-close, .vlibras-close, [class*="close"]');
                if (closeBtn) {
                    closeBtn.click();
                }
            }
            
            const instructions = document.getElementById('libras-instructions');
            if (instructions) {
                instructions.remove();
            }
        },

        extractPageContent() {
            const contentSelectors = [
                '#main-v2-content',    // Estrutura modular
                'main',
                '[role="main"]',
                '#content',
                '#main-content',
                '.main-content',
                '.content',
                'article',
                '.post',
                '.page-content',
                '.entry-content'
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
                log("Usando body como conteúdo fallback");
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
                'script',
                'style',
                'noscript',
                'iframe',
                'nav',
                'header',
                'footer',
                '.navigation',
                '.nav',
                '.menu',
                '.sidebar',
                '.advertisement',
                '.ads',
                '[role="navigation"]',
                '[role="banner"]',
                '[role="contentinfo"]'
            ];
            
            const clone = element.cloneNode(true);
            
            excludeSelectors.forEach(selector => {
                clone.querySelectorAll(selector).forEach(el => el.remove());
            });
            
            let text = clone.textContent || clone.innerText || '';
            
            text = text
                .replace(/\s+/g, ' ')
                .replace(/^\s+|\s+$/g, '')
                .trim();
            
            return text;
        },

        sendToVLibras(text) {
            log("Enviando conteúdo para VLibras");
            
            if (window.vlibras && typeof window.vlibras.translate === 'function') {
                try {
                    window.vlibras.translate(text);
                    log("Tradução enviada via API VLibras");
                    return true;
                } catch (e) {
                    log(`Erro ao usar API VLibras: ${e.message}`, "warn");
                }
            }
            
            const vlibrasFrame = document.querySelector('iframe[src*="vlibras"]');
            if (vlibrasFrame) {
                try {
                    vlibrasFrame.contentWindow.postMessage({
                        type: 'VLIBRAS_TRANSLATE',
                        text: text
                    }, '*');
                    log("Tradução enviada via postMessage");
                    return true;
                } catch (e) {
                    log(`Erro ao enviar via postMessage: ${e.message}`, "warn");
                }
            }
            
            this.openVLibrasWidget(text);
            
            return false;
        },

        openVLibrasWidget(text) {
            log("Abrindo widget VLibras para tradução");
            
            const vlibrasBtn = document.querySelector('[class*="vlibras"], #vw-button, .vw-widget-btn, [onclick*="vlibras"]');
            
            if (vlibrasBtn) {
                if (typeof vlibrasBtn.click === 'function') {
                    vlibrasBtn.click();
                    log("Botão VLibras clicado");
                }
            } else {
                this.showLibrasInstructions({
                    title: document.title,
                    text: text
                });
            }
        },

        showLibrasInstructions(content) {
            log("Exibindo instruções do LIBRAS");
            
            const existingInstructions = document.getElementById('libras-instructions');
            if (existingInstructions) {
                existingInstructions.remove();
            }
            
            const instructions = document.createElement('div');
            instructions.id = 'libras-instructions';
            instructions.className = 'accessibility-libras-instructions';
            instructions.setAttribute('role', 'alert');
            instructions.setAttribute('aria-live', 'polite');
            
            instructions.innerHTML = `
                <div class="libras-instructions-content">
                    <h3>Tradutor LIBRAS</h3>
                    <p>O conteúdo da página foi preparado para tradução.</p>
                    <p><strong>Instruções:</strong></p>
                    <ol>
                        <li>Clique no botão do VLibras (tradutor em Libras) disponível na página</li>
                        <li>O tradutor exibirá o conteúdo em língua de sinais</li>
                    </ol>
                    <button id="libras-close-instructions" class="libras-close-btn">Fechar</button>
                </div>
            `;
            
            document.body.appendChild(instructions);
            
            const closeBtn = instructions.querySelector('#libras-close-instructions');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    instructions.remove();
                });
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
                isActive: state.isLibrasActive,
                apiReady: !!this.vlibrasAPI
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
            log("Gerenciador de acessibilidade inicializado");
        },

        setupCards() {
            const cards = document.querySelectorAll(".accessibility-card[data-action]");
            cards.forEach(card => {
                card.addEventListener("click", () => {
                    const action = card.dataset.action;
                    const param = card.dataset.param || null;
                    this.applyAction(action, param);
                });
            });
        },

        setupSpecialButtons() {
            const shortcutsBtn = getElement("shortcuts-btn");
            if (shortcutsBtn) {
                shortcutsBtn.addEventListener("click", () => this.showShortcuts());
            }

            const glossaryBtn = getElement("glossary-btn");
            if (glossaryBtn) {
                glossaryBtn.addEventListener("click", () => this.showGlossary());
            }

            const restoreBtn = getElement("accessibility-restore");
            if (restoreBtn) {
                restoreBtn.addEventListener("click", () => {
                    this.restoreAll();
                    announce("Configurações de acessibilidade restauradas para padrões");
                });
            }
        },

        applyAction(action, param) {
            switch (action) {
                case "font-size":
                    this.applyFontSize(param);
                    break;
                case "contrast":
                    this.applyContrast(param);
                    break;
                case "colorblind":
                    this.applyColorblind(param);
                    break;
                case "saturation":
                    this.applySaturation(param);
                    break;
                case "cursor":
                    this.applyCursor(param);
                    break;
                case "reading-guide":
                    this.applyReadingGuide(param);
                    break;
                case "highlight-links":
                    this.toggleHighlightLinks();
                    break;
                case "highlight-headers":
                    this.toggleHighlightHeaders();
                    break;
                case "bold-text":
                    this.toggleBoldText();
                    break;
                case "stop-anim":
                    this.toggleStopAnim();
                    break;
                case "hide-images":
                    this.toggleHideImages();
                    break;
                case "reading-mode":
                    this.toggleReadingMode();
                    break;
                default:
                    log(`Ação desconhecida: ${action}`, "warn");
            }
            
            emitSettingsChangedEvent(state.currentSettings);
        },

        applyFontSize(param) {
            let index = state.currentSettings.fontSize;
            switch (param) {
                case "decrease":
                    index = Math.max(0, index - 1);
                    break;
                case "increase":
                    index = Math.min(CONFIG.fontSizeLevels.length - 1, index + 1);
                    break;
                case "reset":
                    index = 1;
                    break;
            }
            state.currentSettings.fontSize = index;
            const multiplier = CONFIG.fontSizeLevels[index];
            document.documentElement.style.setProperty("--font-size-multiplier", multiplier);
            document.body.setAttribute("data-font-index", index);
            announce(`Tamanho da fonte: ${CONFIG.fontSizeLabels[index]}`);
            log(`Fonte ajustada para: ${CONFIG.fontSizeLabels[index]}`);
        },

        applyContrast(param) {
            state.currentSettings.contrast = param;
            document.body.classList.remove("inverted-colors", "high-contrast-light", "high-contrast-dark", "inverted", "light-contrast", "dark-contrast");

            switch (param) {
                case "inverted":
                case "inverted-colors":
                    document.body.classList.add("inverted-colors", "inverted");
                    announce("Cores invertidas ativadas");
                    break;
                case "light-contrast":
                    document.body.classList.add("high-contrast-light", "light-contrast");
                    announce("Alto contraste claro ativado");
                    break;
                case "dark-contrast":
                    document.body.classList.add("high-contrast-dark", "dark-contrast");
                    announce("Alto contraste escuro ativado");
                    break;
                default:
                    announce("Contraste normal");
            }
        },

        applyColorblind(param) {
            state.currentSettings.colorblind = param;
            const html = document.documentElement;
            html.classList.remove("protanopia", "deuteranopia", "tritanopia");

            if (param !== "none" && param !== "normal") {
                html.classList.add(param);
            }

            const labels = {
                protanopia: "Protanopia",
                deuteranopia: "Deuteranopia",
                tritanopia: "Tritanopia"
            };
            announce(param !== "none" && param !== "normal" ? `${labels[param]} ativado` : "Filtros de cores desativados");
        },

        applySaturation(param) {
            state.currentSettings.saturation = param;
            document.body.classList.remove("low-saturation", "high-saturation", "monochrome", "saturation-low", "saturation-high");

            switch (param) {
                case "low":
                case "saturation-low":
                    document.body.classList.add("low-saturation", "saturation-low");
                    announce("Baixa saturação ativada");
                    break;
                case "high":
                case "saturation-high":
                    document.body.classList.add("high-saturation", "saturation-high");
                    announce("Alta saturação ativada");
                    break;
                case "monochrome":
                    document.body.classList.add("monochrome");
                    announce("Modo monocromático ativado");
                    break;
                default:
                    announce("Saturação normal");
            }
        },

        applyCursor(param) {
            state.currentSettings.cursor = param;
            document.body.classList.remove("large-cursor", "xl-cursor", "big-cursor-medium", "big-cursor-large", "big-cursor-xlarge");

            switch (param) {
                case "medium":
                    document.body.classList.add("large-cursor", "big-cursor-medium");
                    announce("Cursor grande ativado");
                    break;
                case "large":
                    document.body.classList.add("xl-cursor", "big-cursor-large");
                    announce("Cursor extra grande ativado");
                    break;
                default:
                    announce("Cursor normal");
            }
        },

        applyReadingGuide(param) {
            state.currentSettings.readingGuide = param;

            const existingGuide = document.querySelector(".reading-guide, #reading-guide");
            if (existingGuide) {
                existingGuide.remove();
            }

            if (param !== "none" && param !== "off") {
                const guide = document.createElement("div");
                guide.id = "reading-guide";
                guide.className = "reading-guide";
                guide.style.display = "block";
                
                switch (param) {
                    case "azul":
                        guide.classList.add("guide-azul");
                        break;
                    case "laranja":
                        guide.classList.add("guide-laranja");
                        break;
                    case "preto":
                        guide.classList.add("guide-preto");
                        break;
                }
                
                document.body.appendChild(guide);

                document.addEventListener("mousemove", function guideFollow(e) {
                    const g = document.getElementById("reading-guide");
                    if (g) {
                        g.style.top = `${e.clientY - 25}px`;
                        g.style.left = `${e.clientX - 100}px`;
                    } else {
                        document.removeEventListener("mousemove", guideFollow);
                    }
                });

                announce("Guia de leitura ativado");
            } else {
                announce("Guia de leitura desativado");
            }
        },

        toggleHighlightLinks() {
            state.currentSettings.highlightLinks = !state.currentSettings.highlightLinks;
            document.body.classList.toggle("highlight-links", state.currentSettings.highlightLinks);
            announce(state.currentSettings.highlightLinks ? "Links destacados" : "Links não destacados");
        },

        toggleHighlightHeaders() {
            state.currentSettings.highlightHeaders = !state.currentSettings.highlightHeaders;
            document.body.classList.toggle("highlight-headers", state.currentSettings.highlightHeaders);
            announce(state.currentSettings.highlightHeaders ? "Títulos destacados" : "Títulos não destacados");
        },

        toggleBoldText() {
            state.currentSettings.boldText = !state.currentSettings.boldText;
            document.body.classList.toggle("bold-text", state.currentSettings.boldText);
            announce(state.currentSettings.boldText ? "Texto em negrito ativado" : "Texto em negrito desativado");
        },

        toggleStopAnim() {
            state.currentSettings.stopAnim = !state.currentSettings.stopAnim;
            document.body.classList.toggle("reduced-motion", state.currentSettings.stopAnim);
            document.body.classList.toggle("stop-anim", state.currentSettings.stopAnim);
            
            if (state.currentSettings.stopAnim) {
                document.documentElement.style.setProperty("--transition-duration", "0s");
            } else {
                document.documentElement.style.removeProperty("--transition-duration");
            }
            announce(state.currentSettings.stopAnim ? "Animações paradas" : "Animações ativadas");
        },

        toggleHideImages() {
            state.currentSettings.hideImages = !state.currentSettings.hideImages;
            document.body.classList.toggle("hide-images", state.currentSettings.hideImages);
            announce(state.currentSettings.hideImages ? "Imagens escondidas" : "Imagens visíveis");
        },

        toggleReadingMode() {
            state.currentSettings.readingMode = !state.currentSettings.readingMode;
            document.body.classList.toggle("reading-mode", state.currentSettings.readingMode);
            
            if (state.currentSettings.readingMode) {
                document.body.classList.add("hide-navigational", "focused-content");
            } else {
                document.body.classList.remove("hide-navigational", "focused-content");
            }
            announce(state.currentSettings.readingMode ? "Modo leitura ativado" : "Modo leitura desativado");
        },

        showShortcuts() {
            const modal = getElement("shortcuts-modal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("visible");
                modal.setAttribute("aria-hidden", "false");
                modal.style.display = "flex";
                document.body.classList.add("accessibility-modal-open");

                this.renderShortcuts();

                const closeBtn = modal.querySelector("#shortcuts-close");
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
            }
        },

        renderShortcuts() {
            const shortcutsList = getElement("shortcuts-list");
            if (!shortcutsList) return;

            const shortcuts = [
                { key: "Alt + 1", action: "Ir para conteúdo principal" },
                { key: "Alt + 2", action: "Ir para rodapé" },
                { key: "Alt + A", action: "Abrir painel de acessibilidade" },
                { key: "Alt + +", action: "Aumentar fonte" },
                { key: "Alt + -", action: "Diminuir fonte" },
                { key: "Alt + 0", action: "Restaurar tamanho padrão" },
                { key: "Esc", action: "Fechar painéis modais" }
            ];

            shortcutsList.innerHTML = shortcuts.map(shortcut => `
                <div class="shortcut-item">
                    <kbd>${shortcut.key}</kbd>
                    <span>${shortcut.action}</span>
                </div>
            `).join("");

            this.setupShortcutsTabs();
        },

        setupShortcutsTabs() {
            const tabs = document.querySelectorAll(".browser-tab");
            tabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    tabs.forEach(t => {
                        t.classList.remove("active");
                        t.setAttribute("aria-selected", "false");
                    });
                    tab.classList.add("active");
                    tab.setAttribute("aria-selected", "true");
                });
            });
        },

        showGlossary() {
            const modal = getElement("glossary-modal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("visible");
                modal.setAttribute("aria-hidden", "false");
                modal.style.display = "flex";
                document.body.classList.add("accessibility-modal-open");

                this.renderGlossary();

                const searchInput = getElement("glossary-search-input");
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        },

        renderGlossary() {
            const glossaryList = getElement("glossary-list");
            if (!glossaryList) return;

            const terms = [
                { letter: "A", term: "Afusão", definition: "Introdução gradual de líquido em uma veia." },
                { letter: "B", term: "Balanço Hídrico", definition: "Registro de líquidos administrados e eliminados." },
                { letter: "C", term: "Cateterismo", definition: "Introdução de cateter em cavidade corporal." },
                { letter: "D", term: "Diurético", definition: "Medicamento que aumenta a produção de urina." },
                { letter: "G", term: "Glicemia", definition: "Taxa de açúcar no sangue." },
                { letter: "H", term: "Hematoma", definition: "Acúmulo de sangue fora dos vasos." },
                { letter: "I", term: "Insulina", definition: "Hormônio que regula a glicose no sangue." },
                { letter: "P", term: "Punção Venosa", definition: "Procedimento para acessar veia periférica." },
                { letter: "S", term: "Soro", definition: "Solução aquosa de sais minerais." },
                { letter: "V", term: "Venopunção", definition: "Procedimento de punctura de veia." }
            ];

            glossaryList.innerHTML = terms.map(item => `
                <li class="glossary-item" data-letter="${item.letter}">
                    <dt class="glossary-term">${item.term}</dt>
                    <dd class="glossary-definition">${item.definition}</dd>
                </li>
            `).join("");

            this.setupGlossarySearch();
            this.setupGlossaryFilter();
        },

        setupGlossarySearch() {
            const searchInput = getElement("glossary-search-input");
            if (!searchInput) return;

            searchInput.addEventListener("input", () => {
                const query = searchInput.value.toLowerCase();
                const items = document.querySelectorAll(".glossary-item");
                const empty = getElement("glossary-empty");

                let hasResults = false;
                items.forEach(item => {
                    const term = item.querySelector(".glossary-term").textContent.toLowerCase();
                    const definition = item.querySelector(".glossary-definition").textContent.toLowerCase();
                    const matches = term.includes(query) || definition.includes(query);
                    item.style.display = matches ? "block" : "none";
                    if (matches) hasResults = true;
                });

                if (empty) {
                    empty.style.display = hasResults ? "none" : "block";
                }
            });
        },

        setupGlossaryFilter() {
            const letters = document.querySelectorAll(".alphabet-letter");
            letters.forEach(letter => {
                letter.addEventListener("click", () => {
                    const selectedLetter = letter.dataset.letter;
                    letters.forEach(l => l.classList.remove("active"));
                    letter.classList.add("active");

                    const items = document.querySelectorAll(".glossary-item");
                    items.forEach(item => {
                        if (selectedLetter === "all") {
                            item.style.display = "block";
                        } else {
                            item.style.display = item.dataset.letter === selectedLetter ? "block" : "none";
                        }
                    });
                });
            });
        },

        restoreAll() {
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

            document.body.classList.remove(
                "inverted-colors", "high-contrast-light", "high-contrast-dark",
                "inverted", "light-contrast", "dark-contrast",
                "low-saturation", "high-saturation", "monochrome",
                "saturation-low", "saturation-high",
                "large-cursor", "xl-cursor",
                "big-cursor-medium", "big-cursor-large", "big-cursor-xlarge",
                "highlight-links", "highlight-headers",
                "bold-text", "reduced-motion", "stop-anim",
                "hide-images", "reading-mode",
                "hide-navigational", "focused-content"
            );

            document.documentElement.classList.remove(
                "protanopia", "deuteranopia", "tritanopia"
            );

            const readingGuide = document.querySelector(".reading-guide, #reading-guide");
            if (readingGuide) {
                readingGuide.remove();
            }

            document.documentElement.style.removeProperty("--font-size-multiplier");
            document.documentElement.style.removeProperty("--transition-duration");
            document.body.removeAttribute("data-font-index");

            const images = document.querySelectorAll("img, video");
            images.forEach(img => {
                img.style.visibility = "";
            });

            log("Todos os recursos de acessibilidade restaurados");
            
            emitSettingsChangedEvent(state.currentSettings);
        }
    };

    // ==========================================
    // GERENCIADOR DE EVENTOS
    // ==========================================
    function setupEventListeners() {
        const { accessibilityToggle, accessibilityClose, accessibilityPanel } = state.elements;

        if (accessibilityToggle) {
            log("Registrando evento de clique no botão de acessibilidade");
            accessibilityToggle.addEventListener("click", (e) => {
                log("Botão de acessibilidade clicado");
                e.preventDefault();
                PanelManager.toggle();
            });
        } else {
            log("Botão de acessibilidade não encontrado", "error");
        }

        if (accessibilityClose) {
            log("Registrando evento de clique no botão de fechar");
            accessibilityClose.addEventListener("click", (e) => {
                e.preventDefault();
                PanelManager.close();
            });
        } else {
            log("Botão de fechar não encontrado", "warn");
        }

        if (accessibilityPanel) {
            accessibilityPanel.addEventListener("click", (e) => {
                if (e.target === accessibilityPanel) {
                    PanelManager.close();
                }
            });
        }

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (state.isPanelOpen) {
                    PanelManager.close();
                    return;
                }
                const shortcutsModal = getElement("shortcuts-modal");
                const glossaryModal = getElement("glossary-modal");
                if (shortcutsModal && shortcutsModal.classList.contains("visible")) {
                    shortcutsModal.classList.remove("visible");
                    shortcutsModal.classList.add("hidden");
                    shortcutsModal.setAttribute("aria-hidden", "true");
                    shortcutsModal.style.display = "none";
                    document.body.classList.remove("accessibility-modal-open");
                }
                if (glossaryModal && glossaryModal.classList.contains("visible")) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.setAttribute("aria-hidden", "true");
                    glossaryModal.style.display = "none";
                    document.body.classList.remove("accessibility-modal-open");
                }
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.altKey && e.key === "a") {
                e.preventDefault();
                PanelManager.toggle();
            }
        });

        const shortcutsClose = getElement("shortcuts-close");
        if (shortcutsClose) {
            shortcutsClose.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                const shortcutsModal = getElement("shortcuts-modal");
                if (shortcutsModal) {
                    shortcutsModal.classList.remove("visible");
                    shortcutsModal.classList.add("hidden");
                    shortcutsModal.setAttribute("aria-hidden", "true");
                    shortcutsModal.style.display = "none";
                    document.body.classList.remove("accessibility-modal-open");
                    log("Modal de atalhos fechado");
                }
            });
        }

        const glossaryModal = getElement("glossary-modal");
        if (glossaryModal) {
            const closeBtn = glossaryModal.querySelector(".icon-btn");
            if (closeBtn) {
                closeBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.setAttribute("aria-hidden", "true");
                    glossaryModal.style.display = "none";
                    document.body.classList.remove("accessibility-modal-open");
                    log("Modal de dicionário fechado");
                });
            }
        }

        const shortcutsModalEl = getElement("shortcuts-modal");
        if (shortcutsModalEl) {
            shortcutsModalEl.addEventListener("click", function(e) {
                if (e.target === shortcutsModalEl) {
                    shortcutsModalEl.classList.remove("visible");
                    shortcutsModalEl.classList.add("hidden");
                    shortcutsModalEl.setAttribute("aria-hidden", "true");
                    shortcutsModalEl.style.display = "none";
                    document.body.classList.remove("accessibility-modal-open");
                }
            });
        }

        if (glossaryModal) {
            glossaryModal.addEventListener("click", function(e) {
                if (e.target === glossaryModal) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.setAttribute("aria-hidden", "true");
                    glossaryModal.style.display = "none";
                    document.body.classList.remove("accessibility-modal-open");
                }
            });
        }
    }

    // ==========================================
    // CARREGAMENTO DO HTML TEMPLATE
    // ==========================================
    function loadAccessibilityHTML() {
        const container = getElement(CONFIG.containerId);
        if (!container) {
            log("Container não encontrado. Tentando novamente...", "warn");
            setTimeout(loadAccessibilityHTML, 100);
            return;
        }

        // Carregar HTML do arquivo separado via fetch
        fetch('accessibility-v2.html')
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
                log("HTML de acessibilidade carregado via fetch");
                initializeAccessibility();
            })
            .catch(error => {
                log(`Erro ao carregar HTML: ${error.message}`, "error");
                // Fallback: tentar carregar do template inline
                initializeAccessibility();
            });
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function initializeAccessibility() {
        if (state.initialized) {
            log("Acessibilidade já foi inicializada", "warn");
            return;
        }

        const container = getElement(CONFIG.containerId);
        if (!container) {
            log("Container não encontrado", "error");
            return;
        }

        // Obter elementos
        state.elements = getElements({
            accessibilityToggle: "#accessibility-toggle",
            accessibilityClose: "#accessibility-close",
            accessibilityPanel: "#accessibility-panel",
            librasToggle: "#libras-toggle-top"
        });

        // Inicializar managers
        setupEventListeners();
        LibrasManager.init();
        AccessibilityManager.init();
        setupAccessibilityEventBusIntegration();

        // Carregar configurações salvas
        const saved = localStorage.getItem(CONFIG.storageKeys.settings);
        if (saved) {
            try {
                state.currentSettings = JSON.parse(saved);
                log("Configurações de acessibilidade carregadas do localStorage");
            } catch (e) {
                log("Erro ao carregar configurações", "warn");
            }
        }

        state.initialized = true;
        log("Acessibilidade inicializada com sucesso");
        
        // Emitir evento de ready
        emitAccessibilityEvent('ready', {
            initialized: true,
            vlibrasReady: state.vlibrasReady
        });
    }

    // ==========================================
    // INICIALIZAÇÃO GLOBAL
    // ==========================================
    window.AccessibilityInit = loadAccessibilityHTML;

    // Auto-inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAccessibilityHTML);
    } else {
        loadAccessibilityHTML();
    }

    // Expor API pública
    window.Accessibility = {
        PanelManager,
        LibrasManager,
        AccessibilityManager,
        getState: () => ({ ...state }),
        getSettings: () => ({ ...state.currentSettings }),
        updateSettings: (newSettings) => {
            state.currentSettings = { ...state.currentSettings, ...newSettings };
            emitSettingsChangedEvent(state.currentSettings);
        }
    };

})();
