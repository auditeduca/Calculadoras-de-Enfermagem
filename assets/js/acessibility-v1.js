/**
 * Accessibility Widget Module
 * Gerencia o painel de acessibilidade e recursos de acessibilidade
 * Nota: Os recursos de acessibilidade não persistem após reload da página
 * para preservar os arquivos modulares originais
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
    // GERENCIADOR DE LIBRAS (BOTÃO VISUAL)
    // ==========================================
    const LibrasManager = {
        init() {
            const { librasToggle } = state.elements;
            if (librasToggle) {
                librasToggle.addEventListener("click", () => this.toggle());
            } else {
                log("Botão de Libras não encontrado no DOM", "warn");
            }
            log("Gerenciador de Libras inicializado");
        },

        toggle() {
            state.isLibrasActive = !state.isLibrasActive;
            const { librasToggle } = state.elements;

            if (librasToggle) {
                librasToggle.classList.toggle("active", state.isLibrasActive);
                librasToggle.setAttribute("aria-pressed", state.isLibrasActive);
            }

            announce(state.isLibrasActive ? "Tradutor de Libras ativado" : "Tradutor de Libras desativado");
            log(state.isLibrasActive ? "Libras ativado" : "Libras desativado");
        }
    };

    // ==========================================
    // GERENCIADOR DE ACESSIBILIDADE
    // ==========================================
    const AccessibilityManager = {
        init() {
            // Configurar event listeners dos cards
            this.setupCards();

            // Configurar botões específicos
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

            // Restaurar padrões - LIMPA TODOS os recursos de acessibilidade
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

        // Aplicar tamanho da fonte
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

        // Aplicar contraste
        applyContrast(param) {
            state.currentSettings.contrast = param;
            // Remove TODAS as classes de contraste primeiro
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
                    // Normal - remove tudo e volta ao CSS original
                    announce("Contraste normal");
            }
        },

        // Aplicar filtro de daltonismo
        applyColorblind(param) {
            state.currentSettings.colorblind = param;
            const html = document.documentElement;
            // Remove TODAS as classes de daltonismo
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

        // Aplicar saturação
        applySaturation(param) {
            state.currentSettings.saturation = param;
            // Remove TODAS as classes de saturação
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

        // Aplicar tamanho do cursor
        applyCursor(param) {
            state.currentSettings.cursor = param;
            // Remove TODAS as classes de cursor
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

        // Aplicar guia de leitura
        applyReadingGuide(param) {
            state.currentSettings.readingGuide = param;

            // Remove guias existentes
            const existingGuide = document.querySelector(".reading-guide, #reading-guide");
            if (existingGuide) {
                existingGuide.remove();
            }

            // Remove event listeners de mouse para guia
            const newGuides = document.querySelectorAll(".reading-guide, #reading-guide");
            newGuides.forEach(g => g.remove());

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

                // Seguir mouse
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

        // Destacar links
        toggleHighlightLinks() {
            state.currentSettings.highlightLinks = !state.currentSettings.highlightLinks;
            document.body.classList.toggle("highlight-links", state.currentSettings.highlightLinks);
            announce(state.currentSettings.highlightLinks ? "Links destacados" : "Links não destacados");
        },

        // Destacar títulos
        toggleHighlightHeaders() {
            state.currentSettings.highlightHeaders = !state.currentSettings.highlightHeaders;
            document.body.classList.toggle("highlight-headers", state.currentSettings.highlightHeaders);
            announce(state.currentSettings.highlightHeaders ? "Títulos destacados" : "Títulos não destacados");
        },

        // Texto em negrito
        toggleBoldText() {
            state.currentSettings.boldText = !state.currentSettings.boldText;
            document.body.classList.toggle("bold-text", state.currentSettings.boldText);
            announce(state.currentSettings.boldText ? "Texto em negrito ativado" : "Texto em negrito desativado");
        },

        // Parar animações
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

        // Esconder imagens
        toggleHideImages() {
            state.currentSettings.hideImages = !state.currentSettings.hideImages;
            document.body.classList.toggle("hide-images", state.currentSettings.hideImages);
            announce(state.currentSettings.hideImages ? "Imagens escondidas" : "Imagens visíveis");
        },

        // Modo de leitura
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

        // Mostrar atalhos de teclado
        showShortcuts() {
            const modal = getElement("shortcuts-modal");
            if (modal) {
                modal.classList.remove("hidden");
                modal.classList.add("visible");
                modal.setAttribute("aria-hidden", "false");
                modal.style.display = "flex";
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
                modal.style.display = "flex";
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

        // ==========================================
        // RESTAURAR TODOS OS RECURSOS
        // ==========================================
        restoreAll() {
            // Resetar estado interno
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

            // REMOVER TODAS as classes de acessibilidade do body
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

            // REMOVER TODAS as classes de acessibilidade do html
            document.documentElement.classList.remove(
                "protanopia", "deuteranopia", "tritanopia"
            );

            // Remover guia de leitura
            const readingGuide = document.querySelector(".reading-guide, #reading-guide");
            if (readingGuide) {
                readingGuide.remove();
            }

            // Resetar propriedades CSS inline
            document.documentElement.style.removeProperty("--font-size-multiplier");
            document.documentElement.style.removeProperty("--transition-duration");
            document.body.removeAttribute("data-font-index");

            // Resetar visibilidade de imagens
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
            librasToggle: "#libras-toggle-top",
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

        // Inicializar gerenciadores (sem restaurar configurações salvas)
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
        restoreAll: () => AccessibilityManager.restoreAll(),
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
