/**
* Módulo de Acessibilidade Calculadoras de Enfermagem
* Gerencia o painel, widgets, VLibras, overrides de CSS e controle de tema.
*/

// ============================================
// THEME MANAGER - Controle de Tema Claro/Escuro
// ============================================
const ThemeManager = {
    storageKey: 'nursing_calc_theme',
    darkClass: 'dark-theme',
    
    // Inicializar sistema de tema
    init() {
        this.applySavedTheme();
        this.setupSystemListener();
        this.setupTransition();
        
        // Disparar evento que o header pode ouvir
        window.dispatchEvent(new CustomEvent('ThemeManager:Ready'));
    },
    
    // Obter tema atual
    getTheme() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return saved;
        
        // Verificar preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },
    
    // Verificar se está em modo escuro
    isDarkMode() {
        return document.body.classList.contains(this.darkClass) || this.getTheme() === 'dark';
    },
    
    // Aplicar tema salvo ou preferência do sistema
    applySavedTheme() {
        const theme = this.getTheme();
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
            document.body.classList.add(this.darkClass);
        } else {
            document.body.classList.remove(this.darkClass);
        }
        
        // Atualizar atributos de acessibilidade
        document.body.setAttribute('data-theme', theme);
        
        // Disparar evento de mudança de tema
        window.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme, isDark } }));
    },
    
    // Alternar tema
    toggle() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        return newTheme;
    },
    
    // Aplicar tema específico
    applyTheme(theme) {
        const isDark = theme === 'dark';
        
        if (isDark) {
            document.body.classList.add(this.darkClass);
        } else {
            document.body.classList.remove(this.darkClass);
        }
        
        localStorage.setItem(this.storageKey, theme);
        document.body.setAttribute('data-theme', theme);
        
        // Disparar evento de mudança de tema
        window.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme, isDark } }));
        
        console.log('[ThemeManager] Tema aplicado:', theme);
    },
    
    // Configurar listener para mudanças no sistema
    setupSystemListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Só reagir se não houver preferência salva pelo usuário
            mediaQuery.addEventListener('change', (e) => {
                const saved = localStorage.getItem(this.storageKey);
                if (!saved || saved === 'system') {
                    this.applySavedTheme();
                    
                    // Atualizar ícones do toggle
                    window.dispatchEvent(new CustomEvent('theme:updated', { 
                        detail: { isDark: e.matches } 
                    }));
                }
            });
        }
    },
    
    // Configurar transição suave
    setupTransition() {
        // Aplicar transição nas cores
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // Prevenir flash de cor incorreta
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) {
            // Adicionar classe para esconder flash
            document.documentElement.classList.add('theme-transitioning');
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 300);
        }
    }
};

const AccessControl = {
  state: {
    fontSize: 0,
    fontFamily: 0,
    letterSpacing: 0,
    readingMask: 0,
    isTTSActive: false,
    contrast: 0
  },
  elements: {},

  ensureElements() {
    if (this.elements.panel && this.elements.sideWidgets) return true;
    this.elements = {
      body: document.body,
      panel: document.getElementById("accessibility-panel"),
      sideWidgets: document.getElementById("side-widgets"),
      closeBtn: document.getElementById("close-panel-btn"),
      openBtn: document.getElementById("accessibility-btn")
    };
    return !!this.elements.panel;
  },

  init() {
    this.ensureElements();
    if (!this.elements.panel) {
      console.warn("Painel de Acessibilidade não encontrado no DOM.");
      return;
    }
    this.setupDeferredInit();
    this.setupObservers();
    this.setupGlobalEvents();
    this.loadSavedState();
  },

  setupDeferredInit() {
    let lucideAttempts = 0;
    const tryInitLucide = () => {
      lucideAttempts++;
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      } else if (lucideAttempts < 10) {
        setTimeout(tryInitLucide, 100);
      }
    };
    tryInitLucide();

    const checkVLibras = setInterval(() => {
      if (window.VLibras && window.VLibras.Widget) {
        clearInterval(checkVLibras);
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    }, 200);
    setTimeout(() => clearInterval(checkVLibras), 10000);
  },

  loadSavedState() {
    const savedState = localStorage.getItem("accessControlState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.fontSize && parsed.fontSize !== 0) {
          document.documentElement.style.setProperty("--font-scale", parsed.fontSize);
        }
      } catch (e) {
        console.warn("Erro ao carregar estado de acessibilidade:", e);
      }
    }
  },

  saveState() {
    const stateToSave = {
      fontSize: this.state.fontSize > 0 ? ["", "1.2", "1.5", "2.0"][this.state.fontSize] : 0,
      contrast: this.state.contrast > 0 ? ["", "contrast-dark", "contrast-inverted"][this.state.contrast] : 0
    };
    localStorage.setItem("accessControlState", JSON.stringify(stateToSave));
  },

  setupObservers() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === "class") {
          const classList = document.body.classList;
          if (classList.contains("modal-open") ||
              classList.contains("mobile-menu-open") ||
              classList.contains("overflow-hidden")) {
            if (!this.isPanelClosed()) this.closePanel();
          }
        }
      });
    });
    observer.observe(document.body, { attributes: true });
  },

  setupGlobalEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closePanel();
    });
    document.addEventListener("click", (e) => {
      if (!this.ensureElements()) return;
      if (!this.isPanelClosed() &&
          this.elements.panel?.contains(e.target) === false &&
          this.elements.sideWidgets?.contains(e.target) === false) {
        this.closePanel();
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
    this.elements.sideWidgets?.classList.add("side-widgets-hidden");
    this.hideFloatingButtons();
    setTimeout(() => {
      this.elements.sideWidgets?.classList.remove("side-widgets-hidden");
      this.showFloatingButtons();
      this.elements.openBtn?.focus();
    });
  },

  hideFloatingButtons() {
    const cookieFab = document.getElementById("cookie-fab");
    const backToTop = document.getElementById("backToTop");
    if (cookieFab) cookieFab.style.display = "none";
    if (backToTop) backToTop.style.display = "none";
  },

  showFloatingButtons() {
    const cookieFab = document.getElementById("cookie-fab");
    const backToTop = document.getElementById("backToTop");
    if (cookieFab) cookieFab.style.display = "flex";
    if (backToTop) backToTop.style.display = "flex";
  },

  toggleMaximize() {
    if (!this.ensureElements() || !this.elements.panel) return;
    this.elements.panel.classList.toggle("panel-expanded");
  },

  toggleLibrasWidget() {
    const vlibrasBtn = document.querySelector("[vw-access-button]");
    if (vlibrasBtn) vlibrasBtn.click();
  },

  toggleSimple(className, cardElement) {
    if (!this.ensureElements()) return;
    this.elements.body.classList.toggle(className);
    if (cardElement) {
      cardElement.classList.toggle("active");
      this.updateDots(cardElement);
    }
  },

  cycleFeature(key, values, cardElement) {
    if (!this.ensureElements()) return;
    this.state[key] = (this.state[key] + 1) % (values.length + 1);
    const currentIndex = this.state[key] - 1;
    const activeValue = values[currentIndex];
    const badge = cardElement?.querySelector(".level-badge");

    if (key === "fontFamily") this.elements.body.classList.remove("font-atkinson", "font-newsreader", "font-dyslexic");
    if (key === "contrast") this.elements.body.classList.remove("contrast-dark", "contrast-inverted");

    if (currentIndex === -1) {
      cardElement?.classList.remove("active");
      if (badge) badge.style.display = "none";
      if (cardElement) this.resetDots(cardElement);
      if (key === "fontSize") document.documentElement.style.setProperty("--font-scale", "1");
      if (key === "letterSpacing") document.documentElement.style.setProperty("--letter-spacing", "normal");
      if (key === "readingMask") this.toggleReadingMask(false);
    } else {
      cardElement?.classList.add("active");
      this.updateDots(cardElement, this.state[key]);

      let txt = activeValue;
      if (key === "fontSize") txt = (parseFloat(activeValue) * 100) + "%";
      if (key === "fontFamily") txt = { "atkinson": "Legível", "newsreader": "Notícia", "dyslexic": "Dislexia" }[activeValue];
      if (key === "contrast") txt = { "contrast-dark": "Escuro", "contrast-inverted": "Invertido" }[activeValue];
      if (badge) { badge.textContent = txt; badge.style.display = "block"; }

      if (key === "fontSize") document.documentElement.style.setProperty("--font-scale", activeValue);
      if (key === "letterSpacing") document.documentElement.style.setProperty("--letter-spacing", activeValue);
      if (key === "fontFamily") this.elements.body.classList.add("font-" + activeValue);
      if (key === "readingMask") this.toggleReadingMask(true, activeValue);
      if (key === "contrast") this.elements.body.classList.add(activeValue);
    }
    this.saveState();
  },

  toggleReadingMask(active, size) {
    const top = document.getElementById("reading-mask-top");
    const bottom = document.getElementById("reading-mask-bottom");
    if (!top || !bottom) return;
    top.style.display = active ? "block" : "none";
    bottom.style.display = active ? "block" : "none";
    if (active) {
      const gap = size === "sm" ? 60 : (size === "md" ? 120 : 200);
      window.onmousemove = (e) => {
        const y = e.clientY;
        top.style.height = (y - gap / 2) + "px";
        bottom.style.top = (y + gap / 2) + "px";
        bottom.style.bottom = "0";
      };
    } else {
      window.onmousemove = null;
    }
  },

  toggleTTS(cardElement) {
    if (!this.ensureElements()) return;
    this.state.isTTSActive = !this.state.isTTSActive;
    if (cardElement) {
      cardElement.classList.toggle("active");
      this.updateDots(cardElement, this.state.isTTSActive ? 1 : 0);
    }
    if (this.state.isTTSActive) {
      this.elements.body.style.cursor = "help";
      document.onmouseup = () => {
        const text = window.getSelection().toString();
        if (text) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang = "pt-BR";
          window.speechSynthesis.speak(utt);
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
    Object.keys(this.state).forEach(k => this.state[k] = 0);
    document.documentElement.style.setProperty("--font-scale", "1");
    document.documentElement.style.setProperty("--letter-spacing", "normal");
    if (this.elements.body) {
      this.elements.body.classList.remove(
        "contrast-dark", "contrast-inverted", "highlight-links", "highlight-headers",
        "bold-text", "stop-anim", "font-atkinson", "font-newsreader", "font-dyslexic",
        "hide-images", "structure"
      );
      this.elements.body.style.cursor = "default";
    }
    this.toggleReadingMask(false);
    window.speechSynthesis.cancel();
    document.querySelectorAll(".accessibility-card").forEach(c => {
      c.classList.remove("active");
      this.resetDots(c);
      const badge = c.querySelector(".level-badge");
      if (badge) badge.style.display = "none";
    });
    localStorage.removeItem("accessControlState");
    window.dispatchEvent(new CustomEvent("Accessibility:Reset"));
  },

  updateDots(card, count = 1) {
    if (!card) return;
    card.querySelectorAll(".dot").forEach((d, i) => {
      i < count ? d.classList.add("active") : d.classList.remove("active");
    });
  },

  resetDots(card) {
    if (!card) return;
    card.querySelectorAll(".dot").forEach(d => d.classList.remove("active"));
  }
};

// Exposição Global
window.toggleAccessibilityPanel = () => AccessControl.togglePanel();
window.toggleMaximizePanel = () => AccessControl.toggleMaximize();
window.toggleLibras = () => AccessControl.toggleLibrasWidget();
window.toggleSimpleFeature = (cls, el) => AccessControl.toggleSimple(cls, el);
window.cycleFeature = (key, vals, el) => AccessControl.cycleFeature(key, vals, el);
window.toggleTTS = (el) => AccessControl.toggleTTS(el);
window.resetAllFeatures = () => AccessControl.resetAll();

// Inicializar ThemeManager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
    ThemeManager.init();
}

// Expor ThemeManager globalmente
window.ThemeManager = ThemeManager;
