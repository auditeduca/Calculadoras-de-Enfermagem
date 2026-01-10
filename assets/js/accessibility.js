/**
 * ACCESSIBILITY.JS
 * Módulo Master de Controle de Acessibilidade
 * Calculadoras de Enfermagem
 * 
 * Este é o módulo MASTER - Single Source of Truth (SSOT)
 * Gerencia todo o estado, localStorage, UI e funcionalidades do sistema.
 * Todos os outros módulos (header.js, footer.js, main-index.js) delegam para este módulo.
 * 
 * PRINCÍPIO FUNDAMENTAL: A estrutura padrão (HTML, CSS, JS) prevalece até que
 * o usuário ative explicitamente um recurso assistivo. Apenas ações do usuário
 * podem modificar o estado visual e funcional do sistema.
 */

(function(window, document) {
  'use strict';

  // ============================================
  // CONFIGURAÇÕES E CONSTANTES
  // ============================================
  const Config = {
    // Chave unificada do localStorage (SSOT)
    storageKey: 'nursing_accessibility_state',
    themeStorageKey: 'nursing_accessibility_theme',
    
    // Chaves de consentimento de cookies
    cookieConsentKey: 'ce_cookie_consent_v8_2025',
    cookieFabKey: 'ce_cookie_fab_enabled',
    
    // Níveis de fonte (especificados pelo usuário)
    // Botão Reduzir: 150% → 120% → 100%
    // Botão Aumentar: 120% → 150% → 200%
    fontSizeLevels: [16, 19.2, 24], // 100%, 120%, 150%
    fontSizeIncreaseLevels: [19.2, 24, 32], // 120%, 150%, 200%
    
    // Labels para os níveis
    fontSizeLabels: ['100%', '120%', '150%'],
    fontIncreaseLabels: ['120%', '150%', '200%'],
    
    // Configurações de tema
    themeOptions: ['light', 'dark', 'system'],
    
    // Breakpoints
    megaMenuBreakpoint: 1024
  };

  // ============================================
  // STATE MANAGEMENT (SSOT)
  // ============================================
  const state = {
    // Estado da fonte (índice 0 = 100%, 1 = 120%, 2 = 150%)
    // Valor 0 = padrão, não modifica nada até que usuário ative
    fontSizeIndex: 0,
    fontIncreaseIndex: 0,
    
    // Estado do tema
    theme: 'system',
    
    // Estado dos recursos de acessibilidade
    // 0/false = recurso desativado (padrão)
    contrast: 0,
    colorblind: 0,
    saturation: 0,
    bigCursor: 0,
    readingMask: 0,
    readingGuide: 0,
    highlightLinks: false,
    highlightHeaders: false,
    boldText: false,
    stopAnim: false,
    hideImages: false,
    readingMode: false,
    fontStyle: 0,
    
    // Estado do painel de UI
    panelOpen: false,
    
    // Estado interno
    _initialized: false
  };

  // ============================================
  // GLOSSARY DATA - Termos de Enfermagem
  // ============================================
  const glossaryData = [
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

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
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

  // ============================================
  // UTILITÁRIOS
  // ============================================
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function getElement(id) {
    return document.getElementById(id) || null;
  }

  function announceToScreenReader(message) {
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
    setTimeout(function() {
      announcer.textContent = message;
    }, 100);
  }

  function isDesktop() {
    return window.matchMedia('(min-width: ' + (Config.megaMenuBreakpoint + 1) + 'px)').matches;
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
    return 'chrome';
  }

  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  }

  // ============================================
  // PERSISTÊNCIA DE DADOS (SSOT)
  // ============================================
  function saveState() {
    try {
      localStorage.setItem(Config.storageKey, JSON.stringify({
        fontSizeIndex: state.fontSizeIndex,
        fontIncreaseIndex: state.fontIncreaseIndex,
        theme: state.theme,
        contrast: state.contrast,
        colorblind: state.colorblind,
        saturation: state.saturation,
        bigCursor: state.bigCursor,
        readingMask: state.readingMask,
        readingGuide: state.readingGuide,
        highlightLinks: state.highlightLinks,
        highlightHeaders: state.highlightHeaders,
        boldText: state.boldText,
        stopAnim: state.stopAnim,
        hideImages: state.hideImages,
        readingMode: state.readingMode,
        fontStyle: state.fontStyle
      }));
    } catch (e) {
      console.warn('[AccessControl] Erro ao salvar estado:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(Config.storageKey);
      if (saved) {
        var data = JSON.parse(saved);
        Object.assign(state, data);
        return true;
      }
    } catch (e) {
      console.warn('[AccessControl] Erro ao carregar estado:', e);
    }
    return false;
  }

  // ============================================
  // THEMEMANAGER (SSOT)
  // ============================================
  var ThemeManager = {
    detectSystemTheme: function() {
      var matchMedia = window.matchMedia;
      if (matchMedia) {
        return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    },

    getTheme: function() {
      var saved = localStorage.getItem(Config.themeStorageKey);
      return saved || 'system';
    },

    applyTheme: function(theme) {
      state.theme = theme;
      var isDark = theme === 'dark' || (theme === 'system' && this.detectSystemTheme() === 'dark');
      
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      
      localStorage.setItem(Config.themeStorageKey, theme);
      
      // Disparar evento para outros módulos
      var event = new CustomEvent('theme:changed', {
        detail: { theme: theme, isDark: isDark }
      });
      window.dispatchEvent(event);
    },

    toggle: function() {
      var current = this.getTheme();
      var next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      return next;
    },

    isDarkMode: function() {
      return document.body.classList.contains('dark-theme');
    },

    init: function() {
      var mediaQuery = null;
      var self = this;
      
      this.applyTheme(this.getTheme());
      
      // Escutar mudanças no tema do sistema
      var matchMedia = window.matchMedia;
      if (matchMedia) {
        mediaQuery = matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', function() {
            if (self.getTheme() === 'system') {
              self.applyTheme('system');
            }
          });
        } else if (mediaQuery.addListener) {
          // Fallback para navegadores mais antigos
          mediaQuery.addListener(function() {
            if (self.getTheme() === 'system') {
              self.applyTheme('system');
            }
          });
        }
      }

      // Disparar evento de prontidão
      window.dispatchEvent(new CustomEvent('ThemeManager:Ready'));
    }
  };

  // ============================================
  // CONTROLE DE CONSENTIMENTO DE COOKIES (SSOT)
  // ============================================
  var CookieConsentManager = {
    saveConsent: function(preferences) {
      try {
        localStorage.setItem(Config.cookieConsentKey, JSON.stringify(preferences));
        
        window.dispatchEvent(new CustomEvent('CookieConsent:Saved', {
          detail: { preferences: preferences }
        }));
        
        return true;
      } catch (e) {
        console.warn('[CookieConsent] Erro ao salvar consentimento:', e);
        return false;
      }
    },
    
    getConsent: function() {
      try {
        var saved = localStorage.getItem(Config.cookieConsentKey);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('[CookieConsent] Erro ao obter consentimento:', e);
      }
      return null;
    },
    
    hasConsent: function() {
      return this.getConsent() !== null;
    },
    
    clearConsent: function() {
      try {
        localStorage.removeItem(Config.cookieConsentKey);
        
        window.dispatchEvent(new CustomEvent('CookieConsent:Cleared'));
        
        return true;
      } catch (e) {
        console.warn('[CookieConsent] Erro ao limpar consentimento:', e);
        return false;
      }
    },
    
    applyConsent: function() {
      var consent = this.getConsent();
      
      if (consent) {
        window.dispatchEvent(new CustomEvent('CookieConsent:Applied', {
          detail: { preferences: consent }
        }));
        
        return consent;
      }
      
      return null;
    }
  };

  // ============================================
  // CONTROLE DO FAB DE COOKIES (SSOT)
  // ============================================
  function saveFabPreference(enabled) {
    try {
      localStorage.setItem(Config.cookieFabKey, JSON.stringify(enabled));
      
      window.dispatchEvent(new CustomEvent('CookieFab:PreferenceChanged', {
        detail: { enabled: enabled }
      }));
      
      return true;
    } catch (e) {
      console.warn('[CookieFab] Erro ao salvar preferência:', e);
      return false;
    }
  }
  
  function getFabPreference() {
    try {
      var saved = localStorage.getItem(Config.cookieFabKey);
      return saved !== null ? JSON.parse(saved) : true; // Padrão: visível
    } catch (e) {
      return true;
    }
  }
  
  function clearFabPreference() {
    try {
      localStorage.removeItem(Config.cookieFabKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // ============================================
  // CONTROLE DE FONTE (SSOT)
  // ============================================
  function resetFontVariables() {
    document.documentElement.style.fontSize = '';
    document.documentElement.style.setProperty('--font-size-base', '');
    document.documentElement.style.setProperty('--font-scale', '');
    document.body.removeAttribute('data-font-scale');
    document.body.removeAttribute('data-font-size-index');
    document.body.removeAttribute('data-font-size-increase-index');
  }

  function applyFontSize(index) {
    if (index < 0 || index >= Config.fontSizeLevels.length) {
      index = 0;
    }
    
    state.fontSizeIndex = index;
    var fontSize = Config.fontSizeLevels[index];
    
    document.documentElement.style.fontSize = fontSize + 'px';
    document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');
    
    var scale = fontSize / 16;
    document.documentElement.style.setProperty('--font-scale', scale.toString());
    
    document.body.setAttribute('data-font-scale', scale.toString());
    document.body.setAttribute('data-font-size-index', index.toString());
    
    saveState();
    
    var label = Config.fontSizeLabels[index] || '100%';
    announceToScreenReader('Tamanho da fonte reduzido para ' + label);
  }

  function applyFontSizeIncrease(index) {
    if (index < 0 || index >= Config.fontSizeIncreaseLevels.length) {
      index = 0;
    }
    
    state.fontIncreaseIndex = index;
    var fontSize = Config.fontSizeIncreaseLevels[index];
    
    document.documentElement.style.fontSize = fontSize + 'px';
    document.documentElement.style.setProperty('--font-size-base', fontSize + 'px');
    
    var scale = fontSize / 16;
    document.documentElement.style.setProperty('--font-scale', scale.toString());
    
    document.body.setAttribute('data-font-scale', scale.toString());
    document.body.setAttribute('data-font-size-increase-index', index.toString());
    
    saveState();
    
    var label = Config.fontIncreaseLabels[index] || '100%';
    announceToScreenReader('Tamanho da fonte aumentado para ' + label);
  }

  function decreaseFontSize() {
    var newIndex = state.fontSizeIndex - 1;
    
    if (newIndex < 0) {
      newIndex = Config.fontSizeLevels.length - 1;
    }
    
    applyFontSize(newIndex);
    updateHeaderFontButtons();
  }

  function increaseFontSize() {
    var newIndex = state.fontSizeIndex + 1;
    
    if (newIndex >= Config.fontSizeLevels.length) {
      newIndex = 0;
    }
    
    applyFontSize(newIndex);
    updateHeaderFontButtons();
  }

  function increaseFontSizeFromButton() {
    var newIndex = state.fontIncreaseIndex + 1;
    
    if (newIndex >= Config.fontSizeIncreaseLevels.length) {
      newIndex = 0;
    }
    
    applyFontSizeIncrease(newIndex);
    updateHeaderFontButtons();
  }

  function decreaseFontSizeFromButton() {
    var newIndex = state.fontIncreaseIndex - 1;
    
    if (newIndex < 0) {
      newIndex = Config.fontSizeIncreaseLevels.length - 1;
    }
    
    applyFontSizeIncrease(newIndex);
    updateHeaderFontButtons();
  }

  function updateHeaderFontButtons() {
    var reduceBtn = getElement('font-reduce');
    var mobileReduceBtn = getElement('mobile-font-reduce');
    
    if (reduceBtn) {
      var prevIndex = state.fontSizeIndex - 1;
      var prevLabel;
      if (prevIndex < 0) {
        prevLabel = Config.fontSizeLabels[Config.fontSizeLabels.length - 1];
      } else {
        prevLabel = Config.fontSizeLabels[prevIndex];
      }
      reduceBtn.title = 'Reduzir fonte para ' + prevLabel;
      reduceBtn.classList.toggle('at-min-level', state.fontSizeIndex === 0);
    }
    
    if (mobileReduceBtn) {
      mobileReduceBtn.title = 'Reduzir fonte para ' + (Config.fontSizeLabels[state.fontSizeIndex] || '100%');
    }
    
    var increaseBtn = getElement('font-increase');
    var mobileIncreaseBtn = getElement('mobile-font-increase');
    
    if (increaseBtn) {
      var nextIndex = (state.fontIncreaseIndex + 1) % Config.fontSizeIncreaseLevels.length;
      var nextLabel = Config.fontIncreaseLabels[nextIndex];
      increaseBtn.title = 'Aumentar fonte para ' + nextLabel;
      increaseBtn.classList.toggle('at-max-level', state.fontIncreaseIndex === Config.fontSizeIncreaseLevels.length - 1);
    }
    
    if (mobileIncreaseBtn) {
      mobileIncreaseBtn.title = 'Aumentar fonte para ' + (Config.fontIncreaseLabels[state.fontIncreaseIndex] || '120%');
    }
  }

  function resetFontSize() {
    state.fontSizeIndex = 0;
    state.fontIncreaseIndex = 0;
    
    resetFontVariables();
    
    saveState();
    
    announceToScreenReader('Tamanho da fonte restaurado ao padrão');
    
    updateHeaderFontButtons();
  }

  // ============================================
  // CONTRASTE E ACESSIBILIDADE
  // ============================================
  var allClasses = [
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

  function resetAllAccessibilityFeatures() {
    var i, len;
    
    document.body.classList.remove('inverted', 'dark-contrast', 'light-contrast');
    document.body.classList.remove('deuteranopia', 'protanopia', 'tritanopia');
    document.body.classList.remove('highlight-links', 'highlight-headers', 'bold-text');
    document.body.classList.remove('stop-anim', 'hide-images', 'reading-mode');
    
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
    state.fontStyle = 0;
    
    resetFontVariables();
    state.fontSizeIndex = 0;
    state.fontIncreaseIndex = 0;
    
    saveState();
    
    announceToScreenReader('Todas as configurações de acessibilidade restauradas ao padrão');
  }

  function deactivateAllCards() {
    var cards = document.querySelectorAll('[data-action][data-param]');
    var i, len = cards.length;
    for (i = 0; i < len; i++) {
      cards[i].classList.remove('active');
    }
  }

  function toggleContrast(mode) {
    var modes = ['inverted', 'dark-contrast', 'light-contrast'];
    var i, len = modes.length;
    
    for (i = 0; i < len; i++) {
      document.body.classList.remove(modes[i]);
    }
    
    deactivateAllCards();
    
    var isSameMode = state.contrast === modes.indexOf(mode);
    if (!isSameMode) {
      document.body.classList.add(mode);
      var card = document.querySelector('[data-action="contrast"][data-param="' + mode + '"]');
      if (card) {
        card.classList.add('active');
      }
      state.contrast = modes.indexOf(mode);
      announceToScreenReader('Contraste ' + mode + ' ativado');
    } else {
      state.contrast = 0;
      announceToScreenReader('Contraste restaurado ao padrão');
    }
    saveState();
  }

  function toggleColorblind(mode) {
    var modes = ['deuteranopia', 'protanopia', 'tritanopia'];
    var i, len = modes.length;
    
    for (i = 0; i < len; i++) {
      document.body.classList.remove(modes[i]);
    }
    
    deactivateAllCards();
    
    var isSameMode = state.colorblind === modes.indexOf(mode);
    if (!isSameMode) {
      document.body.classList.add(mode);
      var card = document.querySelector('[data-action="colorblind"][data-param="' + mode + '"]');
      if (card) {
        card.classList.add('active');
      }
      state.colorblind = modes.indexOf(mode);
      announceToScreenReader('Filtro ' + mode + ' ativado');
    } else {
      state.colorblind = 0;
      announceToScreenReader('Filtro de daltonismo desativado');
    }
    saveState();
  }

  function toggleHighlightLinks() {
    state.highlightLinks = !state.highlightLinks;
    
    if (state.highlightLinks) {
      document.body.classList.add('highlight-links');
    } else {
      document.body.classList.remove('highlight-links');
    }
    
    var card = document.querySelector('[data-action="highlight-links"]');
    if (card) {
      card.classList.toggle('active', state.highlightLinks);
    }
    
    announceToScreenReader('Destaque em links ' + (state.highlightLinks ? 'ativado' : 'desativado'));
    saveState();
  }

  function toggleHighlightHeaders() {
    state.highlightHeaders = !state.highlightHeaders;
    
    if (state.highlightHeaders) {
      document.body.classList.add('highlight-headers');
    } else {
      document.body.classList.remove('highlight-headers');
    }
    
    var card = document.querySelector('[data-action="highlight-headers"]');
    if (card) {
      card.classList.toggle('active', state.highlightHeaders);
    }
    
    announceToScreenReader('Destaque em títulos ' + (state.highlightHeaders ? 'ativado' : 'desativado'));
    saveState();
  }

  function toggleBoldText() {
    state.boldText = !state.boldText;
    
    if (state.boldText) {
      document.body.classList.add('bold-text');
    } else {
      document.body.classList.remove('bold-text');
    }
    
    var card = document.querySelector('[data-action="bold-text"]');
    if (card) {
      card.classList.toggle('active', state.boldText);
    }
    
    announceToScreenReader('Texto em negrito ' + (state.boldText ? 'ativado' : 'desativado'));
    saveState();
  }

  function toggleStopAnimations() {
    state.stopAnim = !state.stopAnim;
    
    if (state.stopAnim) {
      document.body.classList.add('stop-anim');
    } else {
      document.body.classList.remove('stop-anim');
    }
    
    var card = document.querySelector('[data-action="stop-anim"]');
    if (card) {
      card.classList.toggle('active', state.stopAnim);
    }
    
    announceToScreenReader('Animações ' + (state.stopAnim ? 'pausadas' : 'ativas'));
    saveState();
  }

  function toggleHideImages() {
    state.hideImages = !state.hideImages;
    
    if (state.hideImages) {
      document.body.classList.add('hide-images');
    } else {
      document.body.classList.remove('hide-images');
    }
    
    var card = document.querySelector('[data-action="hide-images"]');
    if (card) {
      card.classList.toggle('active', state.hideImages);
    }
    
    announceToScreenReader('Imagens ' + (state.hideImages ? 'ocultas' : 'visíveis'));
    saveState();
  }

  function toggleReadingMode() {
    state.readingMode = !state.readingMode;
    
    if (state.readingMode) {
      document.body.classList.add('reading-mode');
    } else {
      document.body.classList.remove('reading-mode');
    }
    
    announceToScreenReader('Modo de leitura ' + (state.readingMode ? 'ativado' : 'desativado'));
    saveState();
  }

  // ============================================
  // PAINEL DE ACESSIBILIDADE (UI)
  // ============================================
  var readingGuideElement = null;

  function togglePanel() {
    var panel = getElement('accessibility-panel');
    var toggleBtn = getElement('accessibility-toggle');
    
    if (!panel) return;
    
    var isHidden = panel.classList.contains('accessibility-panel-hidden');
    
    if (isHidden) {
      panel.classList.remove('accessibility-panel-hidden');
      panel.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      state.panelOpen = true;
      announceToScreenReader('Painel de acessibilidade aberto');
    } else {
      closePanel();
    }
  }

  function closePanel() {
    var panel = getElement('accessibility-panel');
    var toggleBtn = getElement('accessibility-toggle');
    
    if (panel) {
      panel.classList.add('accessibility-panel-hidden');
      panel.setAttribute('aria-hidden', 'true');
      panel.hidden = true;
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      state.panelOpen = false;
      announceToScreenReader('Painel de acessibilidade fechado');
    }
  }

  function closeAllPanels() {
    closePanel();
    hideShortcutsModal();
    hideGlossaryModal();
  }

  // ============================================
  // MODAL DE ATAȘHOS DE TECLADO
  // ============================================
  function showShortcutsModal() {
    var modal = getElement('shortcuts-modal');
    var list = getElement('shortcuts-list');
    
    if (modal) {
      modal.hidden = false;
      renderShortcutsList();
      announceToScreenReader('Atalhos de teclado mostrados');
    }
  }

  function hideShortcutsModal() {
    var modal = getElement('shortcuts-modal');
    if (modal) {
      modal.hidden = true;
    }
  }

  function renderShortcutsList() {
    var list = getElement('shortcuts-list');
    if (!list) return;
    
    var browser = getBrowser();
    var shortcuts = shortcutsByBrowser[browser] || shortcutsByBrowser.chrome;
    
    list.innerHTML = shortcuts.map(function(shortcut) {
      return '<div class="shortcut-item"><kbd>' + shortcut.keys.join(' + ') + '</kbd><span>' + shortcut.desc + '</span></div>';
    }).join('');
  }

  // ============================================
  // MODAL DE GLOSSÁRIO
  // ============================================
  function showGlossaryModal() {
    var modal = getElement('glossary-modal');
    if (modal) {
      modal.hidden = false;
      renderGlossaryList();
      announceToScreenReader('Dicionário de termos aberto');
    }
  }

  function hideGlossaryModal() {
    var modal = getElement('glossary-modal');
    if (modal) {
      modal.hidden = true;
    }
  }

  function renderGlossaryList(letter, searchTerm) {
    var list = getElement('glossary-list');
    if (!list) return;
    
    var terms = glossaryData;
    
    if (letter && letter !== 'all') {
      terms = terms.filter(function(term) {
        return term.term.toUpperCase().startsWith(letter);
      });
    }
    
    if (searchTerm) {
      var term = searchTerm.toLowerCase();
      terms = terms.filter(function(t) {
        return t.term.toLowerCase().includes(term) || t.definition.toLowerCase().includes(term);
      });
    }
    
    if (terms.length === 0) {
      list.innerHTML = '';
      var emptyEl = getElement('glossary-empty');
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      var emptyEl = getElement('glossary-empty');
      if (emptyEl) emptyEl.style.display = 'none';
      
      list.innerHTML = terms.map(function(item) {
        return '<li class="glossary-item" data-term="' + sanitizeHTML(item.term) + '">' +
          '<div class="glossary-term">' + sanitizeHTML(item.term) + '</div>' +
          '<div class="glossary-definition">' + sanitizeHTML(item.definition) + '</div>' +
          '</li>';
      }).join('');
    }
  }

  function filterGlossaryByLetter(letter) {
    document.querySelectorAll('.alphabet-letter').forEach(function(btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    var activeBtn = document.querySelector('.alphabet-letter[data-letter="' + letter + '"]');
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
    }
    
    var searchInput = getElement('glossary-search-input');
    var searchTerm = searchInput ? searchInput.value : '';
    renderGlossaryList(letter, searchTerm);
  }

  // ============================================
  // EXECUTOR DE AÇÕES DO TECLADO
  // ============================================
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
        toggleReadingMask();
        break;
      case 'toggleGuide':
        toggleReadingGuide();
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
        resetAllAccessibilityFeatures();
        break;
      case 'closeAll':
        closeAllPanels();
        break;
    }
  }

  function handleKeyboard(e) {
    // Don't interfere with form inputs
    if (e.target.matches && e.target.matches('input, textarea, [contenteditable]')) return;
    
    var browser = getBrowser();
    var shortcuts = shortcutsByBrowser[browser] || shortcutsByBrowser.chrome;
    
    for (var i = 0; i < shortcuts.length; i++) {
      var shortcut = shortcuts[i];
      var keysPressed = [];
      if (e.altKey) keysPressed.push('Alt');
      if (e.ctrlKey) keysPressed.push('Ctrl');
      if (e.shiftKey) keysPressed.push('Shift');
      
      var requiredKeys = shortcut.keys.filter(function(k) {
        return k !== 'Alt' && k !== 'Ctrl' && k !== 'Shift';
      });
      var extraKeys = shortcut.keys.filter(function(k) {
        return k === 'Alt' || k === 'Ctrl' || k === 'Shift';
      });
      
      var allRequiredPressed = requiredKeys.every(function(k) {
        return keysPressed.indexOf(k) !== -1;
      });
      var modifiersMatch = extraKeys.every(function(k) {
        return keysPressed.indexOf(k) !== -1;
      });
      
      if (allRequiredPressed && modifiersMatch && requiredKeys.length > 0) {
        e.preventDefault();
        executeAction(shortcut.action);
        return;
      }
    }
  }

  // ============================================
  // FUNÇÕES AUXILIARES DO PAINEL
  // ============================================
  function toggleReadingMask() {
    var mask = document.getElementById('reading-mask');
    var isActive = mask && mask.style.display !== 'none';
    
    if (isActive) {
      if (mask) mask.style.display = 'none';
      state.readingMask = 0;
      announceToScreenReader('Máscara de leitura desativada');
    } else {
      if (!mask) {
        mask = document.createElement('div');
        mask.id = 'reading-mask';
        mask.innerHTML = '<div id="reading-mask-top"></div><div id="reading-mask-bottom"></div>';
        mask.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9990';
        document.body.appendChild(mask);
      }
      var top = document.getElementById('reading-mask-top');
      var bottom = document.getElementById('reading-mask-bottom');
      if (top) top.style.height = '50%';
      if (bottom) bottom.style.height = '50%';
      mask.style.display = 'block';
      state.readingMask = 1;
      announceToScreenReader('Máscara de leitura ativada');
    }
  }

  function toggleReadingGuide() {
    if (!readingGuideElement) {
      readingGuideElement = document.createElement('div');
      readingGuideElement.id = 'reading-guide';
      readingGuideElement.style.cssText = 'position:fixed;left:0;width:100%;height:3px;z-index:9990;pointer-events:none;box-shadow:0 0 10px currentColor';
      document.body.appendChild(readingGuideElement);
      
      document.addEventListener('mousemove', function(e) {
        if (state.readingGuide && readingGuideElement) {
          readingGuideElement.style.top = e.clientY + 'px';
        }
      });
    }
    
    state.readingGuide = state.readingGuide ? 0 : 1;
    
    if (state.readingGuide) {
      readingGuideElement.style.display = 'block';
      readingGuideElement.style.backgroundColor = '#2196F3';
      announceToScreenReader('Guia de leitura ativada');
    } else {
      readingGuideElement.style.display = 'none';
      announceToScreenReader('Guia de leitura desativada');
    }
  }

  // ============================================
  // EVENTOS DO THEMEMANAGER
  // ============================================
  function setupThemeManagerEvents() {
    window.addEventListener('theme:changed', function(e) {
      console.log('[AccessControl] Tema alterado:', e.detail.theme);
    });
    
    window.addEventListener('ThemeManager:Ready', function() {
      console.log('[AccessControl] ThemeManager está pronto');
    });
  }

  // ============================================
  // CONFIGURAÇÃO DE EVENT LISTENERS
  // ============================================
  function bindEvents() {
    // Botões principais do painel
    var toggleBtn = getElement('accessibility-toggle');
    var closeBtn = getElement('accessibility-close');
    var restoreBtn = getElement('accessibility-restore');
    
    if (toggleBtn) toggleBtn.addEventListener('click', togglePanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (restoreBtn) restoreBtn.addEventListener('click', resetAllAccessibilityFeatures);
    
    // Botões de fonte no header
    var fontIncrease = getElement('font-increase');
    var fontDecrease = getElement('font-decrease');
    
    if (fontIncrease) fontIncrease.addEventListener('click', increaseFontSize);
    if (fontDecrease) fontDecrease.addEventListener('click', decreaseFontSize);
    
    // Botão de tema
    var themeToggle = getElement('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        ThemeManager.toggle();
      });
    }
    
    // Botões de ação de acessibilidade
    document.querySelectorAll('[data-action]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = this.getAttribute('data-action');
        var param = this.getAttribute('data-param');
        
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
          case 'reading-mask':
            toggleReadingMask();
            break;
          case 'reading-guide':
            toggleReadingGuide();
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
        }
      });
    });
    
    // Botões de atalhos e glossário
    var shortcutsBtn = getElement('shortcuts-btn');
    var glossaryBtn = getElement('glossary-btn');
    
    if (shortcutsBtn) shortcutsBtn.addEventListener('click', showShortcutsModal);
    if (glossaryBtn) glossaryBtn.addEventListener('click', showGlossaryModal);
    
    // Fechar modal de atalhos
    var shortcutsClose = getElement('shortcuts-close');
    if (shortcutsClose) shortcutsClose.addEventListener('click', hideShortcutsModal);
    
    // Tabs de navegador no modal de atalhos
    document.querySelectorAll('.browser-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.browser-tab').forEach(function(t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        renderShortcutsList();
      });
    });
    
    // Navegação por letra no glossário
    document.querySelectorAll('.alphabet-letter').forEach(function(letter) {
      letter.addEventListener('click', function() {
        filterGlossaryByLetter(this.getAttribute('data-letter'));
      });
    });
    
    // Toggle do alfabeto
    var alphabetToggle = document.querySelector('.alphabet-toggle');
    if (alphabetToggle) {
      alphabetToggle.addEventListener('click', function() {
        var alphabet = document.querySelector('.glossary-alphabet');
        if (alphabet) {
          alphabet.classList.toggle('collapsed');
          var isCollapsed = alphabet.classList.contains('collapsed');
          this.setAttribute('aria-expanded', !isCollapsed);
        }
      });
    }
    
    // Busca no glossário
    var glossarySearch = getElement('glossary-search-input');
    if (glossarySearch) {
      glossarySearch.addEventListener('input', debounce(function() {
        var activeLetter = document.querySelector('.alphabet-letter.active');
        var letter = activeLetter ? activeLetter.getAttribute('data-letter') : 'all';
        renderGlossaryList(letter, this.value);
      }, 200));
    }
    
    // Fechar modais ao clicar no backdrop
    var shortcutsModal = getElement('shortcuts-modal');
    var glossaryModal = getElement('glossary-modal');
    
    if (shortcutsModal) {
      shortcutsModal.addEventListener('click', function(e) {
        if (e.target === this) hideShortcutsModal();
      });
    }
    
    if (glossaryModal) {
      glossaryModal.addEventListener('click', function(e) {
        if (e.target === this) hideGlossaryModal();
      });
    }
    
    // Fechar com Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllPanels();
      }
    });
    
    // Atalhos de teclado globais
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  function init() {
    if (state._initialized) {
      console.log('[AccessControl] Módulo já inicializado');
      return;
    }
    
    // Carregar estado salvo (apenas dados, não aplica estilos automaticamente)
    loadState();
    
    // Inicializar ThemeManager (aplica tema salvo, mas isso é esperado)
    ThemeManager.init();
    setupThemeManagerEvents();
    
    // Configurar eventos de UI
    bindEvents();
    
    // NÃO aplicar estado da fonte automaticamente
    // O princípio é: estrutura padrão prevalece até que usuário ative um recurso
    
    state._initialized = true;
    
    // Disparar evento de prontidão para outros módulos
    window.dispatchEvent(new CustomEvent('AccessControl:Ready'));
    
    console.log('[AccessControl] Módulo master inicializado com sucesso');
    console.log('[AccessControl] Estado atual:', state);
  }

  // ============================================
  // API PÚBLICA (SSOT)
  // ============================================
  window.AccessControl = {
    // Inicialização
    init: init,
    isLoaded: function() {
      return state._initialized;
    },
    
    // Estado (apenas leitura)
    getState: function() {
      return {
        fontSizeIndex: state.fontSizeIndex,
        fontIncreaseIndex: state.fontIncreaseIndex,
        theme: state.theme,
        contrast: state.contrast,
        colorblind: state.colorblind,
        saturation: state.saturation,
        bigCursor: state.bigCursor,
        readingMask: state.readingMask,
        readingGuide: state.readingGuide,
        highlightLinks: state.highlightLinks,
        highlightHeaders: state.highlightHeaders,
        boldText: state.boldText,
        stopAnim: state.stopAnim,
        hideImages: state.hideImages,
        readingMode: state.readingMode,
        fontStyle: state.fontStyle,
        panelOpen: state.panelOpen
      };
    },
    
    Config: Config,
    
    // Theme Manager
    ThemeManager: ThemeManager,
    getTheme: function() {
      return ThemeManager.getTheme();
    },
    setTheme: function(theme) {
      ThemeManager.applyTheme(theme);
    },
    
    // Font Controls
    applyFontSize: applyFontSize,
    applyFontSizeIncrease: applyFontSizeIncrease,
    decreaseFontSize: decreaseFontSize,
    increaseFontSize: increaseFontSize,
    increaseFontSizeFromButton: increaseFontSizeFromButton,
    decreaseFontSizeFromButton: decreaseFontSizeFromButton,
    resetFontSize: resetFontSize,
    
    // Accessibility Features
    toggleContrast: toggleContrast,
    toggleColorblind: toggleColorblind,
    toggleHighlightLinks: toggleHighlightLinks,
    toggleHighlightHeaders: toggleHighlightHeaders,
    toggleBoldText: toggleBoldText,
    toggleStopAnimations: toggleStopAnimations,
    toggleHideImages: toggleHideImages,
    toggleReadingMode: toggleReadingMode,
    
    // Resetar todos os recursos
    resetAll: resetAllAccessibilityFeatures,
    
    // Panel Controls
    togglePanel: togglePanel,
    closePanel: closePanel,
    closeAllPanels: closeAllPanels,
    
    // Modals
    showShortcuts: showShortcutsModal,
    hideShortcuts: hideShortcutsModal,
    showGlossary: showGlossaryModal,
    hideGlossary: hideGlossaryModal,
    
    // Cookie Consent Management (SSOT)
    CookieConsentManager: CookieConsentManager,
    saveCookieConsent: function(preferences) {
      return CookieConsentManager.saveConsent(preferences);
    },
    getCookieConsent: function() {
      return CookieConsentManager.getConsent();
    },
    hasCookieConsent: function() {
      return CookieConsentManager.hasConsent();
    },
    clearCookieConsent: function() {
      return CookieConsentManager.clearConsent();
    },
    applyCookieConsent: function() {
      return CookieConsentManager.applyConsent();
    },
    
    // FAB Cookie Management (SSOT)
    saveFabPreference: saveFabPreference,
    getFabPreference: getFabPreference,
    clearFabPreference: clearFabPreference,
    
    // Utilities
    announceToScreenReader: announceToScreenReader,
    saveState: saveState,
    loadState: loadState
  };

  // ============================================
  // AUTO-INICIALIZAÇÃO
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);