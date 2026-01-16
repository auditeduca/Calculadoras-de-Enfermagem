/**
 * Accessibility Widget Module
 * Gerencia o painel de acessibilidade e recursos de acessibilidade
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
    let state = {
        isPanelOpen: false,
        isTTSActive: false,
        readingMaskSize: null,
        currentSettings: {
            fontSize: 1,
            fontFamily: "normal",
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
            readingMode: false,
            tts: false,
            readingMask: "off"
        }
    };

    // ==========================================
    // FUNÇÕES DE UTILIDADE
    // ==========================================
    function getElement(id) {
        return document.getElementById(id);
    }

    function announce(message) {
        let announcer = getElement("sr-announcer");
        if (!announcer) {
            announcer = document.createElement("div");
            announcer.id = "sr-announcer";
            announcer.setAttribute("role", "status");
            announcer.setAttribute("aria-live", "polite");
            announcer.setAttribute("aria-atomic", "true");
            announcer.className = "sr-only";
            document.body.appendChild(announcer);
        }
        announcer.textContent = message;
    }

    // ==========================================
    // GERENCIADOR DO PAINEL
    // ==========================================
    function openPanel() {
        const panel = getElement("accessibility-panel");
        const btn = getElement("accessibility-toggle");
        
        if (!panel) {
            console.error("Painel não encontrado!");
            return;
        }

        state.isPanelOpen = true;
        panel.classList.remove("accessibility-panel-hidden");

        if (btn) {
            btn.classList.add("active");
            btn.setAttribute("aria-expanded", "true");
        }

        document.body.style.overflow = "hidden";
        console.log("Painel aberto");
        announce("Painel de acessibilidade aberto");
    }

    function closePanel() {
        const panel = getElement("accessibility-panel");
        const btn = getElement("accessibility-toggle");
        
        if (!panel) {
            return;
        }

        state.isPanelOpen = false;
        panel.classList.add("accessibility-panel-hidden");

        if (btn) {
            btn.classList.remove("active");
            btn.setAttribute("aria-expanded", "false");
        }

        document.body.style.overflow = "";
        console.log("Painel fechado");
        announce("Painel de acessibilidade fechado");
    }

    function togglePanel() {
        if (state.isPanelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    // ==========================================
    // AÇÕES DE ACESSIBILIDADE
    // ==========================================
    function applyFontSize(param) {
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
    }

    function applyFontFamily(param) {
        state.currentSettings.fontFamily = param;
        document.body.classList.remove("font-atkinson", "font-dyslexic");

        if (param !== "normal") {
            document.body.classList.add("font-" + param);
        }

        const labels = {
            atkinson: "Atkinson Legível",
            dyslexic: "OpenDyslexic"
        };
        announce(param !== "normal" ? `${labels[param]} ativado` : "Fonte padrão restaurada");
    }

    function applyReadingMask(param) {
        const topMask = getElement("reading-mask-top");
        const bottomMask = getElement("reading-mask-bottom");
        if (!topMask || !bottomMask) return;

        if (state.currentSettings.readingMask === param && state.readingMaskSize === param) {
            state.currentSettings.readingMask = "off";
            state.readingMaskSize = null;
            topMask.style.display = "none";
            bottomMask.style.display = "none";
            document.onmousemove = null;
            announce("Máscara de leitura desativada");
            return;
        }

        state.currentSettings.readingMask = param;
        state.readingMaskSize = param;

        const sizes = { small: 60, medium: 120, large: 200 };
        const gap = sizes[param] || 120;

        topMask.style.display = "block";
        bottomMask.style.display = "block";

        document.onmousemove = function guideFollow(e) {
            const y = e.clientY;
            topMask.style.height = (y - gap / 2) + "px";
            bottomMask.style.top = (y + gap / 2) + "px";
            bottomMask.style.bottom = "0";
        };

        const labels = { small: "Pequena", medium: "Média", large: "Grande" };
        announce(`Máscara de leitura ${labels[param]} ativada`);
    }

    function toggleTTS() {
        state.isTTSActive = !state.isTTSActive;
        state.currentSettings.tts = state.isTTSActive;

        if (state.isTTSActive) {
            document.body.classList.add("tts-active");
            announce("Leitor de tela ativado. Selecione texto para ouvir.");

            document.onmouseup = function handleTextSelection() {
                const selection = window.getSelection();
                const text = selection.toString().trim();

                if (text) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = "pt-BR";
                    utterance.rate = 1;
                    utterance.pitch = 1;
                    window.speechSynthesis.speak(utterance);
                }
            };
        } else {
            document.body.classList.remove("tts-active");
            document.onmouseup = null;
            window.speechSynthesis.cancel();
            announce("Leitor de tela desativado");
        }
    }

    function applyContrast(param) {
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
    }

    function applyColorblind(param) {
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
    }

    function applySaturation(param) {
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
    }

    function applyCursor(param) {
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
    }

    function applyReadingGuide(param) {
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
    }

    function toggleHighlightLinks() {
        state.currentSettings.highlightLinks = !state.currentSettings.highlightLinks;
        document.body.classList.toggle("highlight-links", state.currentSettings.highlightLinks);
        announce(state.currentSettings.highlightLinks ? "Links destacados" : "Links não destacados");
    }

    function toggleHighlightHeaders() {
        state.currentSettings.highlightHeaders = !state.currentSettings.highlightHeaders;
        document.body.classList.toggle("highlight-headers", state.currentSettings.highlightHeaders);
        announce(state.currentSettings.highlightHeaders ? "Títulos destacados" : "Títulos não destacados");
    }

    function toggleBoldText() {
        state.currentSettings.boldText = !state.currentSettings.boldText;
        document.body.classList.toggle("bold-text", state.currentSettings.boldText);
        announce(state.currentSettings.boldText ? "Texto em negrito ativado" : "Texto em negrito desativado");
    }

    function toggleStopAnim() {
        state.currentSettings.stopAnim = !state.currentSettings.stopAnim;
        document.body.classList.toggle("stop-anim", state.currentSettings.stopAnim);
        
        if (state.currentSettings.stopAnim) {
            document.documentElement.style.setProperty("--transition-duration", "0s");
        } else {
            document.documentElement.style.removeProperty("--transition-duration");
        }
        announce(state.currentSettings.stopAnim ? "Animações paradas" : "Animações ativadas");
    }

    function toggleHideImages() {
        state.currentSettings.hideImages = !state.currentSettings.hideImages;
        document.body.classList.toggle("hide-images", state.currentSettings.hideImages);
        announce(state.currentSettings.hideImages ? "Imagens escondidas" : "Imagens visíveis");
    }

    function toggleReadingMode() {
        state.currentSettings.readingMode = !state.currentSettings.readingMode;
        document.body.classList.toggle("reading-mode", state.currentSettings.readingMode);
        
        if (state.currentSettings.readingMode) {
            document.body.classList.add("hide-navigational", "focused-content");
        } else {
            document.body.classList.remove("hide-navigational", "focused-content");
        }
        announce(state.currentSettings.readingMode ? "Modo leitura ativado" : "Modo leitura desativado");
    }

    function restoreAll() {
        state.currentSettings = {
            fontSize: 1,
            fontFamily: "normal",
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
            readingMode: false,
            tts: false,
            readingMask: "off"
        };

        state.isTTSActive = false;
        state.readingMaskSize = null;

        document.body.classList.remove(
            "inverted", "light-contrast", "dark-contrast",
            "low-saturation", "high-saturation", "monochrome",
            "big-cursor-medium", "big-cursor-large", "big-cursor-xlarge",
            "highlight-links", "highlight-headers",
            "bold-text", "stop-anim",
            "hide-images", "reading-mode",
            "hide-navigational", "focused-content",
            "font-atkinson", "font-dyslexic",
            "tts-active"
        );

        document.documentElement.classList.remove(
            "protanopia", "deuteranopia", "tritanopia"
        );

        // Desativar máscara de leitura
        const topMask = getElement("reading-mask-top");
        const bottomMask = getElement("reading-mask-bottom");
        if (topMask) topMask.style.display = "none";
        if (bottomMask) bottomMask.style.display = "none";
        document.onmousemove = null;

        // Desativar TTS
        window.speechSynthesis.cancel();
        document.onmouseup = null;

        // Remover guia de leitura
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

        console.log("Configurações restauradas");
        announce("Configurações de acessibilidade restauradas");
    }

    // ==========================================
    // EXECUTAR AÇÃO DO CARD
    // ==========================================
    function handleCardClick(card) {
        const action = card.dataset.action;
        const param = card.dataset.param || null;

        switch (action) {
            case "font-size":
                applyFontSize(param);
                break;
            case "font-family":
                applyFontFamily(param);
                break;
            case "contrast":
                applyContrast(param);
                break;
            case "colorblind":
                applyColorblind(param);
                break;
            case "saturation":
                applySaturation(param);
                break;
            case "cursor":
                applyCursor(param);
                break;
            case "reading-guide":
                applyReadingGuide(param);
                break;
            case "reading-mask":
                applyReadingMask(param);
                break;
            case "tts":
                toggleTTS();
                break;
            case "highlight-links":
                toggleHighlightLinks();
                break;
            case "highlight-headers":
                toggleHighlightHeaders();
                break;
            case "bold-text":
                toggleBoldText();
                break;
            case "stop-anim":
                toggleStopAnim();
                break;
            case "hide-images":
                toggleHideImages();
                break;
            case "reading-mode":
                toggleReadingMode();
                break;
        }
    }

    // ==========================================
    // CONFIGURAR EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        // Botão toggle principal
        const toggleBtn = getElement("accessibility-toggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", function(e) {
                e.preventDefault();
                togglePanel();
            });
            console.log("Listener do botão de toggle anexado");
        } else {
            console.error("Botão de toggle não encontrado!");
        }

        // Botão fechar
        const closeBtn = getElement("accessibility-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", function(e) {
                e.preventDefault();
                closePanel();
            });
        }

        // Cards de acessibilidade
        const cards = document.querySelectorAll(".accessibility-card[data-action]");
        cards.forEach(function(card) {
            card.addEventListener("click", function() {
                handleCardClick(card);
            });
        });

        // Botão restaurar
        const restoreBtn = getElement("accessibility-restore");
        if (restoreBtn) {
            restoreBtn.addEventListener("click", function() {
                restoreAll();
            });
        }

        // Atalhos de teclado - ESC para fechar
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape") {
                if (state.isPanelOpen) {
                    closePanel();
                    return;
                }
                // Fechar modais
                const shortcutsModal = getElement("shortcuts-modal");
                const glossaryModal = getElement("glossary-modal");
                if (shortcutsModal && shortcutsModal.classList.contains("visible")) {
                    shortcutsModal.classList.remove("visible");
                    shortcutsModal.classList.add("hidden");
                    shortcutsModal.style.display = "none";
                    document.body.style.overflow = "";
                }
                if (glossaryModal && glossaryModal.classList.contains("visible")) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.style.display = "none";
                    document.body.style.overflow = "";
                }
            }
        });

        // Alt + A para toggle do painel
        document.addEventListener("keydown", function(e) {
            if (e.altKey && e.key === "a") {
                e.preventDefault();
                togglePanel();
            }
        });

        // Fechar modal ao clicar fora
        const shortcutsModal = getElement("shortcuts-modal");
        if (shortcutsModal) {
            shortcutsModal.addEventListener("click", function(e) {
                if (e.target === shortcutsModal) {
                    shortcutsModal.classList.remove("visible");
                    shortcutsModal.classList.add("hidden");
                    shortcutsModal.style.display = "none";
                    document.body.style.overflow = "";
                }
            });
        }

        const glossaryModal = getElement("glossary-modal");
        if (glossaryModal) {
            glossaryModal.addEventListener("click", function(e) {
                if (e.target === glossaryModal) {
                    glossaryModal.classList.remove("visible");
                    glossaryModal.classList.add("hidden");
                    glossaryModal.style.display = "none";
                    document.body.style.overflow = "";
                }
            });
        }

        // Atalhos de Teclado - Botão
        const shortcutsBtn = getElement("shortcuts-btn");
        if (shortcutsBtn) {
            shortcutsBtn.addEventListener("click", function() {
                showShortcuts();
            });
        }

        // Dicionário - Botão
        const glossaryBtn = getElement("glossary-btn");
        if (glossaryBtn) {
            glossaryBtn.addEventListener("click", function() {
                showGlossary();
            });
        }

        // Fechar atalhos
        const shortcutsClose = getElement("shortcuts-close");
        if (shortcutsClose) {
            shortcutsClose.addEventListener("click", function() {
                const modal = getElement("shortcuts-modal");
                if (modal) {
                    modal.classList.remove("visible");
                    modal.classList.add("hidden");
                    modal.style.display = "none";
                    document.body.style.overflow = "";
                }
            });
        }

        // Fechar dicionário
        const glossaryClose = getElement("glossary-close");
        if (glossaryClose) {
            glossaryClose.addEventListener("click", function() {
                const modal = getElement("glossary-modal");
                if (modal) {
                    modal.classList.remove("visible");
                    modal.classList.add("hidden");
                    modal.style.display = "none";
                    document.body.style.overflow = "";
                }
            });
        }

        console.log("Todos os event listeners configurados");
    }

    // ==========================================
    // MODAIS
    // ==========================================
    function showShortcuts() {
        const modal = getElement("shortcuts-modal");
        if (modal) {
            modal.classList.remove("hidden");
            modal.classList.add("visible");
            modal.setAttribute("aria-hidden", "false");
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
            
            // Renderizar atalhos
            const shortcutsList = getElement("shortcuts-list");
            if (shortcutsList) {
                const shortcuts = [
                    { key: "Alt + 1", action: "Ir para conteúdo principal" },
                    { key: "Alt + 2", action: "Ir para rodapé" },
                    { key: "Alt + A", action: "Abrir painel de acessibilidade" },
                    { key: "Alt + +", action: "Aumentar fonte" },
                    { key: "Alt + -", action: "Diminuir fonte" },
                    { key: "Alt + 0", action: "Restaurar tamanho padrão" },
                    { key: "Esc", action: "Fechar painéis modais" }
                ];
                
                shortcutsList.innerHTML = shortcuts.map(function(shortcut) {
                    return '<div class="shortcut-item"><kbd>' + shortcut.key + '</kbd><span>' + shortcut.action + '</span></div>';
                }).join("");
            }
        }
    }

    function showGlossary() {
        const modal = getElement("glossary-modal");
        if (modal) {
            modal.classList.remove("hidden");
            modal.classList.add("visible");
            modal.setAttribute("aria-hidden", "false");
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
            
            // Renderizar termos
            const glossaryList = getElement("glossary-list");
            if (glossaryList) {
                const terms = [
                    { letter: "A", term: "Afusão", definition: "Introdução gradual de líquido em uma veia." },
                    { letter: "B", term: "Balanço Hídrico", definition: "Registro de líquidos administrados e eliminados." },
                    { letter: "C", term: "Cateterismo", definition: "Introdução de cateter em cavidade corporal." },
                    { letter: "D", term: "Diurético", definition: "Medicamento que aumenta a produção de urina." },
                    { letter: "G", term: "Glicemia", definition: "Taxa de açúcar no sangue." },
                    { letter: "H", term: "Hematoma", definition: "Acúmulo de sangue fora dos vasos." },
                    { letter: "I", term: "Insulina", definition: "Hormônio que regula a glicose no sangue." },
                    { letter: "P", term: "Punção Venosa", definition: "Procedimento para acessar veia periférica." },
                    { letter: "S", term: "Sinal Vital", definition: "Temperatura, pulso, respiração e pressão arterial." },
                    { letter: "S", term: "Sondagem", definition: "Introdução de sonda em cavidade corporal." },
                    { letter: "S", term: "Soro", definition: "Solução aquosa de sais minerais." },
                    { letter: "T", term: "Taquicardia", definition: "Frequência cardíaca acelerada (>100 bpm)." },
                    { letter: "T", term: "Taquipneia", definition: "Frequência respiratória aumentada (>20 rpm)." },
                    { letter: "T", term: "Tricotomia", definition: "Remoção de pelos antes de procedimento cirúrgico." },
                    { letter: "U", term: "Úlcera", definition: "Lesão aberta na pele ou mucosa." },
                    { letter: "U", term: "Urgência", definition: "Condição que requer atendimento rápido." },
                    { letter: "V", term: "Venóclise", definition: "Punção de veia para administração IV." },
                    { letter: "V", term: "Venopunção", definition: "Procedimento de punctura de veia." },
                    { letter: "X", term: "Xerostomia", definition: "Sensação de boca seca." },
                    { letter: "Z", term: "Zona de Pressão", definition: "Área sujeita a compressão prolongada." }
                ];
                
                glossaryList.innerHTML = terms.map(function(item) {
                    return '<li class="glossary-item" data-letter="' + item.letter + '"><dt class="glossary-term">' + item.term + '</dt><dd class="glossary-definition">' + item.definition + '</dd></li>';
                }).join("");
            }
        }
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================
    function init() {
        console.log("Inicializando módulo de acessibilidade...");
        
        // Configurar event listeners
        setupEventListeners();
        
        console.log("Módulo de acessibilidade inicializado com sucesso!");
    }

    // ==========================================
    // EXPOR API PÚBLICA
    // ==========================================
    window.AccessibilityWidget = {
        toggle: togglePanel,
        open: openPanel,
        close: closePanel,
        restore: restoreAll
    };

    // ==========================================
    // INICIAR QUANDO DOM ESTIVER PRONTO
    // ==========================================
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        // DOM já carregado
        setTimeout(init, 10);
    }

})();
