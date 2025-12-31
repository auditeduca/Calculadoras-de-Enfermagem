// Verifica se AccessControl já existe para evitar erro de redeclaração
// Se já existir, usamos a instância atual. Se não, criamos o objeto.
window.AccessControl = window.AccessControl || {
    state: {
        fontSize: 0,
        fontFamily: 0,
        letterSpacing: 0,
        readingMask: 0,
        isTTSActive: false,
        contrast: 0,
        theme: "system"
    },

    elements: {},

    ThemeManager: {
        keys: {
            theme: "nursing_calc_theme",
            systemPreference: "nursing_calc_system_theme"
        },

        detectSystemTheme() {
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        },

        getTheme() {
            const storedTheme = localStorage.getItem(this.keys.theme);
            if (storedTheme) return storedTheme;
            
            const systemTheme = this.detectSystemTheme();
            localStorage.setItem(this.keys.systemTheme, systemTheme);
            return "system";
        },

        applyTheme(theme) {
            const body = document.body;
            // Aplica tema escuro se for explícito ou se for sistema e o sistema for escuro
            if (theme === "dark" || (theme === "system" && this.detectSystemTheme() === "dark")) {
                body.classList.add("dark-theme");
            } else {
                body.classList.remove("dark-theme");
            }
            localStorage.setItem(this.keys.theme, theme);
            // Atualiza o estado global se AccessControl já estiver definido
            if(window.AccessControl && window.AccessControl.state) {
                 window.AccessControl.state.theme = theme;
            }
        },

        toggleTheme() {
            const currentTheme = this.getTheme() === "dark" ? "light" : "dark";
            this.applyTheme(currentTheme);
            window.dispatchEvent(new CustomEvent("Theme:Changed", {
                detail: {
                    theme: currentTheme
                }
            }));
            return currentTheme;
        },

        init() {
            const theme = this.getTheme();
            this.applyTheme(theme);
            
            // Ouve mudanças na preferência do sistema
            if (window.matchMedia) {
                window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
                    if (localStorage.getItem(this.keys.theme) === "system") {
                        this.applyTheme("system");
                    }
                });
            }
        },

        resetToSystem() {
            localStorage.removeItem(this.keys.theme);
            this.applyTheme("system");
        }
    },

    init() {
        this.ThemeManager.init();
        
        // Só continua se os elementos existirem
        if (this.ensureElements()) {
            if (this.elements.panel) {
                this.setupDeferredInit();
                this.setupObservers();
                this.setupGlobalEvents();
                this.loadSavedState();
            }
        }
    },

    ensureElements() {
        // Se já temos os elementos cacheados e eles ainda estão no DOM, retorna true
        if (this.elements.panel && document.body.contains(this.elements.panel)) return true;

        this.elements = {
            body: document.body,
            panel: document.getElementById("accessibility-panel"),
            sideWidgets: document.getElementById("side-widgets"),
            closeBtn: document.getElementById("close-panel-btn"),
            openBtn: document.getElementById("accessibility-btn"),
            themeToggleBtn: document.getElementById("theme-toggle-btn"),
            themeIcon: document.getElementById("theme-icon")
        };

        return !!this.elements.panel;
    },

    setupDeferredInit() {
        // Evita re-inicialização de listeners se já foram configurados
        if(this.state._deferredInitDone) return;

        // Inicializa ícones Lucide
        let attempts = 0;
        const initIcons = () => {
            attempts++;
            if (window.lucide && typeof window.lucide.createIcons === "function") {
                window.lucide.createIcons();
            } else if (attempts < 10) {
                setTimeout(initIcons, 100);
            }
        };
        initIcons();

        // Inicializa VLibras
        const vLibrasInterval = setInterval(() => {
            if (window.VLibras && window.VLibras.Widget) {
                clearInterval(vLibrasInterval);
                // Verifica se o widget já não existe no DOM antes de criar
                if(!document.querySelector('[vw]')) {
                    new window.VLibras.Widget("https://vlibras.gov.br/app");
                }
            }
        }, 200);

        setTimeout(() => clearInterval(vLibrasInterval), 10000);
        this.state._deferredInitDone = true;
    },

    loadSavedState() {
        const savedState = localStorage.getItem("accessControlState");
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                // Restaura Font Size
                if (state.fontSize && state.fontSize !== 0) {
                    document.documentElement.style.setProperty("--font-scale", state.fontSize);
                    this.state.fontSize = state.fontSize;
                }
                
                // Atualiza ícone do tema
                const currentTheme = this.ThemeManager.getTheme();
                this.updateThemeIcon(currentTheme);

            } catch (e) {
                console.error("Erro ao carregar estado de acessibilidade", e);
            }
        }
    },

    saveState() {
        const stateToSave = {
            fontSize: this.state.fontSize,
            contrast: this.state.contrast,
            theme: this.state.theme
        };
        localStorage.setItem("accessControlState", JSON.stringify(stateToSave));
    },

    setupObservers() {
        if(this.state._observersSet) return;

        // Observa mudanças de classe no body para garantir que o painel feche se outros modais abrirem
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    const classList = document.body.classList;
                    if (classList.contains("modal-open") || 
                        classList.contains("mobile-menu-open") || 
                        classList.contains("overflow-hidden")) {
                        if (!this.isPanelClosed()) {
                            this.closePanel();
                        }
                    }
                }
            });
        }).observe(document.body, { attributes: true });
        
        this.state._observersSet = true;
    },

    setupGlobalEvents() {
        if(this.state._eventsSet) return;

        // Fecha com ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.closePanel();
        });

        // Fecha ao clicar fora
        document.addEventListener("click", (e) => {
            if (this.ensureElements() && !this.isPanelClosed()) {
                // Verifica se o clique não foi dentro do painel e nem no botão de abrir
                const clickedInPanel = this.elements.panel.contains(e.target);
                const clickedInOpenBtn = this.elements.openBtn && this.elements.openBtn.contains(e.target);
                const clickedInSideWidgets = this.elements.sideWidgets && this.elements.sideWidgets.contains(e.target);

                if (!clickedInPanel && !clickedInOpenBtn && !clickedInSideWidgets) {
                    this.closePanel();
                }
            }
        });
        
        this.state._eventsSet = true;
    },

    isPanelClosed() {
        if (!this.ensureElements() || !this.elements.panel) return true;
        return this.elements.panel.classList.contains("accessibility-panel-hidden");
    },

    togglePanel() {
        if (!this.ensureElements()) return;
        this.isPanelClosed() ? this.openPanel() : this.closePanel();
    },

    openPanel() {
        if (!this.ensureElements() || !this.elements.panel) return;
        
        this.elements.panel.classList.remove("accessibility-panel-hidden");
        
        if (this.elements.sideWidgets) {
            this.elements.sideWidgets.classList.add("side-widgets-hidden");
        }
        
        this.hideFloatingButtons();
        
        setTimeout(() => {
            if (this.elements.closeBtn) this.elements.closeBtn.focus();
        }, 100);
    },

    closePanel() {
        if (!this.ensureElements() || !this.elements.panel || this.isPanelClosed()) return;
        
        this.elements.panel.classList.add("accessibility-panel-hidden");
        
        if (this.elements.sideWidgets) {
            this.elements.sideWidgets.classList.remove("side-widgets-hidden");
        }
        
        this.showFloatingButtons();
        
        if (this.elements.openBtn) this.elements.openBtn.focus();
    },

    toggleMaximize() {
        if (!this.ensureElements() || !this.elements.panel) return;
        this.elements.panel.classList.toggle("panel-expanded");
    },

    toggleTheme() {
        const newTheme = this.ThemeManager.toggleTheme();
        this.updateThemeIcon(newTheme);
        this.saveState();
    },

    updateThemeIcon(theme) {
        if (!this.ensureElements()) return;
        const icon = this.elements.themeIcon;
        
        if (icon) {
            if (theme === "dark" || (theme === "system" && this.ThemeManager.detectSystemTheme() === "dark")) {
                icon.className = "fas fa-sun";
                icon.setAttribute("aria-label", "Alternar para modo claro");
            } else {
                icon.className = "fas fa-moon";
                icon.setAttribute("aria-label", "Alternar para modo escuro");
            }
        }
    },

    hideFloatingButtons() {
        const fab = document.getElementById("cookie-fab");
        const backToTop = document.getElementById("backToTop");
        if (fab) fab.style.display = "none";
        if (backToTop) backToTop.style.display = "none";
    },

    showFloatingButtons() {
        const fab = document.getElementById("cookie-fab");
        const backToTop = document.getElementById("backToTop");
        if (fab) fab.style.display = "flex";
        if (backToTop) backToTop.style.display = "flex";
    },

    toggleLibrasWidget() {
        // Encontra o botão interno do widget VLibras e clica nele
        const widgetBtn = document.querySelector("[vw-access-button]");
        if (widgetBtn) {
            widgetBtn.click();
        } else {
            console.warn("VLibras widget não encontrado ou ainda não carregado.");
        }
    },

    toggleSimple(className, element) {
        if (this.ensureElements()) {
            this.elements.body.classList.toggle(className);
            if (element) {
                element.classList.toggle("active");
                this.updateDots(element);
            }
        }
    },

    cycleFeature(feature, values, element) {
        if (!this.ensureElements()) return;

        // Incrementa o estado ciclicamente
        this.state[feature] = (this.state[feature] + 1) % (values.length + 1);
        
        const index = this.state[feature] - 1;
        const value = values[index];
        const badge = element ? element.querySelector(".level-badge") : null;

        // Limpa classes anteriores
        if (feature === "fontFamily") {
            this.elements.body.classList.remove("font-atkinson", "font-newsreader", "font-dyslexic");
        }
        if (feature === "contrast") {
            this.elements.body.classList.remove("contrast-dark", "contrast-inverted");
        }

        // Estado 0 (Desativado)
        if (index === -1) {
            if (element) element.classList.remove("active");
            if (badge) badge.style.display = "none";
            if (element) this.resetDots(element);

            if (feature === "fontSize") document.documentElement.style.setProperty("--font-scale", "1");
            if (feature === "letterSpacing") document.documentElement.style.setProperty("--letter-spacing", "normal");
            if (feature === "readingMask") this.toggleReadingMask(false);
        
        } else {
            // Estado Ativo (1, 2, 3...)
            if (element) element.classList.add("active");
            this.updateDots(element, this.state[feature]);

            let displayValue = value;
            
            if (feature === "fontSize") displayValue = (parseFloat(value) * 100) + "%";
            if (feature === "fontFamily") {
                const names = { atkinson: "Legível", newsreader: "Notícia", dyslexic: "Dislexia" };
                displayValue = names[value];
            }
            if (feature === "contrast") {
                const names = { "contrast-dark": "Escuro", "contrast-inverted": "Invertido" };
                displayValue = names[value];
            }

            if (badge) {
                badge.textContent = displayValue;
                badge.style.display = "block";
            }

            // Aplica as mudanças
            if (feature === "fontSize") document.documentElement.style.setProperty("--font-scale", value);
            if (feature === "letterSpacing") document.documentElement.style.setProperty("--letter-spacing", value);
            if (feature === "fontFamily") this.elements.body.classList.add("font-" + value);
            if (feature === "readingMask") this.toggleReadingMask(true, value);
            if (feature === "contrast") this.elements.body.classList.add(value);
        }

        this.saveState();
    },

    toggleReadingMask(active, size) {
        const maskTop = document.getElementById("reading-mask-top");
        const maskBottom = document.getElementById("reading-mask-bottom");

        if (!maskTop || !maskBottom) return;

        maskTop.style.display = active ? "block" : "none";
        maskBottom.style.display = active ? "block" : "none";

        if (active) {
            const height = size === "sm" ? 60 : (size === "md" ? 120 : 200);
            
            window.onmousemove = (e) => {
                const y = e.clientY;
                maskTop.style.height = (y - (height / 2)) + "px";
                maskBottom.style.top = (y + (height / 2)) + "px";
                maskBottom.style.bottom = "0";
            };
        } else {
            window.onmousemove = null;
        }
    },

    toggleTTS(element) {
        if (!this.ensureElements()) return;

        this.state.isTTSActive = !this.state.isTTSActive;
        
        if (element) {
            element.classList.toggle("active");
            this.updateDots(element, this.state.isTTSActive ? 1 : 0);
        }

        if (this.state.isTTSActive) {
            this.elements.body.style.cursor = "help";
            document.onmouseup = () => {
                const selectedText = window.getSelection().toString();
                if (selectedText) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(selectedText);
                    utterance.lang = "pt-BR";
                    window.speechSynthesis.speak(utterance);
                }
            };
        } else {
            this.elements.body.style.cursor = "default";
            document.onmouseup = null;
            window.speechSynthesis.cancel();
        }
    },

    resetAll() {
        this.ensureElements();
        
        // Reseta estados internos
        Object.keys(this.state).forEach(key => {
            if(key !== "theme") this.state[key] = 0; // Mantém tema para não piscar
        });
        this.state.isTTSActive = false;
        
        // Reseta CSS Vars
        document.documentElement.style.setProperty("--font-scale", "1");
        document.documentElement.style.setProperty("--letter-spacing", "normal");
        
        // Reseta Tema
        this.ThemeManager.resetToSystem();
        this.updateThemeIcon(this.ThemeManager.getTheme());
        
        // Limpa classes do body
        if (this.elements.body) {
            this.elements.body.classList.remove(
                "contrast-dark", "contrast-inverted", 
                "highlight-links", "highlight-headers", "bold-text", 
                "stop-anim", "font-atkinson", "font-newsreader", 
                "font-dyslexic", "hide-images", "structure"
            );
            this.elements.body.style.cursor = "default";
        }

        // Limpa funcionalidades específicas
        this.toggleReadingMask(false);
        window.speechSynthesis.cancel();

        // Reseta UI dos cards
        document.querySelectorAll(".accessibility-card").forEach(card => {
            card.classList.remove("active");
            this.resetDots(card);
            const badge = card.querySelector(".level-badge");
            if (badge) badge.style.display = "none";
        });

        localStorage.removeItem("accessControlState");
        window.dispatchEvent(new CustomEvent("Accessibility:Reset"));

        // Feedback visual no botão
        const btn = document.querySelector('button[onclick="resetAllFeatures()"]');
        if (btn) {
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Restaurado!';
            
            if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
            }, 1500);
        }
    },

    updateDots(element, level = 1) {
        if (!element) return;
        element.querySelectorAll(".dot").forEach((dot, index) => {
            if (index < level) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    },

    resetDots(element) {
        if (element) {
            element.querySelectorAll(".dot").forEach(dot => dot.classList.remove("active"));
        }
    }
};

// ============================================================
// EXPORTAÇÃO GLOBAL DE FUNÇÕES (Seguro para redeclaração)
// ============================================================
// Usamos a atribuição direta para garantir que se o script rodar 2x,
// ele apenas re-atribui a mesma função, sem erro de SyntaxError.

window.toggleAccessibilityPanel = () => window.AccessControl.togglePanel();
window.toggleMaximizePanel = () => window.AccessControl.toggleMaximize();
window.toggleLibras = () => window.AccessControl.toggleLibrasWidget(); 
window.toggleSimpleFeature = (cls, el) => window.AccessControl.toggleSimple(cls, el);
window.cycleFeature = (feat, vals, el) => window.AccessControl.cycleFeature(feat, vals, el);
window.toggleTTS = (el) => window.AccessControl.toggleTTS(el);
window.toggleThemeMode = () => window.AccessControl.toggleTheme();
window.resetAllFeatures = () => window.AccessControl.resetAll();

// Inicialização segura
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => window.AccessControl.init(), 50);
    });
} else {
    setTimeout(() => window.AccessControl.init(), 50);
}