const AccessControl={state:{fontSize:0,fontFamily:0,letterSpacing:0,readingMask:0,isTTSActive:!1,contrast:0,theme:"system"},elements:{},ThemeManager:{keys:{theme:"nursing_calc_theme",systemPreference:"nursing_calc_system_theme"},detectSystemTheme(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"},getTheme(){const e=localStorage.getItem(this.keys.theme);if(e)return e;const t=this.detectSystemTheme();return localStorage.setItem(this.keys.systemTheme,t),"system"},applyTheme(e){const t=document.body;e==="dark"||e==="system"&&this.detectSystemTheme()==="dark"?t.classList.add("dark-theme"):t.classList.remove("dark-theme"),localStorage.setItem(this.keys.theme,e),this.state.theme=e},toggleTheme(){const t=this.getTheme()==="dark"?"light":"dark";return this.applyTheme(t),window.dispatchEvent(new CustomEvent("Theme:Changed",{detail:{theme:t}})),t},init(){const e=this.getTheme();this.applyTheme(e),window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",t=>{localStorage.getItem(this.keys.theme)==="system"&&this.applyTheme("system")})},resetToSystem(){localStorage.removeItem(this.keys.theme),this.applyTheme("system")}},init(){this.ThemeManager.init(),this.ensureElements(),this.elements.panel&&(this.setupDeferredInit(),this.setupObservers(),this.setupGlobalEvents(),this.loadSavedState())},ensureElements(){return this.elements.panel&&this.elements.sideWidgets?!0:(this.elements={body:document.body,panel:document.getElementById("accessibility-panel"),sideWidgets:document.getElementById("side-widgets"),closeBtn:document.getElementById("close-panel-btn"),openBtn:document.getElementById("accessibility-btn"),themeToggleBtn:document.getElementById("theme-toggle-btn"),themeIcon:document.getElementById("theme-icon")},!!this.elements.panel)},setupDeferredInit(){let e=0;const t=()=>{e++,window.lucide&&typeof window.lucide.createIcons=="function"?window.lucide.createIcons():e<10&&setTimeout(t,100)};t();const s=setInterval(()=>{window.VLibras&&window.VLibras.Widget&&(clearInterval(s),new window.VLibras.Widget("https://vlibras.gov.br/app"))},200);setTimeout(()=>clearInterval(s),1e4)},loadSavedState(){const e=localStorage.getItem("accessControlState");if(e)try{const t=JSON.parse(e);t.fontSize&&t.fontSize!==0&&document.documentElement.style.setProperty("--font-scale",t.fontSize),t.contrast&&t.contrast;const s=this.ThemeManager.getTheme();this.updateThemeIcon(s)}catch{}},saveState(){const e={fontSize:this.state.fontSize>0?["","1.2","1.5","2.0"][this.state.fontSize]:0,contrast:this.state.contrast>0?["","contrast-dark","contrast-inverted"][this.state.contrast]:0,theme:this.state.theme};localStorage.setItem("accessControlState",JSON.stringify(e))},setupObservers(){new MutationObserver(t=>{t.forEach(s=>{if(s.attributeName==="class"){const i=document.body.classList;(i.contains("modal-open")||i.contains("mobile-menu-open")||i.contains("overflow-hidden"))&&(this.isPanelClosed()||this.closePanel())}})}).observe(document.body,{attributes:!0})},setupGlobalEvents(){document.addEventListener("keydown",e=>{e.key==="Escape"&&this.closePanel()}),document.addEventListener("click",e=>{this.ensureElements()&&!this.isPanelClosed()&&this.elements.panel&&this.elements.panel.contains(e.target)===!1&&this.elements.sideWidgets&&this.elements.sideWidgets.contains(e.target)===!1&&this.closePanel()})},isPanelClosed(){return!this.ensureElements()||!this.elements.panel?!0:this.elements.panel.classList.contains("accessibility-panel-hidden")},togglePanel(){this.ensureElements()&&(this.isPanelClosed()?this.openPanel():this.closePanel())},openPanel(){!this.ensureElements()||!this.elements.panel||(this.elements.panel.classList.remove("accessibility-panel-hidden"),this.elements.sideWidgets&&this.elements.sideWidgets.classList.add("side-widgets-hidden"),this.hideFloatingButtons(),setTimeout(()=>{this.elements.closeBtn&&this.elements.closeBtn.focus()},100))},closePanel(){!this.ensureElements()||!this.elements.panel||this.isPanelClosed()||(this.elements.panel.classList.add("accessibility-panel-hidden"),this.elements.sideWidgets&&this.elements.sideWidgets.classList.remove("side-widgets-hidden"),this.showFloatingButtons(),this.elements.openBtn&&this.elements.openBtn.focus())},toggleMaximize(){!this.ensureElements()||!this.elements.panel||this.elements.panel.classList.toggle("panel-expanded")},toggleTheme(){const e=this.ThemeManager.toggleTheme();this.updateThemeIcon(e),this.saveState()},updateThemeIcon(e){if(!this.ensureElements())return;const t=this.elements.themeIcon;t&&(e==="dark"||e==="system"&&this.ThemeManager.detectSystemTheme()==="dark"?(t.className="fas fa-sun",t.setAttribute("aria-label","Alternar para modo claro")):(t.className="fas fa-moon",t.setAttribute("aria-label","Alternar para modo escuro")))},hideFloatingButtons(){const e=document.getElementById("cookie-fab"),t=document.getElementById("backToTop");e&&(e.style.display="none"),t&&(t.style.display="none")},showFloatingButtons(){const e=document.getElementById("cookie-fab"),t=document.getElementById("backToTop");e&&(e.style.display="flex"),t&&(t.style.display="flex")},toggleLibrasWidget(){const e=document.querySelector("[vw-access-button]");e&&e.click()},toggleSimple(e,t){this.ensureElements()&&(this.elements.body.classList.toggle(e),t&&(t.classList.toggle("active"),this.updateDots(t)))},cycleFeature(e,t,s){if(!this.ensureElements())return;this.state[e]=(this.state[e]+1)%(t.length+1);const i=this.state[e]-1,n=t[i],o=s?s.querySelector(".level-badge"):null;if(e==="fontFamily"&&this.elements.body.classList.remove("font-atkinson","font-newsreader","font-dyslexic"),e==="contrast"&&this.elements.body.classList.remove("contrast-dark","contrast-inverted"),i===-1)s&&s.classList.remove("active"),o&&(o.style.display="none"),s&&this.resetDots(s),e==="fontSize"&&document.documentElement.style.setProperty("--font-scale","1"),e==="letterSpacing"&&document.documentElement.style.setProperty("--letter-spacing","normal"),e==="readingMask"&&this.toggleReadingMask(!1);else{s&&s.classList.add("active"),this.updateDots(s,this.state[e]);let a=n;e==="fontSize"&&(a=parseFloat(n)*100+"%"),e==="fontFamily"&&(a={atkinson:"Leg\xEDvel",newsreader:"Not\xEDcia",dyslexic:"Dislexia"}[n]),e==="contrast"&&(a={"contrast-dark":"Escuro","contrast-inverted":"Invertido"}[n]),o&&(o.textContent=a,o.style.display="block"),e==="fontSize"&&document.documentElement.style.setProperty("--font-scale",n),e==="letterSpacing"&&document.documentElement.style.setProperty("--letter-spacing",n),e==="fontFamily"&&this.elements.body.classList.add("font-"+n),e==="readingMask"&&this.toggleReadingMask(!0,n),e==="contrast"&&this.elements.body.classList.add(n)}this.saveState()},toggleReadingMask(e,t){const s=document.getElementById("reading-mask-top"),i=document.getElementById("reading-mask-bottom");if(!(!s||!i))if(s.style.display=e?"block":"none",i.style.display=e?"block":"none",e){const n=t==="sm"?60:t==="md"?120:200;window.onmousemove=o=>{const a=o.clientY;s.style.height=a-n/2+"px",i.style.top=a+n/2+"px",i.style.bottom="0"}}else window.onmousemove=null},toggleTTS(e){this.ensureElements()&&(this.state.isTTSActive=!this.state.isTTSActive,e&&(e.classList.toggle("active"),this.updateDots(e,this.state.isTTSActive?1:0)),this.state.isTTSActive?(this.elements.body.style.cursor="help",document.onmouseup=()=>{const t=window.getSelection().toString();if(t){window.speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(t);s.lang="pt-BR",window.speechSynthesis.speak(s)}}):(this.elements.body.style.cursor="default",document.onmouseup=null,window.speechSynthesis.cancel()))},resetAll(){this.ensureElements(),Object.keys(this.state).forEach(s=>this.state[s]=0),document.documentElement.style.setProperty("--font-scale","1"),document.documentElement.style.setProperty("--letter-spacing","normal"),this.ThemeManager.resetToSystem(),this.updateThemeIcon(this.ThemeManager.getTheme()),this.elements.body&&(this.elements.body.classList.remove("contrast-dark","contrast-inverted","highlight-links","highlight-headers","bold-text","stop-anim","font-atkinson","font-newsreader","font-dyslexic","hide-images","structure"),this.elements.body.style.cursor="default"),this.toggleReadingMask(!1),window.speechSynthesis.cancel(),document.querySelectorAll(".accessibility-card").forEach(s=>{s.classList.remove("active"),this.resetDots(s);const i=s.querySelector(".level-badge");i&&(i.style.display="none")}),localStorage.removeItem("accessControlState"),window.dispatchEvent(new CustomEvent("Accessibility:Reset"));const t=document.querySelector('button[onclick="resetAllFeatures()"]');if(t){const s=t.innerHTML;t.innerHTML='<i class="fas fa-check" aria-hidden="true"></i> Restaurado!',window.lucide&&typeof window.lucide.createIcons=="function"&&window.lucide.createIcons(),setTimeout(()=>{t.innerHTML=s,window.lucide&&typeof window.lucide.createIcons=="function"&&window.lucide.createIcons()},1500)}},updateDots(e,t=1){if(!e)return;e.querySelectorAll(".dot").forEach((i,n)=>{n<t?i.classList.add("active"):i.classList.remove("active")})},resetDots(e){e&&e.querySelectorAll(".dot").forEach(t=>t.classList.remove("active"))}};window.toggleAccessibilityPanel=()=>AccessControl.togglePanel(),window.toggleMaximizePanel=()=>AccessControl.toggleMaximize(),window.toggleLibras=()=>{typeof toggleLibras=="function"&&toggleLibras()},window.toggleSimpleFeature=(e,t)=>AccessControl.toggleSimple(e,t),window.cycleFeature=(e,t,s)=>AccessControl.cycleFeature(e,t,s),window.toggleTTS=e=>AccessControl.toggleTTS(e),window.toggleThemeMode=()=>AccessControl.toggleTheme(),window.resetAllFeatures=()=>AccessControl.resetAll(),document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{AccessControl.init()},50)});
const AccessControl = {
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
            AccessControl.state.theme = theme;
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
        if (this.elements.panel && this.elements.sideWidgets) return true;

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
                new window.VLibras.Widget("https://vlibras.gov.br/app");
            }
        }, 200);

        // Timeout de segurança para parar de tentar carregar VLibras
        setTimeout(() => clearInterval(vLibrasInterval), 10000);
    },

    loadSavedState() {
        const savedState = localStorage.getItem("accessControlState");
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                // Restaura Font Size
                if (state.fontSize && state.fontSize !== 0) {
                    document.documentElement.style.setProperty("--font-scale", state.fontSize);
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
            fontSize: this.state.fontSize > 0 ? ["", "1.2", "1.5", "2.0"][this.state.fontSize] : 0,
            contrast: this.state.contrast > 0 ? ["", "contrast-dark", "contrast-inverted"][this.state.contrast] : 0,
            theme: this.state.theme
        };
        localStorage.setItem("accessControlState", JSON.stringify(stateToSave));
    },

    setupObservers() {
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
    },

    setupGlobalEvents() {
        // Fecha com ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.closePanel();
        });

        // Fecha ao clicar fora
        document.addEventListener("click", (e) => {
            if (this.ensureElements() && !this.isPanelClosed()) {
                if (this.elements.panel && !this.elements.panel.contains(e.target) &&
                    this.elements.sideWidgets && !this.elements.sideWidgets.contains(e.target)) {
                    this.closePanel();
                }
            }
        });
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
        Object.keys(this.state).forEach(key => this.state[key] = 0);
        
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
// EXPORTAÇÃO GLOBAL DE FUNÇÕES
// ============================================================
// Estas funções são chamadas pelo HTML (onclick="...")
// ============================================================

window.toggleAccessibilityPanel = () => AccessControl.togglePanel();
window.toggleMaximizePanel = () => AccessControl.toggleMaximize();

// CORREÇÃO AQUI: Aponta para a função correta no objeto, evitando recursividade
window.toggleLibras = () => AccessControl.toggleLibrasWidget(); 

window.toggleSimpleFeature = (cls, el) => AccessControl.toggleSimple(cls, el);
window.cycleFeature = (feat, vals, el) => AccessControl.cycleFeature(feat, vals, el);
window.toggleTTS = (el) => AccessControl.toggleTTS(el);
window.toggleThemeMode = () => AccessControl.toggleTheme();
window.resetAllFeatures = () => AccessControl.resetAll();

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        AccessControl.init();
    }, 50);
});