/**
 * ACCESSIBILITY.JS
 * Painel de Controle de Acessibilidade
 * Calculadoras de Enfermagem
 * @version Com suporte a orquestração componentsLoaded
 */

window.AccessControl = window.AccessControl || (function() {
  "use strict";
  
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
    theme: "system",
    _initialized: false
  };
  
  let elements = {};
  let mouseMoveHandler = null;
  let readingGuideHandler = null;
  let magnifierHandler = null;
  let ttsClickHandler = null;
  let glossaryData = [];
  
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
  
  function announceToSR(message) {
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
  
  const displayNames = {
    fontSize: {
      "1.2": "120%",
      "1.5": "150%",
      "2.0": "200%"
    },
    fontStyle: {
      atkinson: "Atkinson",
      newsreader: "Newsreader",
      opendyslexic: "OpenDyslexic"
    },
    lineHeight: {
      "1.2": "120%",
      "1.5": "150%",
      "2.0": "200%"
    },
    letterSpacing: {
      "1.2": "120%",
      "1.5": "150%",
      "2.0": "200%"
    },
    contrast: {
      inverted: "Invertido",
      "dark-contrast": "Escuro",
      "light-contrast": "Claro"
    },
    colorblind: {
      deuteranopia: "Verde",
      protanopia: "Vermelho",
      tritanopia: "Azul"
    },
    saturation: {
      low: "Baixa",
      high: "Alta",
      monochrome: "Mono"
    },
    readingMask: {
      sm: "Pequeno",
      md: "Medio",
      lg: "Grande"
    },
    readingGuide: {
      azul: "Azul",
      laranja: "Laranja",
      preto: "Preto"
    },
    bigCursor: {
      medium: "120%",
      large: "150%",
      xlarge: "200%"
    },
    tts: {
      normal: "Normal",
      slow: "Lento",
      fast: "Rapido"
    }
  };
  
  const allClasses = [
    "inverted", "dark-contrast", "light-contrast", "protanopia", "deuteranopia", "tritanopia",
    "saturation-low", "saturation-high", "monochrome", "highlight-links", "highlight-headers",
    "bold-text", "stop-anim", "stop-sounds", "hide-images", "font-atkinson", "font-newsreader",
    "font-opendyslexic", "reading-mode", "glossary", "magnifier-active", "reading-guide-azul",
    "reading-guide-laranja", "reading-guide-preto", "big-cursor-medium", "big-cursor-large", "big-cursor-xlarge"
  ];
  
  const shortcutsByBrowser = {
    chrome: [
      {keys: ["Alt", "A"], desc: "Abrir/Fechar menu acessibilidade"},
      {keys: ["Alt", "1"], desc: "Aumentar fonte"},
      {keys: ["Alt", "2"], desc: "Diminuir fonte"},
      {keys: ["Alt", "C"], desc: "Alto contraste"},
      {keys: ["Alt", "L"], desc: "Destacar links"},
      {keys: ["Alt", "H"], desc: "Destacar cabecalhos"},
      {keys: ["Alt", "M"], desc: "Mascara de leitura"},
      {keys: ["Alt", "G"], desc: "Guia de leitura"},
      {keys: ["Alt", "R"], desc: "Modo leitura"},
      {keys: ["Alt", "T"], desc: "Leitor TTS"},
      {keys: ["Alt", "I"], desc: "Esconder imagens"},
      {keys: ["Alt", "0"], desc: "Restaurar tudo"},
      {keys: ["Esc"], desc: "Fechar paineis"}
    ],
    firefox: [
      {keys: ["Alt", "Shift", "A"], desc: "Abrir/Fechar menu acessibilidade"},
      {keys: ["Alt", "Shift", "1"], desc: "Aumentar fonte"},
      {keys: ["Alt", "Shift", "2"], desc: "Diminuir fonte"},
      {keys: ["Alt", "Shift", "C"], desc: "Alto contraste"},
      {keys: ["Alt", "Shift", "L"], desc: "Destacar links"},
      {keys: ["Alt", "Shift", "H"], desc: "Destacar cabecalhos"},
      {keys: ["Alt", "Shift", "M"], desc: "Mascara de leitura"},
      {keys: ["Alt", "Shift", "G"], desc: "Guia de leitura"},
      {keys: ["Alt", "Shift", "R"], desc: "Modo leitura"},
      {keys: ["Alt", "Shift", "T"], desc: "Leitor TTS"},
      {keys: ["Alt", "Shift", "I"], desc: "Esconder imagens"},
      {keys: ["Alt", "Shift", "0"], desc: "Restaurar tudo"},
      {keys: ["Esc"], desc: "Fechar paineis"}
    ],
    safari: [
      {keys: ["Ctrl", "Option", "A"], desc: "Abrir/Fechar menu acessibilidade"},
      {keys: ["Ctrl", "Option", "1"], desc: "Aumentar fonte"},
      {keys: ["Ctrl", "Option", "2"], desc: "Diminuir fonte"},
      {keys: ["Ctrl", "Option", "C"], desc: "Alto contraste"},
      {keys: ["Ctrl", "Option", "L"], desc: "Destacar links"},
      {keys: ["Ctrl", "Option", "H"], desc: "Destacar cabecalhos"},
      {keys: ["Ctrl", "Option", "M"], desc: "Mascara de leitura"},
      {keys: ["Ctrl", "Option", "G"], desc: "Guia de leitura"},
      {keys: ["Ctrl", "Option", "R"], desc: "Modo leitura"},
      {keys: ["Ctrl", "Option", "T"], desc: "Leitor TTS"},
      {keys: ["Ctrl", "Option", "I"], desc: "Esconder imagens"},
      {keys: ["Ctrl", "Option", "0"], desc: "Restaurar tudo"},
      {keys: ["Esc"], desc: "Fechar paineis"}
    ]
  };
  
  const ThemeManager = {
    detectSystemTheme() {
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    
    getTheme() {
      return localStorage.getItem("acc_theme") || "system";
    },
    
    applyTheme(theme) {
      const isDark = theme === "dark" || (theme === "system" && this.detectSystemTheme() === "dark");
      document.body.classList.toggle("dark-theme", isDark);
      localStorage.setItem("acc_theme", theme);
      state.theme = theme;
      
      // Disparar evento para módulos externos (como header.js)
      window.dispatchEvent(new CustomEvent('theme:changed', {
        detail: {
          theme: theme,
          isDark: isDark
        }
      }));
    },
    
    init() {
      this.applyTheme(this.getTheme());
      window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (this.getTheme() === "system") this.applyTheme("system");
      });
    },
    
    resetToSystem() {
      localStorage.removeItem("acc_theme");
      this.applyTheme("system");
    }
  };
  
  function ensureElements() {
    if (elements.panel && document.body.contains(elements.panel)) return;
    
    elements.panel = document.getElementById("accessibility-panel");
    elements.toggleBtn = document.getElementById("accessibility-toggle");
    elements.closeBtn = document.getElementById("accessibility-close");
    elements.restoreBtn = document.getElementById("accessibility-restore");
    elements.fontIncrease = document.getElementById("font-increase");
    elements.fontDecrease = document.getElementById("font-decrease");
    elements.themeToggle = document.getElementById("theme-toggle");
    elements.shortcutsBtn = document.getElementById("shortcuts-btn");
    elements.glossaryBtn = document.getElementById("glossary-btn");
  }
  
  function togglePanel() {
    ensureElements();
    if (!elements.panel) return;
    
    const isHidden = elements.panel.classList.contains("accessibility-panel-hidden");
    if (isHidden) {
      elements.panel.classList.remove("accessibility-panel-hidden");
      elements.panel.setAttribute("aria-hidden", "false");
      announceToSR("Painel de acessibilidade aberto");
    } else {
      elements.panel.classList.add("accessibility-panel-hidden");
      elements.panel.setAttribute("aria-hidden", "true");
      announceToSR("Painel de acessibilidade fechado");
    }
  }
  
  function closePanel() {
    ensureElements();
    if (elements.panel) {
      elements.panel.classList.add("accessibility-panel-hidden");
      elements.panel.setAttribute("aria-hidden", "true");
    }
  }
  
  function increaseFontSize() {
    if (state.fontSize >= 3) return;
    state.fontSize++;
    const scale = 1 + (state.fontSize * 0.15);
    document.documentElement.style.setProperty("--font-scale", scale);
    document.body.setAttribute("data-font-scale", state.fontSize);
    updateFontIndicators();
    announceToSR("Tamanho da fonte aumentado para " + (scale * 100).toFixed(0) + "%");
  }
  
  function decreaseFontSize() {
    if (state.fontSize <= 0) return;
    state.fontSize--;
    const scale = 1 + (state.fontSize * 0.15);
    document.documentElement.style.setProperty("--font-scale", scale);
    document.body.setAttribute("data-font-scale", state.fontSize);
    updateFontIndicators();
    announceToSR("Tamanho da fonte diminuído para " + (scale * 100).toFixed(0) + "%");
  }
  
  function updateFontIndicators() {
    const indicator = document.querySelector(".font-size-indicator");
    if (indicator) {
      indicator.textContent = displayNames.fontSize[(1 + state.fontSize * 0.15).toFixed(1)] || (100 + state.fontSize * 15) + "%";
    }
  }
  
  function toggleContrast(mode) {
    const modes = ["inverted", "dark-contrast", "light-contrast"];
    modes.forEach(m => {
      if (m !== mode) document.body.classList.remove(m);
    });
    document.body.classList.toggle(mode, state.contrast !== modes.indexOf(mode));
    state.contrast = state.contrast === modes.indexOf(mode) ? 0 : modes.indexOf(mode);
    announceToSR("Modo de contraste: " + (displayNames.contrast[mode] || "padrão"));
  }
  
  function toggleColorblind(mode) {
    const modes = ["deuteranopia", "protanopia", "tritanopia"];
    modes.forEach(m => {
      if (m !== mode) document.body.classList.remove(m);
    });
    document.body.classList.toggle(mode, state.colorblind !== modes.indexOf(mode));
    state.colorblind = state.colorblind === modes.indexOf(mode) ? 0 : modes.indexOf(mode);
    announceToSR("Filtro de daltonismo: " + (displayNames.colorblind[mode] || "desativado"));
  }
  
  function toggleSaturation(mode) {
    const modes = ["saturation-low", "saturation-high", "monochrome"];
    modes.forEach(m => {
      if (m !== mode) document.body.classList.remove(m);
    });
    document.body.classList.toggle(mode, state.saturation !== modes.indexOf(mode));
    state.saturation = state.saturation === modes.indexOf(mode) ? 0 : modes.indexOf(mode);
    announceToSR("Saturação: " + (displayNames.saturation[mode.replace("saturation-", "")] || "normal"));
  }
  
  function toggleBigCursor(size) {
    const sizes = ["medium", "large", "xlarge"];
    sizes.forEach(s => {
      document.body.classList.remove("big-cursor-" + s);
    });
    document.body.classList.toggle("big-cursor-" + size, state.bigCursor !== sizes.indexOf(size));
    state.bigCursor = state.bigCursor === sizes.indexOf(size) ? 0 : sizes.indexOf(size);
    announceToSR("Tamanho do cursor: " + (displayNames.bigCursor[size] || "padrão"));
  }
  
  function toggleReadingMask(size) {
    const mask = document.getElementById("reading-mask");
    if (!mask) {
      createReadingMask();
    }
    state.readingMask = state.readingMask === size ? 0 : size;
    updateReadingMask();
    announceToSR("Máscara de leitura " + (state.readingMask ? "ativa" : "desativada"));
  }
  
  function createReadingMask() {
    const mask = document.createElement("div");
    mask.id = "reading-mask";
    mask.innerHTML = `
      <div id="reading-mask-top"></div>
      <div id="reading-mask-bottom"></div>
    `;
    mask.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9990;display:none";
    document.body.appendChild(mask);
  }
  
  function updateReadingMask() {
    const mask = document.getElementById("reading-mask");
    if (!mask) createReadingMask();
    
    const sizes = {sm: 30, md: 50, lg: 70};
    const top = document.getElementById("reading-mask-top");
    const bottom = document.getElementById("reading-mask-bottom");
    
    if (state.readingMask) {
      const height = sizes[state.readingMask] + "%";
      if (top) top.style.height = height;
      if (bottom) bottom.style.height = height;
      mask.style.display = "block";
    } else {
      mask.style.display = "none";
    }
  }
  
  function toggleReadingGuide(color) {
    const colors = ["azul", "laranja", "preto"];
    colors.forEach(c => {
      document.body.classList.remove("reading-guide-" + c);
    });
    
    if (state.readingGuide !== color) {
      document.body.classList.add("reading-guide-" + color);
      state.readingGuide = color;
      if (!readingGuideHandler) initReadingGuide();
      const guide = document.getElementById("reading-guide");
      if (guide) guide.style.display = "block";
      announceToSR("Guia de leitura na cor " + (displayNames.readingGuide[color] || "ativada"));
    } else {
      state.readingGuide = 0;
      const guide = document.getElementById("reading-guide");
      if (guide) guide.style.display = "none";
      announceToSR("Guia de leitura desativada");
    }
  }
  
  function initReadingGuide() {
    const guide = document.createElement("div");
    guide.id = "reading-guide";
    guide.style.cssText = "position:fixed;left:0;width:100%;height:3px;z-index:9990;pointer-events:none;display:none;box-shadow:0 0 10px currentColor";
    document.body.appendChild(guide);
    
    readingGuideHandler = function(e) {
      if (state.readingGuide) {
        guide.style.top = e.clientY + "px";
      }
    };
    document.addEventListener("mousemove", readingGuideHandler);
  }
  
  function toggleReadingMode() {
    document.body.classList.toggle("reading-mode");
    const isActive = document.body.classList.contains("reading-mode");
    announceToSR("Modo de leitura " + (isActive ? "ativado" : "desativado"));
  }
  
  function toggleHighlightLinks() {
    document.body.classList.toggle("highlight-links");
    announceToSR("Destaque em links " + (document.body.classList.contains("highlight-links") ? "ativado" : "desativado"));
  }
  
  function toggleHighlightHeaders() {
    document.body.classList.toggle("highlight-headers");
    announceToSR("Destaque em títulos " + (document.body.classList.contains("highlight-headers") ? "ativado" : "desativado"));
  }
  
  function toggleBoldText() {
    document.body.classList.toggle("bold-text");
    announceToSR("Texto em negrito " + (document.body.classList.contains("bold-text") ? "ativado" : "desativado"));
  }
  
  function toggleStopAnimations() {
    document.body.classList.toggle("stop-anim");
    announceToSR("Animações " + (document.body.classList.contains("stop-anim") ? "pausadas" : "ativas"));
  }
  
  function toggleHideImages() {
    document.body.classList.toggle("hide-images");
    announceToSR("Imagens " + (document.body.classList.contains("hide-images") ? "ocultas" : "visíveis"));
  }
  
  function toggleFontStyle(style) {
    const styles = ["font-atkinson", "font-newsreader", "font-opendyslexic"];
    styles.forEach(s => {
      document.body.classList.remove(s);
    });
    
    if (state.fontStyle !== style) {
      document.body.classList.add(style);
      state.fontStyle = style;
      announceToSR("Fonte alterada para " + (displayNames.fontStyle[style.replace("font-", "")] || style));
    } else {
      state.fontStyle = 0;
      announceToSR("Fonte restaurada para padrão");
    }
  }
  
  function resetAllSettings() {
    allClasses.forEach(cls => document.body.classList.remove(cls));
    state.fontSize = 0;
    state.fontStyle = 0;
    state.contrast = 0;
    state.colorblind = 0;
    state.saturation = 0;
    state.bigCursor = 0;
    state.readingMask = 0;
    state.readingGuide = 0;
    document.documentElement.style.setProperty("--font-scale", "1");
    document.body.setAttribute("data-font-scale", "0");
    updateFontIndicators();
    updateReadingMask();
    const guide = document.getElementById("reading-guide");
    if (guide) guide.style.display = "none";
    announceToSR("Todas as configurações de acessibilidade foram restauradas");
  }
  
  function showShortcuts() {
    const modal = document.getElementById("shortcuts-modal");
    if (modal) {
      modal.hidden = false;
      renderShortcuts();
      announceToSR("Atalhos de teclado mostrados");
    }
  }
  
  function hideShortcuts() {
    const modal = document.getElementById("shortcuts-modal");
    if (modal) {
      modal.hidden = true;
    }
  }
  
  function renderShortcuts() {
    const container = document.getElementById("shortcuts-list");
    if (!container) return;
    
    const browser = getBrowser();
    const shortcuts = shortcutsByBrowser[browser] || shortcutsByBrowser.chrome;
    
    container.innerHTML = shortcuts.map(shortcut => `
      <div class="shortcut-item">
        <kbd>${shortcut.keys.join(" + ")}</kbd>
        <span>${shortcut.desc}</span>
      </div>
    `).join("");
  }
  
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "safari";
    return "chrome";
  }
  
  /**
   * Inicialização principal do módulo de acessibilidade
   */
  function initAccessibility() {
    ensureElements();
    
    if (elements.toggleBtn) {
      elements.toggleBtn.addEventListener("click", togglePanel);
    }
    
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener("click", closePanel);
    }
    
    if (elements.restoreBtn) {
      elements.restoreBtn.addEventListener("click", resetAllSettings);
    }
    
    if (elements.fontIncrease) {
      elements.fontIncrease.addEventListener("click", increaseFontSize);
    }
    
    if (elements.fontDecrease) {
      elements.fontDecrease.addEventListener("click", decreaseFontSize);
    }
    
    document.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", function() {
        const action = this.getAttribute("data-action");
        const param = this.getAttribute("data-param");
        
        switch (action) {
          case "contrast": toggleContrast(param); break;
          case "colorblind": toggleColorblind(param); break;
          case "saturation": toggleSaturation(param); break;
          case "cursor": toggleBigCursor(param); break;
          case "reading-mask": toggleReadingMask(param); break;
          case "reading-guide": toggleReadingGuide(param); break;
          case "reading-mode": toggleReadingMode(); break;
          case "highlight-links": toggleHighlightLinks(); break;
          case "highlight-headers": toggleHighlightHeaders(); break;
          case "bold-text": toggleBoldText(); break;
          case "stop-anim": toggleStopAnimations(); break;
          case "hide-images": toggleHideImages(); break;
          case "font-style": toggleFontStyle(param); break;
        }
      });
    });
    
    ThemeManager.init();
    state._initialized = true;
    console.log("[AccessControl] Módulo de acessibilidade inicializado");
  }
  
  // ============================================
  // ORQUESTRAÇÃO DE CARREGAMENTO
  // ============================================
  
  // Ouve o evento que disparamos no index.html (orquestração modular)
  document.addEventListener('componentsLoaded', function() {
    console.log('[AccessControl] Evento componentsLoaded recebido');
    initAccessibility();
  });

  // Fallback: Se o evento já tiver passado, tenta rodar direto
  if (document.querySelector('#accessibility-container') || document.querySelector('.accessibility-panel')) {
    initAccessibility();
  }
  
  return {
    init: initAccessibility,
    togglePanel,
    closePanel,
    increaseFontSize,
    decreaseFontSize,
    toggleContrast,
    toggleColorblind,
    toggleSaturation,
    toggleBigCursor,
    toggleReadingMode,
    toggleHighlightLinks,
    toggleHighlightHeaders,
    toggleBoldText,
    toggleStopAnimations,
    toggleHideImages,
    resetAllSettings,
    showShortcuts,
    hideShortcuts
  };
})();
