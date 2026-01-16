/**
 * Accessibility Widget Module
 * Gerencia o painel de acessibilidade e recursos de acessibilidade
 * Baseado na referência: accessibility (3).js
 */
(function() {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES E CONSTANTES
    // ==========================================
    const CONFIG = {
        fontSizeLevels: [0.875, 1, 1.125, 1.25, 1.5],
        fontSizeLabels: ["85%", "100%", "112.5%", "125%", "150%"]
    };

    // ==========================================
    // ESTADO DO MÓDULO
    // ==========================================
    const state = {
        elements: {},
        initialized: false,
        isPanelOpen: false,
        isLibrasActive: false,
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
    // FUNÇÕES DE UTILIDADE
    // ==========================================
    function log(message, type = "info") {
        const prefix = "[Accessibility]";
        try {
            console[type](`${prefix} ${message}`);
        } catch (e) {
            console.log(`${prefix} ${message}`);
        }
    }

    function getElement(id) {
        return document.getElementById(id);
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
            if (!accessibilityPanel) {
                log("Painel não encontrado - não é possível fechar", "error");
                return;
            }

            state.isPanelOpen = false;
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
            document.body.classList.remove("inverted", "light-contrast", "dark-contrast");

            switch (param) {
                case "inverted":
                    document.body.classList.add("inverted");
                    announce("Cores invertidas ativadas");
                    break;
                case "light-contrast":
                    document.body.classList.add("light-contrast");
                    announce("Alto contraste claro ativado");
                    break;
                case "dark-contrast":
                    document.body.classList.add("dark-contrast");
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

        applyCursor(param) {
            state.currentSettings.cursor = param;
            document.body.classList.remove("big-cursor-medium", "big-cursor-large", "big-cursor-xlarge");

            switch (param) {
                case "medium":
                    document.body.classList.add("big-cursor-medium");
                    announce("Cursor grande ativado");
                    break;
                case "large":
                    document.body.classList.add("big-cursor-large");
                    announce("Cursor extra grande ativado");
                    break;
                default:
                    announce("Cursor normal");
            }
        },

        applyReadingGuide(param) {
            state.currentSettings.readingGuide = param;

            const existingGuide = document.querySelector("#reading-guide");
            if (existingGuide) {
                existingGuide.remove();
            }

            if (param !== "none" && param !== "off") {
                const guide = document.createElement("div");
                guide.id = "reading-guide";
                guide.style.display = "block";
                
                switch (param) {
                    case "azul":
                        guide.style.background = "#1e3a8a";
                        break;
                    case "laranja":
                        guide.style.background = "#ea580c";
                        break;
                    case "preto":
                        guide.style.background = "#000";
                        break;
                }
                
                document.body.appendChild(guide);

                document.addEventListener("mousemove", function guideFollow(e) {
                    const g = document.getElementById("reading-guide");
                    if (g) {
                        g.style.top = `${e.clientY - 2}px`;
                        g.style.left = "0";
                        g.style.width = "100%";
                        g.style.height = "3px";
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
                document.body.style.overflow = "hidden";

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
                document.body.style.overflow = "hidden";

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
                { letter: "S", term: "Sinal Vital", definition: "Temperatura, pulso, respiração e pressão arterial - indicadores do estado de saúde." },
                { letter: "S", term: "Sondagem", definition: "Introdução de sonda em cavidade corporal para fins diagnósticos ou terapêuticos." },
                { letter: "S", term: "Soro", definition: "Solução aquosa de sais minerais." },
                { letter: "T", term: "Taquicardia", definition: "Frequência cardíaca acelerada, acima de 100 batimentos por minuto." },
                { letter: "T", term: "Taquipneia", definition: "Frequência respiratória aumentada, acima de 20 incursões por minuto." },
                { letter: "T", term: "Tricotomia", definition: "Remoção de pelos de uma região do corpo antes de procedimento cirúrgico." },
                { letter: "U", term: "Úlcera", definition: "Lesão aberta na pele ou mucosa com perda de tecido e dificuldade de cicatrização." },
                { letter: "U", term: "Urgência", definition: "Condição que requer atendimento rápido, mas sem risco imediato de morte." },
                { letter: "V", term: "Venóclise", definition: "Punção de uma veia para administração de soluções intravenosas." },
                { letter: "V", term: "Venopunção", definition: "Procedimento de punctura de veia." },
                { letter: "V", term: "Volume Residual", definition: "Quantidade de conteúdo gástrico que permanece no estômago após aspiração." },
                { letter: "X", term: "Xerostomia", definition: "Sensação de boca seca por diminuição da produção de saliva." },
                { letter: "Z", term: "Zona de Pressão", definition: "Área do corpo sujeita a compressão prolongada, podendo desenvolver lesões." }
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
                "inverted", "light-contrast", "dark-contrast",
                "low-saturation", "high-saturation", "monochrome",
                "big-cursor-medium", "big-cursor-large", "big-cursor-xlarge",
                "highlight-links", "highlight-headers",
                "bold-text", "stop-anim",
                "hide-images", "reading-mode",
                "hide-navigational", "focused-content"
            );

            document.documentElement.classList.remove(
                "protanopia", "deuteranopia", "tritanopia"
            );

            const readingGuide = document.querySelector("#reading-guide");
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
        } else {
            log("Botão de acessibilidade não encontrado", "error");
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
        const glossaryCloseBtn = getElement("glossary-close");
        if (glossaryCloseBtn) {
            glossaryCloseBtn.addEventListener("click", function(e) {
                e.preventDefault();
                const glossaryModal = getElement("glossary-modal");
                if (glossaryModal) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.setAttribute("aria-hidden", "true");
                    glossaryModal.style.display = "none";
                    document.body.style.overflow = "";
                    log("Modal de dicionário fechado");
                }
            });
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
    // SELEÇÃO DE ELEMENTOS
    // ==========================================
    function selectAccessibilityElements() {
        const selectors = {
            accessibilityToggle: "#accessibility-toggle",
            accessibilityClose: "#accessibility-close",
            accessibilityPanel: "#accessibility-panel",
            librasToggle: "#libras-toggle-top",
            shortcutsModal: "#shortcuts-modal",
            glossaryModal: "#glossary-modal"
        };

        state.elements = {};
        let allFound = true;

        Object.entries(selectors).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                state.elements[key] = element;
                log(`Elemento encontrado: ${key}`, "debug");
            } else {
                state.elements[key] = null;
                allFound = false;
                log(`Elemento não encontrado: ${key}`, "warn");
            }
        });

        return allFound;
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
        const allFound = selectAccessibilityElements();

        if (!state.elements.accessibilityPanel) {
            log("Elementos do painel de acessibilidade não encontrados", "warn");
            log("Verificando se HTML foi injetado...", "debug");
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
        setupEventListeners();

        state.initialized = true;
        log("Módulo de acessibilidade inicializado com sucesso");
    }

    // ==========================================
    // EXPOR API PÚBLICA
    // ==========================================
    window.AccessibilityInit = init;
    window.AccessibilityAPI = {
        openPanel: () => PanelManager.open(),
        closePanel: () => PanelManager.close(),
        togglePanel: () => PanelManager.toggle(),
        applyAction: (action, param) => AccessibilityManager.applyAction(action, param),
        restoreAll: () => AccessibilityManager.restoreAll(),
        getState: () => ({ ...state })
    };

    // ==========================================
    // EXECUTAR QUANDO PRONTO
    // ==========================================
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(init, 100));
    } else {
        setTimeout(init, 100);
    }

})();
