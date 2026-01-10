/**
 * Accessibility Widget Module
 * Gerencia o painel de acessibilidade, recursos de Libras e todas as funcionalidades de acessibilidade
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
        vlibras: {
            appId: "YOUR_VLIBRAS_APP_ID", // Substituir pelo app ID real do VLibras
            url: "https://vlibras.gov.br/app"
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
        settings: {
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
    // PERSISTÊNCIA DE CONFIGURAÇÕES
    // ==========================================
    const SettingsManager = {
        save() {
            try {
                localStorage.setItem(CONFIG.storageKeys.settings, JSON.stringify(state.settings));
            } catch (e) {
                log(`Erro ao salvar configurações: ${e.message}`, "warn");
            }
        },

        load() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKeys.settings);
                if (saved) {
                    const settings = JSON.parse(saved);
                    state.settings = { ...state.settings, ...settings };
                    return true;
                }
            } catch (e) {
                log(`Erro ao carregar configurações: ${e.message}`, "warn");
            }
            return false;
        },

        reset() {
            state.settings = {
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
            this.save();
            this.applyAll();
            log("Configurações restauradas para padrões");
        }
    };

    // ==========================================
    // GERENCIADOR DO PAINEL
    // ==========================================
    const PanelManager = {
        open() {
            const { accessibilityPanel, accessibilityToggle } = state.elements;
            if (!accessibilityPanel) return;

            state.isPanelOpen = true;
            accessibilityPanel.classList.remove("accessibility-panel-hidden");
            accessibilityPanel.classList.add("accessibility-panel-visible");

            if (accessibilityToggle) {
                accessibilityToggle.classList.add("active");
                accessibilityToggle.setAttribute("aria-expanded", "true");
            }

            document.body.style.overflow = "hidden";
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
            if (!accessibilityPanel) return;

            state.isPanelOpen = false;
            accessibilityPanel.classList.remove("accessibility-panel-visible");
            accessibilityPanel.classList.add("accessibility-panel-hidden");

            if (accessibilityToggle) {
                accessibilityToggle.classList.remove("active");
                accessibilityToggle.setAttribute("aria-expanded", "false");
            }

            document.body.style.overflow = "";
            log("Painel de acessibilidade fechado");
            announce("Painel de acessibilidade fechado");
        },

        toggle() {
            if (state.isPanelOpen) {
                this.close();
            } else {
                this.open();
            }
        }
    };

    // ==========================================
    // GERENCIADOR DE LIBRAS (VLIBRAS)
    // ==========================================
    const LibrasManager = {
        init() {
            const { librasToggle } = state.elements;
            if (librasToggle) {
                librasToggle.addEventListener("click", () => this.toggle());
            }
            log("Gerenciador de Libras inicializado");
        },

        toggle() {
            state.isLibrasActive = !state.isLibrasActive;
            const { librasToggle, vlibrasContainer } = state.elements;

            if (librasToggle) {
                librasToggle.classList.toggle("active", state.isLibrasActive);
                librasToggle.setAttribute("aria-pressed", state.isLibrasActive);
            }

            if (vlibrasContainer) {
                if (state.isLibrasActive) {
                    vlibrasContainer.classList.remove("hidden");
                    vlibrasContainer.classList.add("visible");
                    this.loadVLibras();
                    announce("Tradutor de Libras ativado");
                } else {
                    vlibrasContainer.classList.remove("visible");
                    vlibrasContainer.classList.add("hidden");
                    this.unloadVLibras();
                    announce("Tradutor de Libras desativado");
                }
            }

            log(state.isLibrasActive ? "Libras ativado" : "Libras desativado");
        },

        loadVLibras() {
            // Verificar se VLibras já está carregado
            if (window.vlibras) {
                log("VLibras já está carregado");
                return;
            }

            // Iniciar configuração do VLibras
            if (typeof window.VLibras !== "undefined") {
                log("Inicializando VLibras...");
                try {
                    new window.VLibras(CONFIG.vlibras.appId);
                } catch (e) {
                    log(`Erro ao inicializar VLibras: ${e.message}`, "warn");
                    this.showPlaceholder();
                }
            } else {
                log("Carregando script do VLibras...");
                this.loadVLibrasScript();
            }
        },

        loadVLibrasScript() {
            const script = document.createElement("script");
            script.src = `${CONFIG.vlibras.url}/static/js/app.js`;
            script.async = true;
            script.onload = () => {
                log("Script do VLibras carregado");
                this.initVLibrasWidget();
            };
            script.onerror = () => {
                log("Erro ao carregar script do VLibras", "error");
                this.showPlaceholder();
            };
            document.head.appendChild(script);
        },

        initVLibrasWidget() {
            if (typeof window.VLibras !== "undefined") {
                try {
                    new window.VLibras(CONFIG.vlibras.appId);
                    log("VLibras inicializado com sucesso");
                } catch (e) {
                    log(`Erro ao inicializar VLibras: ${e.message}`, "warn");
                    this.showPlaceholder();
                }
            }
        },

        showPlaceholder() {
            const { vlibrasContainer } = state.elements;
            if (vlibrasContainer) {
                const placeholder = vlibrasContainer.querySelector(".vlibras-placeholder");
                if (placeholder) {
                    placeholder.innerHTML = `
                        <p><strong>VLibras</strong></p>
                        <p>O tradutor de Libras está sendo configurado.</p>
                        <p>Para usar, adicione seu App ID do VLibras no arquivo accessibility.js</p>
                    `;
                }
            }
        },

        unloadVLibras() {
            // Remover widget do VLibras se necessário
            const vlibrasWidget = document.querySelector("#vlibras-widget");
            if (vlibrasWidget) {
                vlibrasWidget.remove();
            }
        }
    };

    // ==========================================
    // GERENCIADOR DE ACESSIBILIDADE
    // ==========================================
    const AccessibilityManager = {
        init() {
            // Carregar configurações salvas
            this.loadSettings();

            // Configurar event listeners dos cards
            this.setupCards();

            // Configurar botões específicos
            this.setupSpecialButtons();

            // Configurar tema quando disponível
            this.setupThemeSync();

            log("Gerenciador de acessibilidade inicializado");
        },

        loadSettings() {
            if (SettingsManager.load()) {
                SettingsManager.applyAll();
            }
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
            // Atalhos de teclado
            const shortcutsBtn = getElement("shortcuts-btn");
            if (shortcutsBtn) {
                shortcutsBtn.addEventListener("click", () => this.showShortcuts());
            }

            // Dicionário
            const glossaryBtn = getElement("glossary-btn");
            if (glossaryBtn) {
                glossaryBtn.addEventListener("click", () => this.showGlossary());
            }

            // Restaurar padrões
            const restoreBtn = getElement("accessibility-restore");
            if (restoreBtn) {
                restoreBtn.addEventListener("click", () => {
                    SettingsManager.reset();
                    announce("Configurações de acessibilidade restauradas para padrões");
                });
            }
        },

        setupThemeSync() {
            // Sincronizar com o tema do header
            window.addEventListener("theme:changed", (e) => {
                if (e.detail && e.detail.theme) {
                    if (e.detail.theme === "dark") {
                        this.applyAction("contrast", "dark-contrast");
                    } else {
                        this.applyAction("contrast", "normal");
                    }
                }
            });
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
            SettingsManager.save();
        },

        // Aplicar tamanho da fonte
        applyFontSize(param) {
            let index = state.settings.fontSize;
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
            state.settings.fontSize = index;
            const multiplier = CONFIG.fontSizeLevels[index];
            document.documentElement.style.setProperty("--font-size-multiplier", multiplier);
            document.body.setAttribute("data-font-index", index);
            announce(`Tamanho da fonte: ${CONFIG.fontSizeLabels[index]}`);
            log(`Fonte ajustada para: ${CONFIG.fontSizeLabels[index]}`);
        },

        // Aplicar contraste
        applyContrast(param) {
            state.settings.contrast = param;
            document.body.classList.remove("inverted-colors", "high-contrast-light", "high-contrast-dark");

            switch (param) {
                case "inverted":
                    document.body.classList.add("inverted-colors");
                    announce("Cores invertidas ativadas");
                    break;
                case "light-contrast":
                    document.body.classList.add("high-contrast-light");
                    announce("Alto contraste claro ativado");
                    break;
                case "dark-contrast":
                    document.body.classList.add("high-contrast-dark");
                    announce("Alto contraste escuro ativado");
                    break;
                default:
                    announce("Contraste normal");
            }
        },

        // Aplicar filtro de daltionismo
        applyColorblind(param) {
            state.settings.colorblind = param;
            const html = document.documentElement;
            html.classList.remove("protanopia", "deuteranopia", "tritanopia");

            if (param !== "none") {
                html.classList.add(param);
            }

            const labels = {
                protanopia: "Protanopia",
                deuteranopia: "Deuteranopia",
                tritanopia: "Tritanopia"
            };
            announce(param !== "none" ? `${labels[param]} ativado` : "Filtros de cores desativados");
        },

        // Aplicar saturação
        applySaturation(param) {
            state.settings.saturation = param;
            document.body.classList.remove("low-saturation", "high-saturation", "monochrome");

            switch (param) {
                case "low":
                    document.body.classList.add("low-saturation");
                    announce("Baixa saturação ativada");
                    break;
                case "high":
                    document.body.classList.add("high-saturation");
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

        // Aplicar tamanho do cursor
        applyCursor(param) {
            state.settings.cursor = param;
            document.body.classList.remove("large-cursor", "xl-cursor");

            switch (param) {
                case "medium":
                    document.body.classList.add("large-cursor");
                    announce("Cursor grande ativado");
                    break;
                case "large":
                    document.body.classList.add("xl-cursor");
                    announce("Cursor extra grande ativado");
                    break;
                default:
                    announce("Cursor normal");
            }
        },

        // Aplicar guia de leitura
        applyReadingGuide(param) {
            state.settings.readingGuide = param;

            // Remover guias existentes
            const existingGuide = document.querySelector(".reading-guide");
            if (existingGuide) {
                existingGuide.remove();
            }

            if (param !== "none") {
                const guide = document.createElement("div");
                guide.className = "reading-guide";
                guide.style.backgroundColor = param === "azul" ? "rgba(30, 58, 138, 0.2)" :
                                             param === "laranja" ? "rgba(234, 88, 12, 0.2)" : "rgba(0, 0, 0, 0.2)";
                document.body.appendChild(guide);

                // Seguir mouse
                document.addEventListener("mousemove", (e) => {
                    guide.style.top = `${e.clientY - 25}px`;
                    guide.style.left = `${e.clientX - 100}px`;
                }, { once: true });

                announce("Guia de leitura ativado");
            } else {
                announce("Guia de leitura desativado");
            }
        },

        // Destacar links
        toggleHighlightLinks() {
            state.settings.highlightLinks = !state.settings.highlightLinks;
            document.body.classList.toggle("highlight-links", state.settings.highlightLinks);
            announce(state.settings.highlightLinks ? "Links destacados" : "Links não destacados");
        },

        // Destacar títulos
        toggleHighlightHeaders() {
            state.settings.highlightHeaders = !state.settings.highlightHeaders;
            document.body.classList.toggle("highlight-headers", state.settings.highlightHeaders);
            announce(state.settings.highlightHeaders ? "Títulos destacados" : "Títulos não destacados");
        },

        // Texto em negrito
        toggleBoldText() {
            state.settings.boldText = !state.settings.boldText;
            document.body.classList.toggle("bold-text", state.settings.boldText);
            announce(state.settings.boldText ? "Texto em negrito ativado" : "Texto em negrito desativado");
        },

        // Parar animações
        toggleStopAnim() {
            state.settings.stopAnim = !state.settings.stopAnim;
            document.body.classList.toggle("reduced-motion", state.settings.stopAnim);
            if (state.settings.stopAnim) {
                document.documentElement.style.setProperty("--transition-duration", "0s");
            } else {
                document.documentElement.style.removeProperty("--transition-duration");
            }
            announce(state.settings.stopAnim ? "Animações paradas" : "Animações ativadas");
        },

        // Esconder imagens
        toggleHideImages() {
            state.settings.hideImages = !state.settings.hideImages;
            document.body.classList.toggle("hide-images", state.settings.hideImages);
            const images = document.querySelectorAll("img, video");
            images.forEach(img => {
                img.style.visibility = state.settings.hideImages ? "hidden" : "visible";
            });
            announce(state.settings.hideImages ? "Imagens escondidas" : "Imagens visíveis");
        },

        // Modo de leitura
        toggleReadingMode() {
            state.settings.readingMode = !state.settings.readingMode;
            document.body.classList.toggle("reading-mode", state.settings.readingMode);
            if (state.settings.readingMode) {
                document.body.classList.add("hide-navigational", "focused-content");
            } else {
                document.body.classList.remove("hide-navigational", "focused-content");
            }
            announce(state.settings.readingMode ? "Modo leitura ativado" : "Modo leitura desativado");
        },

        // Mostrar atalhos de teclado
        showShortcuts() {
            const modal = getElement("shortcuts-modal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("visible");
                modal.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";

                // Renderizar atalhos
                this.renderShortcuts();

                // Focar no botão de fechar
                const closeBtn = modal.querySelector("#shortcuts-close");
                if (closeBtn) {
                    setTimeout(() => closeBtn.focus(), 100);
                }
            }
        },

        // Renderizar atalhos de teclado
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

            // Configurar tabs de navegador
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

        // Mostrar dicionário
        showGlossary() {
            const modal = getElement("glossary-modal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("visible");
                modal.setAttribute("aria-hidden", "false");
                document.body.style.overflow = "hidden";

                // Renderizar termos
                this.renderGlossary();

                // Focar no campo de busca
                const searchInput = getElement("glossary-search-input");
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        },

        // Renderizar dicionário
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

            // Configurar busca
            this.setupGlossarySearch();

            // Configurar filtro por letra
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

        // Aplicar todas as configurações
        applyAll() {
            // Fonte
            const fontIndex = state.settings.fontSize;
            const multiplier = CONFIG.fontSizeLevels[fontIndex];
            document.documentElement.style.setProperty("--font-size-multiplier", multiplier);
            document.body.setAttribute("data-font-index", fontIndex);

            // Contraste
            this.applyContrast(state.settings.contrast);

            // Daltonismo
            this.applyColorblind(state.settings.colorblind);

            // Saturação
            this.applySaturation(state.settings.saturation);

            // Cursor
            this.applyCursor(state.settings.cursor);

            // Guia de leitura
            this.applyReadingGuide(state.settings.readingGuide);

            // Demais configurações
            document.body.classList.toggle("highlight-links", state.settings.highlightLinks);
            document.body.classList.toggle("highlight-headers", state.settings.highlightHeaders);
            document.body.classList.toggle("bold-text", state.settings.boldText);
            document.body.classList.toggle("hide-images", state.settings.hideImages);
            document.body.classList.toggle("reading-mode", state.settings.readingMode);

            if (state.settings.stopAnim) {
                document.body.classList.add("reduced-motion");
                document.documentElement.style.setProperty("--transition-duration", "0s");
            }

            log("Todas as configurações aplicadas");
        }
    };

    // ==========================================
    // GERENCIADOR DE EVENTOS
    // ==========================================
    function setupEventListeners() {
        const { accessibilityToggle, accessibilityClose, accessibilityPanel } = state.elements;

        // Toggle do painel de acessibilidade
        if (accessibilityToggle) {
            accessibilityToggle.addEventListener("click", () => PanelManager.toggle());
        }

        // Fechar painel de acessibilidade
        if (accessibilityClose) {
            accessibilityClose.addEventListener("click", () => PanelManager.close());
        }

        // Fechar painel ao clicar fora
        if (accessibilityPanel) {
            accessibilityPanel.addEventListener("click", (e) => {
                if (e.target === accessibilityPanel) {
                    PanelManager.close();
                }
            });
        }

        // Fechar com ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (state.isPanelOpen) {
                    PanelManager.close();
                    return;
                }
                // Fechar modais
                const shortcutsModal = getElement("shortcuts-modal");
                const glossaryModal = getElement("glossary-modal");
                if (shortcutsModal && shortcutsModal.classList.contains("visible")) {
                    shortcutsModal.classList.remove("visible");
                    shortcutsModal.classList.add("hidden");
                    shortcutsModal.setAttribute("aria-hidden", "true");
                    shortcutsModal.style.display = "none";
                    document.body.style.overflow = "";
                }
                if (glossaryModal && glossaryModal.classList.contains("visible")) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.setAttribute("aria-hidden", "true");
                    glossaryModal.style.display = "none";
                    document.body.style.overflow = "";
                }
            }
        });

        // Atalhos de teclado para acessibilidade
        document.addEventListener("keydown", (e) => {
            if (e.altKey && e.key === "a") {
                e.preventDefault();
                PanelManager.toggle();
            }
        });

        // Botão de fechar atalhos de teclado
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
                    document.body.style.overflow = "";
                    log("Modal de atalhos fechado");
                }
            });
        }

        // Botão de fechar dicionário
        const glossaryClose = getElement("glossary-modal");
        if (glossaryClose) {
            const closeBtn = glossaryClose.querySelector(".icon-btn");
            if (closeBtn) {
                closeBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    glossaryClose.classList.remove("visible");
                    glossaryClose.classList.add("hidden");
                    glossaryClose.setAttribute("aria-hidden", "true");
                    glossaryClose.style.display = "none";
                    document.body.style.overflow = "";
                    log("Modal de dicionário fechado");
                });
            }
        }

        // Fechar modal de atalhos ao clicar fora
        const shortcutsModal = getElement("shortcuts-modal");
        if (shortcutsModal) {
            shortcutsModal.addEventListener("click", function(e) {
                if (e.target === shortcutsModal) {
                    shortcutsModal.classList.remove("visible");
                    shortcutsModal.classList.add("hidden");
                    shortcutsModal.setAttribute("aria-hidden", "true");
                    shortcutsModal.style.display = "none";
                    document.body.style.overflow = "";
                }
            });
        }

        // Fechar modal de dicionário ao clicar fora
        const glossaryModal = getElement("glossary-modal");
        if (glossaryModal) {
            glossaryModal.addEventListener("click", function(e) {
                if (e.target === glossaryModal) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.setAttribute("aria-hidden", "true");
                    glossaryModal.style.display = "none";
                    document.body.style.overflow = "";
                }
            });
        }
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function init() {
        if (state.initialized) {
            log("Módulo já inicializado", "warn");
            return;
        }

        log("Inicializando módulo de acessibilidade...");

        // Selecionar elementos do DOM
        const selectors = {
            accessibilityToggle: "#accessibility-toggle",
            accessibilityClose: "#accessibility-close",
            accessibilityPanel: "#accessibility-panel",
            librasToggle: "#libras-toggle",
            vlibrasContainer: "#vlibras-container",
            shortcutsModal: "#shortcuts-modal",
            glossaryModal: "#glossary-modal"
        };

        state.elements = getElements(selectors);

        // Verificar se elementos essenciais existem
        if (!state.elements.accessibilityPanel) {
            log("Elementos do painel de acessibilidade não encontrados", "warn");
            return;
        }

        log("Elementos do DOM encontrados");

        // Garantir que todos os modais estejam escondidos no início
        const allModals = [state.elements.shortcutsModal, state.elements.glossaryModal];
        allModals.forEach(modal => {
            if (modal) {
                modal.classList.remove("visible");
                modal.classList.add("hidden");
                modal.setAttribute("aria-hidden", "true");
                modal.style.display = "none";
            }
        });

        // Inicializar gerenciadores
        AccessibilityManager.init();
        LibrasManager.init();
        setupEventListeners();

        state.initialized = true;
        log("Módulo de acessibilidade inicializado com sucesso");

        // Disparar evento de ready
        window.dispatchEvent(new CustomEvent("Module:accessibility:Ready"));
    }

    // ==========================================
    // EXPOR API PÚBLICA
    // ==========================================
    window.AccessibilityInit = init;
    window.AccessibilityAPI = {
        openPanel: () => PanelManager.open(),
        closePanel: () => PanelManager.close(),
        togglePanel: () => PanelManager.toggle(),
        toggleLibras: () => LibrasManager.toggle(),
        applyAction: (action, param) => AccessibilityManager.applyAction(action, param),
        resetSettings: () => SettingsManager.reset(),
        getState: () => ({ ...state })
    };

    // ==========================================
    // EXECUTAR QUANDO PRONTO
    // ==========================================
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(init, 50));
    } else {
        setTimeout(init, 50);
    }

})();
