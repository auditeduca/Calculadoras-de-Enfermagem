/**
 * ACCESSIBILITY.JS
 * Módulo de Controle de Acessibilidade
 * Calculadoras de Enfermagem
 * 
 * Gerencia todas as funcionalidades de acessibilidade do site,
 * incluindo tamanho de fonte, contraste, filtros de daltonismo,
 * modo de leitura, e integrações com o header.
 */

(function(window, document) {
  'use strict';

  /**
   * State Management - Armazenamento de estado das configurações
   */
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
    theme: 'system',
    highlightLinks: false,
    highlightHeaders: false,
    boldText: false,
    stopAnim: false,
    hideImages: false,
    readingMode: false,
    _initialized: false
  };

  /**
   * Element References - Cache de elementos do DOM
   */
  const elements = {
    panel: null,
    toggleBtn: null,
    closeBtn: null,
    restoreBtn: null,
    fontIncrease: null,
    fontDecrease: null,
    themeToggle: null,
    shortcutsBtn: null,
    glossaryBtn: null,
    shortcutsModal: null,
    glossaryModal: null,
    shortcutsList: null,
    glossaryList: null,
    glossarySearch: null,
    alphabetToggle: null,
    alphabetLetters: null,
    browserTabs: null,
    readingMask: null,
    readingGuide: null
  };

  /**
   * Event Handlers - Referências para cleanup
   */
  let mouseMoveHandler = null;
  let readingGuideHandler = null;
  let magnifierHandler = null;
  let ttsClickHandler = null;
  let glossaryData = [];

  /**
   * Utility Functions
   */
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

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
    return 'chrome';
  }

  /**
   * Screen Reader Announcer - Feedback para leitores de tela
   */
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

  /**
   * Display Names - Nomes paraannounce
   */
  const displayNames = {
    fontSize: {
      '1.2': '120%',
      '1.5': '150%',
      '2.0': '200%'
    },
    fontStyle: {
      atkinson: 'Atkinson Hyperlegible',
      newsreader: 'Newsreader',
      opendyslexic: 'OpenDyslexic'
    },
    lineHeight: {
      '1.2': '120%',
      '1.5': '150%',
      '2.0': '200%'
    },
    letterSpacing: {
      '1.2': '120%',
      '1.5': '150%',
      '2.0': '200%'
    },
    contrast: {
      inverted: 'Cores Invertidas',
      'dark-contrast': 'Alto Contraste Escuro',
      'light-contrast': 'Alto Contraste Claro'
    },
    colorblind: {
      deuteranopia: 'Deuteranopia (Verde)',
      protanopia: 'Protanopia (Vermelho)',
      tritanopia: 'Tritanopia (Azul)'
    },
    saturation: {
      low: 'Saturação Baixa',
      high: 'Saturação Alta',
      monochrome: 'Monocromático'
    },
    readingMask: {
      sm: 'Pequeno',
      md: 'Médio',
      lg: 'Grande'
    },
    readingGuide: {
      azul: 'Guia Azul',
      laranja: 'Guia Laranja',
      preto: 'Guia Preto'
    },
    bigCursor: {
      medium: 'Grande (120%)',
      large: 'Extra Grande (150%)',
      xlarge: 'Máximo (200%)'
    },
    tts: {
      normal: 'Normal',
      slow: 'Lento',
      fast: 'Rápido'
    },
    theme: {
      light: 'Tema Claro',
      dark: 'Tema Escuro',
      system: 'Automático do Sistema'
    }
  };

  /**
   * All CSS Classes - Lista de todas as classes gerenciadas
   */
  const allClasses = [
    'inverted', 'dark-contrast', 'light-contrast', 
    'protanopia', 'deuteranopia', 'tritanopia',
    'saturation-low', 'saturation-high', 'monochrome', 
    'highlight-links', 'highlight-headers',
    'bold-text', 'stop-anim', 'stop-sounds', 'hide-images', 
    'font-atkinson', 'font-newsreader', 'font-opendyslexic', 
    'reading-mode', 'glossary', 'magnifier-active', 
    'reading-guide-azul', 'reading-guide-laranja', 'reading-guide-preto',
    'big-cursor-medium', 'big-cursor-large', 'big-cursor-xlarge'
  ];

  /**
   * Keyboard Shortcuts - Atalhos por navegador
   */
  const shortcutsByBrowser = {
    chrome: [
      { keys: ['Alt', 'A'], desc: 'Abrir/Fechar menu acessibilidade', action: 'togglePanel' },
      { keys: ['Alt', '1'], desc: 'Aumentar fonte', action: 'increaseFont' },
      { keys: ['Alt', '2'], desc: 'Diminuir fonte', action: 'decreaseFont' },
      { keys: ['Alt', 'C'], desc: 'Alto contraste', action: 'toggleContrast' },
      { keys: ['Alt', 'L'], desc: 'Destacar links', action: 'toggleLinks' },
      { keys: ['Alt', 'H'], desc: 'Destacar títulos', action: 'toggleHeaders' },
      { keys: ['Alt', 'M'], desc: 'Máscara de leitura', action: 'toggleMask' },
      { keys: ['Alt', 'G'], desc: 'Guia de leitura', action: 'toggleGuide' },
      { keys: ['Alt', 'R'], desc: 'Modo leitura', action: 'toggleReading' },
      { keys: ['Alt', 'T'], desc: 'Alternar tema', action: 'toggleTheme' },
      { keys: ['Alt', 'I'], desc: 'Esconder imagens', action: 'toggleImages' },
      { keys: ['Alt', '0'], desc: 'Restaurar tudo', action: 'reset' },
      { keys: ['Esc'], desc: 'Fechar painéis', action: 'closeAll' }
    ],
    firefox: [
      { keys: ['Alt', 'Shift', 'A'], desc: 'Abrir/Fechar menu acessibilidade', action: 'togglePanel' },
      { keys: ['Alt', 'Shift', '1'], desc: 'Aumentar fonte', action: 'increaseFont' },
      { keys: ['Alt', 'Shift', '2'], desc: 'Diminuir fonte', action: 'decreaseFont' },
      { keys: ['Alt', 'Shift', 'C'], desc: 'Alto contraste', action: 'toggleContrast' },
      { keys: ['Alt', 'Shift', 'L'], desc: 'Destacar links', action: 'toggleLinks' },
      { keys: ['Alt', 'Shift', 'H'], desc: 'Destacar títulos', action: 'toggleHeaders' },
      { keys: ['Alt', 'Shift', 'M'], desc: 'Máscara de leitura', action: 'toggleMask' },
      { keys: ['Alt', 'Shift', 'G'], desc: 'Guia de leitura', action: 'toggleGuide' },
      { keys: ['Alt', 'Shift', 'R'], desc: 'Modo leitura', action: 'toggleReading' },
      { keys: ['Alt', 'Shift', 'T'], desc: 'Alternar tema', action: 'toggleTheme' },
      { keys: ['Alt', 'Shift', 'I'], desc: 'Esconder imagens', action: 'toggleImages' },
      { keys: ['Alt', 'Shift', '0'], desc: 'Restaurar tudo', action: 'reset' },
      { keys: ['Esc'], desc: 'Fechar painéis', action: 'closeAll' }
    ],
    safari: [
      { keys: ['Ctrl', 'Option', 'A'], desc: 'Abrir/Fechar menu acessibilidade', action: 'togglePanel' },
      { keys: ['Ctrl', 'Option', '1'], desc: 'Aumentar fonte', action: 'increaseFont' },
      { keys: ['Ctrl', 'Option', '2'], desc: 'Diminuir fonte', action: 'decreaseFont' },
      { keys: ['Ctrl', 'Option', 'C'], desc: 'Alto contraste', action: 'toggleContrast' },
      { keys: ['Ctrl', 'Option', 'L'], desc: 'Destacar links', action: 'toggleLinks' },
      { keys: ['Ctrl', 'Option', 'H'], desc: 'Destacar títulos', action: 'toggleHeaders' },
      { keys: ['Ctrl', 'Option', 'M'], desc: 'Máscara de leitura', action: 'toggleMask' },
      { keys: ['Ctrl', 'Option', 'G'], desc: 'Guia de leitura', action: 'toggleGuide' },
      { keys: ['Ctrl', 'Option', 'R'], desc: 'Modo leitura', action: 'toggleReading' },
      { keys: ['Ctrl', 'Option', 'T'], desc: 'Alternar tema', action: 'toggleTheme' },
      { keys: ['Ctrl', 'Option', 'I'], desc: 'Esconder imagens', action: 'toggleImages' },
      { keys: ['Ctrl', 'Option', '0'], desc: 'Restaurar tudo', action: 'reset' },
      { keys: ['Esc'], desc: 'Fechar painéis', action: 'closeAll' }
    ]
  };

  /**
   * ThemeManager - Gerenciador de Tema Claro/Escuro
   */
  const ThemeManager = {
    detectSystemTheme() {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    getTheme() {
      return localStorage.getItem('acc_theme') || 'system';
    },

    applyTheme(theme) {
      const isDark = theme === 'dark' || (theme === 'system' && this.detectSystemTheme() === 'dark');
      document.body.classList.toggle('dark-theme', isDark);
      localStorage.setItem('acc_theme', theme);
      state.theme = theme;
      
      // Disparar evento para outros módulos
      window.dispatchEvent(new CustomEvent('theme:changed', {
        detail: { theme, isDark }
      }));
    },

    toggle() {
      const current = this.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      return next;
    },

    isDarkMode() {
      return document.body.classList.contains('dark-theme');
    },

    init() {
      this.applyTheme(this.getTheme());
      
      // Escutar mudanças no tema do sistema
      window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.getTheme() === 'system') {
          this.applyTheme('system');
        }
      });

      // Disparar evento de prontidão
      window.dispatchEvent(new CustomEvent('ThemeManager:Ready'));
    },

    resetToSystem() {
      localStorage.removeItem('acc_theme');
      this.applyTheme('system');
    }
  };

  /**
   * Element Cache - Garante que elementos existem
   */
  function ensureElements() {
    if (elements.panel && document.body.contains(elements.panel)) return;

    elements.panel = document.getElementById('accessibility-panel');
    elements.toggleBtn = document.getElementById('accessibility-toggle');
    elements.closeBtn = document.getElementById('accessibility-close');
    elements.restoreBtn = document.getElementById('accessibility-restore');
    elements.fontIncrease = document.getElementById('font-increase');
    elements.fontDecrease = document.getElementById('font-decrease');
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.shortcutsBtn = document.getElementById('shortcuts-btn');
    elements.glossaryBtn = document.getElementById('glossary-btn');
    elements.shortcutsModal = document.getElementById('shortcuts-modal');
    elements.glossaryModal = document.getElementById('glossary-modal');
    elements.shortcutsList = document.getElementById('shortcuts-list');
    elements.glossaryList = document.getElementById('glossary-list');
    elements.glossarySearch = document.getElementById('glossary-search-input');
    elements.alphabetToggle = document.querySelector('.alphabet-toggle');
    elements.alphabetLetters = document.querySelector('.alphabet-letters');
    elements.browserTabs = document.querySelector('.browser-tabs');
  }

  /**
   * Panel Functions - Controle do painel
   */
  function togglePanel() {
    ensureElements();
    if (!elements.panel) return;
    
    const isHidden = elements.panel.classList.contains('accessibility-panel-hidden');
    if (isHidden) {
      elements.panel.classList.remove('accessibility-panel-hidden');
      elements.panel.hidden = false;
      elements.panel.setAttribute('aria-hidden', 'false');
      elements.toggleBtn?.setAttribute('aria-expanded', 'true');
      announceToSR('Painel de acessibilidade aberto');
    } else {
      closePanel();
    }
  }

  function closePanel() {
    ensureElements();
    if (elements.panel) {
      elements.panel.classList.add('accessibility-panel-hidden');
      elements.panel.setAttribute('aria-hidden', 'true');
      elements.panel.hidden = true;
      elements.toggleBtn?.setAttribute('aria-expanded', 'false');
      announceToSR('Painel de acessibilidade fechado');
    }
  }

  function closeAllPanels() {
    closePanel();
    hideShortcuts();
    hideGlossary();
  }

  /**
   * Font Size Functions - Controle de tamanho da fonte
   */
  function increaseFontSize() {
    if (state.fontSize >= 3) {
      announceToSR('Tamanho máximo atingido');
      return;
    }
    state.fontSize++;
    const scale = 1 + (state.fontSize * 0.15);
    applyFontScale(scale);
    updateFontIndicators();
    announceToSR(`Tamanho da fonte aumentado para ${(scale * 100).toFixed(0)}%`);
  }

  function decreaseFontSize() {
    if (state.fontSize <= 0) {
      announceToSR('Tamanho mínimo atingido');
      return;
    }
    state.fontSize--;
    const scale = 1 + (state.fontSize * 0.15);
    applyFontScale(scale);
    updateFontIndicators();
    announceToSR(`Tamanho da fonte diminuído para ${(scale * 100).toFixed(0)}%`);
  }

  function resetFontSize() {
    state.fontSize = 0;
    applyFontScale(1);
    updateFontIndicators();
    announceToSR('Tamanho da fonte restaurado para 100%');
  }

  function applyFontScale(scale) {
    document.documentElement.style.setProperty('--font-scale', scale);
    document.body.setAttribute('data-font-scale', state.fontSize);
    
    // Sincronizar com HeaderModule se disponível
    if (window.HeaderModule) {
      window.HeaderModule.setFontSize(16 * scale);
    }
  }

  function updateFontIndicators() {
    const indicator = document.querySelector('.font-size-indicator');
    if (indicator) {
      const scale = 1 + (state.fontSize * 0.15);
      indicator.textContent = displayNames.fontSize[scale.toFixed(1)] || `${(scale * 100).toFixed(0)}%`;
    }
  }

  /**
   * Contrast Functions - Controle de contraste
   */
  function toggleContrast(mode) {
    const modes = ['inverted', 'dark-contrast', 'light-contrast'];
    
    // Remove all contrast classes
    modes.forEach(m => {
      document.body.classList.remove(m);
      // Remove active state from cards
      const card = document.querySelector(`[data-action="contrast"][data-param="${m}"]`);
      card?.classList.remove('active');
    });
    
    // Toggle the selected mode
    const isSameMode = state.contrast === modes.indexOf(mode);
    if (!isSameMode) {
      document.body.classList.add(mode);
      const card = document.querySelector(`[data-action="contrast"][data-param="${mode}"]`);
      card?.classList.add('active');
      state.contrast = modes.indexOf(mode);
      announceToSR(`Contraste: ${displayNames.contrast[mode] || mode}`);
    } else {
      state.contrast = 0;
      announceToSR('Contraste restaurado ao padrão');
    }
  }

  /**
   * Colorblind Functions - Filtros de daltonismo
   */
  function toggleColorblind(mode) {
    const modes = ['deuteranopia', 'protanopia', 'tritanopia'];
    
    modes.forEach(m => {
      document.body.classList.remove(m);
      const card = document.querySelector(`[data-action="colorblind"][data-param="${m}"]`);
      card?.classList.remove('active');
    });
    
    const isSameMode = state.colorblind === modes.indexOf(mode);
    if (!isSameMode) {
      document.body.classList.add(mode);
      const card = document.querySelector(`[data-action="colorblind"][data-param="${mode}"]`);
      card?.classList.add('active');
      state.colorblind = modes.indexOf(mode);
      announceToSR(`Filtro ${displayNames.colorblind[mode] || mode} ativado`);
    } else {
      state.colorblind = 0;
      announceToSR('Filtro de daltonismo desativado');
    }
  }

  /**
   * Saturation Functions - Controle de saturação
   */
  function toggleSaturation(mode) {
    const modes = ['saturation-low', 'saturation-high', 'monochrome'];
    
    modes.forEach(m => {
      document.body.classList.remove(m);
      const card = document.querySelector(`[data-action="saturation"][data-param="${m}"]`);
      card?.classList.remove('active');
    });
    
    const isSameMode = state.saturation === modes.indexOf(mode);
    if (!isSameMode) {
      document.body.classList.add(mode);
      const card = document.querySelector(`[data-action="saturation"][data-param="${mode}"]`);
      card?.classList.add('active');
      state.saturation = modes.indexOf(mode);
      const modeName = mode.replace('saturation-', '');
      announceToSR(`Saturação ${displayNames.saturation[modeName] || 'alterada'}`);
    } else {
      state.saturation = 0;
      announceToSR('Saturação restaurada ao normal');
    }
  }

  /**
   * Cursor Functions - Tamanho do cursor
   */
  function toggleBigCursor(size) {
    const sizes = ['medium', 'large', 'xlarge'];
    
    sizes.forEach(s => {
      document.body.classList.remove(`big-cursor-${s}`);
      const card = document.querySelector(`[data-action="cursor"][data-param="${s}"]`);
      card?.classList.remove('active');
    });
    
    const isSameSize = state.bigCursor === sizes.indexOf(size);
    if (!isSameSize) {
      document.body.classList.add(`big-cursor-${size}`);
      const card = document.querySelector(`[data-action="cursor"][data-param="${size}"]`);
      card?.classList.add('active');
      state.bigCursor = sizes.indexOf(size);
      announceToSR(`Cursor ${displayNames.bigCursor[size] || size} ativado`);
    } else {
      state.bigCursor = 0;
      announceToSR('Cursor restaurado ao normal');
    }
  }

  /**
   * Reading Mask Functions - Máscara de leitura
   */
  function toggleReadingMask(size) {
    const isSameSize = state.readingMask === size;
    
    if (isSameSize) {
      state.readingMask = 0;
      hideReadingMask();
      announceToSR('Máscara de leitura desativada');
    } else {
      state.readingMask = size;
      updateReadingMask();
      announceToSR(`Máscara de leitura ${displayNames.readingMask[size] || size} ativada`);
    }
  }

  function createReadingMask() {
    if (elements.readingMask) return;
    
    const mask = document.createElement('div');
    mask.id = 'reading-mask';
    mask.innerHTML = `
      <div id="reading-mask-top"></div>
      <div id="reading-mask-bottom"></div>
    `;
    mask.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9990;display:none';
    document.body.appendChild(mask);
    elements.readingMask = mask;
  }

  function updateReadingMask() {
    createReadingMask();
    if (!elements.readingMask) return;
    
    const sizes = { sm: 30, md: 50, lg: 70 };
    const top = document.getElementById('reading-mask-top');
    const bottom = document.getElementById('reading-mask-bottom');
    
    if (state.readingMask && sizes[state.readingMask]) {
      const height = sizes[state.readingMask] + '%';
      if (top) top.style.height = height;
      if (bottom) bottom.style.height = height;
      elements.readingMask.style.display = 'block';
    } else {
      elements.readingMask.style.display = 'none';
    }
  }

  function hideReadingMask() {
    if (elements.readingMask) {
      elements.readingMask.style.display = 'none';
    }
  }

  /**
   * Reading Guide Functions - Guia de leitura
   */
  function toggleReadingGuide(color) {
    const colors = ['azul', 'laranja', 'preto'];
    
    colors.forEach(c => {
      document.body.classList.remove(`reading-guide-${c}`);
      const card = document.querySelector(`[data-action="reading-guide"][data-param="${c}"]`);
      card?.classList.remove('active');
    });
    
    if (state.readingGuide !== color) {
      document.body.classList.add(`reading-guide-${color}`);
      state.readingGuide = color;
      
      if (!elements.readingGuide) {
        initReadingGuide();
      }
      
      if (elements.readingGuide) {
        elements.readingGuide.style.display = 'block';
        elements.readingGuide.className = `reading-guide guide-${color}`;
      }
      
      const card = document.querySelector(`[data-action="reading-guide"][data-param="${color}"]`);
      card?.classList.add('active');
      announceToSR(`Guia de leitura ${displayNames.readingGuide[color] || color} ativada`);
    } else {
      state.readingGuide = 0;
      if (elements.readingGuide) {
        elements.readingGuide.style.display = 'none';
      }
      announceToSR('Guia de leitura desativada');
    }
  }

  function initReadingGuide() {
    const guide = document.createElement('div');
    guide.id = 'reading-guide';
    guide.style.cssText = 'position:fixed;left:0;width:100%;height:3px;z-index:9990;pointer-events:none;display:none;box-shadow:0 0 10px currentColor';
    document.body.appendChild(guide);
    elements.readingGuide = guide;
    
    readingGuideHandler = function(e) {
      if (state.readingGuide) {
        guide.style.top = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', readingGuideHandler);
  }

  /**
   * Reading Mode Functions - Modo de leitura
   */
  function toggleReadingMode() {
    document.body.classList.toggle('reading-mode');
    state.readingMode = document.body.classList.contains('reading-mode');
    announceToSR(`Modo de leitura ${state.readingMode ? 'ativado' : 'desativado'}`);
  }

  /**
   * Highlight Functions - Destaques visuais
   */
  function toggleHighlightLinks() {
    document.body.classList.toggle('highlight-links');
    state.highlightLinks = document.body.classList.contains('highlight-links');
    
    const card = document.querySelector('[data-action="highlight-links"]');
    card?.classList.toggle('active', state.highlightLinks);
    announceToSR(`Destaque em links ${state.highlightLinks ? 'ativado' : 'desativado'}`);
  }

  function toggleHighlightHeaders() {
    document.body.classList.toggle('highlight-headers');
    state.highlightHeaders = document.body.classList.contains('highlight-headers');
    
    const card = document.querySelector('[data-action="highlight-headers"]');
    card?.classList.toggle('active', state.highlightHeaders);
    announceToSR(`Destaque em títulos ${state.highlightHeaders ? 'ativado' : 'desativado'}`);
  }

  /**
   * Text Style Functions - Estilos de texto
   */
  function toggleBoldText() {
    document.body.classList.toggle('bold-text');
    state.boldText = document.body.classList.contains('bold-text');
    
    const card = document.querySelector('[data-action="bold-text"]');
    card?.classList.toggle('active', state.boldText);
    announceToSR(`Texto em negrito ${state.boldText ? 'ativado' : 'desativado'}`);
  }

  function toggleStopAnimations() {
    document.body.classList.toggle('stop-anim');
    state.stopAnim = document.body.classList.contains('stop-anim');
    
    const card = document.querySelector('[data-action="stop-anim"]');
    card?.classList.toggle('active', state.stopAnim);
    announceToSR(`Animações ${state.stopAnim ? 'pausadas' : 'ativas'}`);
  }

  function toggleHideImages() {
    document.body.classList.toggle('hide-images');
    state.hideImages = document.body.classList.contains('hide-images');
    
    const card = document.querySelector('[data-action="hide-images"]');
    card?.classList.toggle('active', state.hideImages);
    announceToSR(`Imagens ${state.hideImages ? 'ocultas' : 'visíveis'}`);
  }

  /**
   * Font Style Functions - Estilos de fonte
   */
  function toggleFontStyle(style) {
    const styles = ['font-atkinson', 'font-newsreader', 'font-opendyslexic'];
    
    styles.forEach(s => {
      document.body.classList.remove(s);
      const card = document.querySelector(`[data-action="font-style"][data-param="${s.replace('font-', '')}"]`);
      card?.classList.remove('active');
    });
    
    if (state.fontStyle !== style) {
      document.body.classList.add(style);
      state.fontStyle = style;
      
      const card = document.querySelector(`[data-action="font-style"][data-param="${style.replace('font-', '')}"]`);
      card?.classList.add('active');
      announceToSR(`Fonte alterada para ${displayNames.fontStyle[style.replace('font-', '')] || style}`);
    } else {
      state.fontStyle = 0;
      announceToSR('Fonte restaurada ao padrão');
    }
  }

  /**
   * Reset Functions - Restauração de padrões
   */
  function resetAllSettings() {
    // Remove all body classes
    allClasses.forEach(cls => document.body.classList.remove(cls));
    
    // Reset state
    state.fontSize = 0;
    state.fontStyle = 0;
    state.contrast = 0;
    state.colorblind = 0;
    state.saturation = 0;
    state.bigCursor = 0;
    state.readingMask = 0;
    state.readingGuide = 0;
    state.highlightLinks = false;
    state.highlightHeaders = false;
    state.boldText = false;
    state.stopAnim = false;
    state.hideImages = false;
    state.readingMode = false;
    
    // Reset styles
    document.documentElement.style.setProperty('--font-scale', '1');
    document.body.setAttribute('data-font-scale', '0');
    
    // Reset UI elements
    updateFontIndicators();
    updateReadingMask();
    hideReadingMask();
    if (elements.readingGuide) {
      elements.readingGuide.style.display = 'none';
    }
    
    // Reset theme to system
    ThemeManager.resetToSystem();
    
    // Remove active states from cards
    document.querySelectorAll('.accessibility-card.active').forEach(card => {
      card.classList.remove('active');
    });
    
    announceToSR('Todas as configurações de acessibilidade foram restauradas');
  }

  /**
   * Shortcuts Modal Functions
   */
  function showShortcuts() {
    ensureElements();
    if (!elements.shortcutsModal) return;
    
    elements.shortcutsModal.hidden = false;
    renderShortcuts();
    announceToSR('Atalhos de teclado mostrados');
  }

  function hideShortcuts() {
    ensureElements();
    if (elements.shortcutsModal) {
      elements.shortcutsModal.hidden = true;
    }
  }

  function renderShortcuts() {
    if (!elements.shortcutsList) return;
    
    const browser = getBrowser();
    const shortcuts = shortcutsByBrowser[browser] || shortcutsByBrowser.chrome;
    
    elements.shortcutsList.innerHTML = shortcuts.map(shortcut => `
      <div class="shortcut-item">
        <kbd>${shortcut.keys.join(' + ')}</kbd>
        <span>${shortcut.desc}</span>
      </div>
    `).join('');
  }

  /**
   * Glossary Modal Functions
   */
  function showGlossary() {
    ensureElements();
    if (!elements.glossaryModal) return;
    
    elements.glossaryModal.hidden = false;
    renderGlossary();
    announceToSR('Dicionário de termos aberto');
  }

  function hideGlossary() {
    ensureElements();
    if (elements.glossaryModal) {
      elements.glossaryModal.hidden = true;
    }
  }

  function renderGlossary(letter = 'all', searchTerm = '') {
    if (!elements.glossaryList) return;
    
    let terms = glossaryData;
    
    // Filter by letter
    if (letter !== 'all') {
      terms = terms.filter(term => term.term.toUpperCase().startsWith(letter));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      terms = terms.filter(t => 
        t.term.toLowerCase().includes(term) || 
        t.definition.toLowerCase().includes(term)
      );
    }
    
    // Render
    if (terms.length === 0) {
      elements.glossaryList.innerHTML = '';
      const emptyEl = document.getElementById('glossary-empty');
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      const emptyEl = document.getElementById('glossary-empty');
      if (emptyEl) emptyEl.style.display = 'none';
      
      elements.glossaryList.innerHTML = terms.map(item => `
        <li class="glossary-item" data-term="${sanitizeHTML(item.term)}">
          <div class="glossary-term">${sanitizeHTML(item.term)}</div>
          <div class="glossary-definition">${sanitizeHTML(item.definition)}</div>
        </li>
      `).join('');
    }
  }

  function filterGlossary(letter) {
    // Update active state
    document.querySelectorAll('.alphabet-letter').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    const activeBtn = document.querySelector(`.alphabet-letter[data-letter="${letter}"]`);
    activeBtn?.classList.add('active');
    activeBtn?.setAttribute('aria-selected', 'true');
    
    const searchTerm = elements.glossarySearch?.value || '';
    renderGlossary(letter, searchTerm);
  }

  /**
   * Keyboard Handler - Atalhos globais
   */
  function handleKeyboard(e) {
    // Don't interfere with form inputs
    if (e.target.matches('input, textarea, [contenteditable]')) return;
    
    const browser = getBrowser();
    const shortcuts = shortcutsByBrowser[browser] || shortcutsByBrowser.chrome;
    
    for (const shortcut of shortcuts) {
      const keysPressed = [];
      if (e.altKey) keysPressed.push('Alt');
      if (e.ctrlKey) keysPressed.push('Ctrl');
      if (e.shiftKey) keysPressed.push('Shift');
      
      const requiredKeys = shortcut.keys.filter(k => k !== 'Alt' && k !== 'Ctrl' && k !== 'Shift');
      const extraKeys = shortcut.keys.filter(k => k === 'Alt' || k === 'Ctrl' || k === 'Shift');
      
      const allRequiredPressed = requiredKeys.every(k => keysPressed.includes(k));
      const modifiersMatch = extraKeys.every(k => keysPressed.includes(k));
      
      if (allRequiredPressed && modifiersMatch && requiredKeys.length > 0) {
        e.preventDefault();
        executeAction(shortcut.action);
        return;
      }
    }
  }

  function executeAction(action) {
    switch (action) {
      case 'togglePanel':
        togglePanel();
        break;
      case 'increaseFont':
        increaseFontSize();
        break;
      case 'decreaseFont':
        decreaseFontSize();
        break;
      case 'toggleContrast':
        toggleContrast('dark-contrast');
        break;
      case 'toggleLinks':
        toggleHighlightLinks();
        break;
      case 'toggleHeaders':
        toggleHighlightHeaders();
        break;
      case 'toggleMask':
        toggleReadingMask('md');
        break;
      case 'toggleGuide':
        toggleReadingGuide('azul');
        break;
      case 'toggleReading':
        toggleReadingMode();
        break;
      case 'toggleTheme':
        ThemeManager.toggle();
        break;
      case 'toggleImages':
        toggleHideImages();
        break;
      case 'reset':
        resetAllSettings();
        break;
      case 'closeAll':
        closeAllPanels();
        break;
    }
  }

  /**
   * Event Bindings - Configuração de event listeners
   */
  function bindEvents() {
    ensureElements();
    
    // Main panel controls
    elements.toggleBtn?.addEventListener('click', togglePanel);
    elements.closeBtn?.addEventListener('click', closePanel);
    elements.restoreBtn?.addEventListener('click', resetAllSettings);
    
    // Font buttons in header
    elements.fontIncrease?.addEventListener('click', increaseFontSize);
    elements.fontDecrease?.addEventListener('click', decreaseFontSize);
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', () => {
      ThemeManager.toggle();
    });
    
    // Data-action buttons (accessibility cards)
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const param = this.getAttribute('data-param');
        
        switch (action) {
          case 'font-size':
            if (param === 'increase') increaseFontSize();
            else if (param === 'decrease') decreaseFontSize();
            else if (param === 'reset') resetFontSize();
            break;
          case 'contrast':
            toggleContrast(param);
            break;
          case 'colorblind':
            toggleColorblind(param);
            break;
          case 'saturation':
            toggleSaturation(param);
            break;
          case 'cursor':
            toggleBigCursor(param);
            break;
          case 'reading-mask':
            toggleReadingMask(param);
            break;
          case 'reading-guide':
            toggleReadingGuide(param);
            break;
          case 'reading-mode':
            toggleReadingMode();
            break;
          case 'highlight-links':
            toggleHighlightLinks();
            break;
          case 'highlight-headers':
            toggleHighlightHeaders();
            break;
          case 'bold-text':
            toggleBoldText();
            break;
          case 'stop-anim':
            toggleStopAnimations();
            break;
          case 'hide-images':
            toggleHideImages();
            break;
          case 'font-style':
            toggleFontStyle(param);
            break;
        }
      });
    });
    
    // Modals
    elements.shortcutsBtn?.addEventListener('click', showShortcuts);
    document.getElementById('shortcuts-close')?.addEventListener('click', hideShortcuts);
    elements.glossaryBtn?.addEventListener('click', showGlossary);
    
    // Browser tabs in shortcuts modal
    document.querySelectorAll('.browser-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.browser-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        renderShortcuts();
      });
    });
    
    // Alphabet navigation in glossary
    document.querySelectorAll('.alphabet-letter').forEach(letter => {
      letter.addEventListener('click', function() {
        filterGlossary(this.getAttribute('data-letter'));
      });
    });
    
    // Alphabet toggle
    elements.alphabetToggle?.addEventListener('click', function() {
      const alphabet = document.querySelector('.glossary-alphabet');
      alphabet?.classList.toggle('collapsed');
      const isCollapsed = alphabet?.classList.contains('collapsed');
      this.setAttribute('aria-expanded', !isCollapsed);
    });
    
    // Glossary search
    elements.glossarySearch?.addEventListener('input', debounce(function() {
      const activeLetter = document.querySelector('.alphabet-letter.active');
      const letter = activeLetter?.getAttribute('data-letter') || 'all';
      renderGlossary(letter, this.value);
    }, 200));
    
    // Close modals on backdrop click
    elements.shortcutsModal?.addEventListener('click', function(e) {
      if (e.target === this) hideShortcuts();
    });
    elements.glossaryModal?.addEventListener('click', function(e) {
      if (e.target === this) hideGlossary();
    });
    
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllPanels();
      }
    });
    
    // Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  /**
   * Initialize - Inicialização do módulo
   */
  function init() {
    if (state._initialized) {
      console.log('[AccessControl] Módulo já inicializado');
      return;
    }
    
    ensureElements();
    bindEvents();
    ThemeManager.init();
    
    // Load saved state if needed
    loadSavedState();
    
    state._initialized = true;
    console.log('[AccessControl] Módulo de acessibilidade inicializado');
  }

  /**
   * Save/Load State - Persistência de configurações
   */
  function saveState() {
    try {
      localStorage.setItem('accessibility_state', JSON.stringify(state));
    } catch (e) {
      console.warn('[AccessControl] Erro ao salvar estado:', e);
    }
  }

  function loadSavedState() {
    try {
      const saved = localStorage.getItem('accessibility_state');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(state, data);
        // Apply saved font size
        if (state.fontSize > 0) {
          const scale = 1 + (state.fontSize * 0.15);
          applyFontScale(scale);
        }
      }
    } catch (e) {
      console.warn('[AccessControl] Erro ao carregar estado:', e);
    }
  }

  /**
   * Glossary Data - Termos do glossário
   */
  function loadGlossaryData() {
    glossaryData = [
      { term: 'Acidose', definition: 'Condição caracterizada pelo aumento da concentração de íons hidrogênio no sangue, resultando em pH arterial inferior a 7,35.' },
      { term: 'Agudo', definition: 'Condição de início súbito e geralmente curta duração, com sintomas intensos.' },
      { term: 'Alcalose', definition: 'Distúrbio metabólico caracterizado pela diminuição de íons hidrogênio no sangue, com pH arterial superior a 7,45.' },
      { term: 'Anamnese', definition: 'Conjunto de informações obtidas através de entrevista com o paciente, incluindo histórico médico e queixas atuais.' },
      { term: 'Anúria', definition: 'Cessação completa da produção de urina, geralmente definida como menos de 100ml em 24 horas.' },
      { term: 'Bradicardia', definition: 'Frequência cardíaca anormalmente lenta, geralmente inferior a 60 batimentos por minuto em adultos.' },
      { term: 'Bradipneia', definition: 'Respiração anormalmente lenta, com frequência respiratória inferior a 12 incursões por minuto.' },
      { term: 'Cianose', definition: 'Coloração azulada ou púrpura da pele e mucosas, causada pela desoxigenação do sangue ou hemoglobina anormal.' },
      { term: 'Diurese', definition: 'Produção e eliminação de urina pelos rins. Pode ser influenciada por medicamentos diuréticos.' },
      { term: 'Dispneia', definition: 'Sensação subjetiva de falta de ar ou dificuldade respiratória.' },
      { term: 'Edema', definition: 'Acúmulo anormal de líquido no espaço intersticial, causando inchaço nos tecidos.' },
      { term: 'Eritrócito', definition: 'Célula sanguínea vermelha, também chamada de hemácia ou glóbulo vermelho, responsável pelo transporte de oxigênio.' },
      { term: 'Febre', definition: 'Elevação da temperatura corporal acima do normal, geralmente acima de 37,8°C.' },
      { term: 'Glicemia', definition: 'Concentração de glicose no sangue, importante indicador metabólico.' },
      { term: 'Hematócrito', definition: 'Percentual do volume sanguíneo ocupado pelos eritrócitos.' },
      { term: 'Hemoglobina', definition: 'Proteína presente nos eritrócitos responsável pelo transporte de oxigênio.' },
      { term: 'Hipertensão', definition: 'Pressão arterial elevada, geralmente acima de 140/90 mmHg.' },
      { term: 'Hipotensão', definition: 'Pressão arterial anormalmente baixa, geralmente inferior a 90/60 mmHg.' },
      { term: 'Hipóxia', definition: 'Deficiência de oxigênio nos tecidos do organismo.' },
      { term: 'Infusão', definition: 'Administração lenta de líquidos ou medicamentos diretamente na corrente sanguínea.' },
      { term: 'Leucócito', definition: 'Célula sanguínea branca, parte fundamental do sistema imunológico.' },
      { term: 'Monitorização', definition: 'Observação contínua ou periódica de parâmetros fisiológicos do paciente.' },
      { term: 'Nefro', definition: 'Prefixo relacionado aos rins. Ex: nefrologia, nefrotoxicidade.' },
      { term: 'Nível de Consciência', definition: 'Grau de alerta e responsividade do paciente, avaliado através de escalas padronizadas.' },
      { term: 'Oligúria', definition: 'Redução da produção de urina, geralmente definida como menos de 400ml em 24 horas.' },
      { term: 'Oxigenação', definition: 'Processo de saturação do sangue com oxigênio.' },
      { term: 'PA', definition: 'Pressão Arterial - força exercida pelo sangue contra as paredes das artérias.' },
      { term: 'Plaquetas', definition: 'Fragmentos celulares envolvidos na coagulação sanguínea.' },
      { term: 'Polarização', definition: 'Estado de repouso elétrico de células excitáveis como neurônios e células musculares.' },
      { term: 'Proteinúria', definition: 'Presença de proteína na urina, indicativo de disfunção renal.' },
      { term: 'Pulso', definition: 'Expansão e retração rítmica das artérias, sincronizada com os batimentos cardíacos.' },
      { term: 'Retenção', definition: 'Acúmulo de substâncias no organismo devido à incapacidade de eliminá-las adequadamente.' },
      { term: 'SatO2', definition: 'Saturação de Oxigênio - percentagem de hemoglobina ligada ao oxigênio no sangue.' },
      { term: 'Sinais Vitais', definition: 'Parâmetros fisiológicos básicos: pressão arterial, frequência cardíaca, frequência respiratória e temperatura.' },
      { term: 'Taquicardia', definition: 'Frequência cardíaca acelerada, geralmente superior a 100 batimentos por minuto em adultos.' },
      { term: 'Taquipneia', definition: 'Respiração anormalmente acelerada, com frequência superior a 20 incursões por minuto.' },
      { term: 'Tônus', definition: 'Estado de tensão ou elasticidade residual em músculos ou tecidos.' },
      { term: 'Valsalva', definition: 'Maneuver de expiração forçada com glote fechada, aumenta a pressão intratorácica.' }
    ];
  }

  /**
   * Public API - Expõe funcionalidades para outros módulos
   */
  window.AccessControl = {
    init,
    state,
    ThemeManager,
    
    // Panel controls
    togglePanel,
    closePanel,
    closeAllPanels,
    
    // Font controls
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    
    // Theme controls
    toggleTheme: () => ThemeManager.toggle(),
    setTheme: (theme) => ThemeManager.applyTheme(theme),
    getTheme: () => ThemeManager.getTheme(),
    
    // Accessibility features
    toggleContrast,
    toggleColorblind,
    toggleSaturation,
    toggleBigCursor,
    toggleReadingMask,
    toggleReadingGuide,
    toggleReadingMode,
    toggleHighlightLinks,
    toggleHighlightHeaders,
    toggleBoldText,
    toggleStopAnimations,
    toggleHideImages,
    toggleFontStyle,
    
    // Modals
    showShortcuts,
    hideShortcuts,
    showGlossary,
    hideGlossary,
    
    // Reset
    resetAllSettings,
    
    // Utilities
    announceToSR,
    isLoaded: () => state._initialized
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadGlossaryData();
      init();
    });
  } else {
    loadGlossaryData();
    init();
  }

})(window, document);
