/**
 * HEADER.JS
 * Módulo Delegate do Header
 * Calculadoras de Enfermagem
 * 
 * Este é um módulo DELEGATE - NÃO possui lógica própria
 * Captura eventos de UI e delega para o AccessControl (master)
 * 
 * ARQUITETURA PADRONIZADA:
 * - accessibility.js: Master (SSOT) - Controla estado e localStorage
 * - header.js: Delegate - Captura eventos e delega
 * - footer.js: Delegate - Captura eventos e delega
 * 
 * ELEMENTOS COMPARTILHADOS:
 * - theme-toggle: Botão de alternância de tema (header desktop)
 * - mobile-theme-toggle: Botão de alternância de tema (mobile)
 * - font-increase: Botão aumentar fonte (header desktop)
 * - font-decrease: Botão reduzir fonte (header desktop)
 * - mobile-font-increase: Botão aumentar fonte (mobile)
 * - mobile-font-reduce: Botão reduzir fonte (mobile)
 * - skip-top: Link skip para header
 * - skip-content: Link skip para conteúdo principal
 * - skip-footer: Link skip para footer
 * - reset-accessibility: Botão para restaurar recursos da página
 */

(function() {
  'use strict';

  // ============================================
  // UTILITÁRIOS DOM COMPARTILHADOS
  // ============================================
  
  /**
   * Seletor padrão de elementos - APENAS leitura
   * Outros módulos podem usar estas funções para obter referências
   */
  var DOMSelectors = {
    // Elementos de tema
    themeToggle: function() { return document.getElementById('theme-toggle'); },
    mobileThemeToggle: function() { return document.getElementById('mobile-theme-toggle'); },
    
    // Elementos de fonte desktop
    fontIncrease: function() { return document.getElementById('font-increase'); },
    fontDecrease: function() { return document.getElementById('font-decrease'); },
    
    // Elementos de fonte mobile
    mobileFontIncrease: function() { return document.getElementById('mobile-font-increase'); },
    mobileFontReduce: function() { return document.getElementById('mobile-font-reduce'); },
    
    // Elementos de fonte (IDs alternativos)
    fontReduce: function() { return document.getElementById('font-reduce'); },
    mobileFontReduceAlt: function() { return document.getElementById('mobile-font-reduce'); },
    
    // Elemento de reset de acessibilidade
    resetAccessibility: function() { return document.getElementById('reset-accessibility'); },
    
    // Skip links
    skipTop: function() { return document.getElementById('skip-top'); },
    skipContent: function() { return document.getElementById('skip-content'); },
    skipFooter: function() { return document.getElementById('skip-footer'); },
    
    // Containers
    mainHeader: function() { return document.getElementById('main-header'); },
    mainContent: function() { return document.getElementById('main-content'); },
    footer: function() { return document.getElementById('footer'); },
    mobileMenu: function() { return document.getElementById('mobile-menu'); },
    headerContainer: function() { return document.getElementById('header-container'); }
  };

  // ============================================
  // FUNÇÕES DE DELEGAÇÃO (PATTERN)
  // ============================================

  /**
   * Delega a ação de alternar tema para o AccessControl
   */
  function handleThemeToggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Verificar se AccessControl está disponível
    if (window.AccessControl && window.AccessControl.ThemeManager) {
      window.AccessControl.ThemeManager.toggle();
    } else {
      console.warn('[Header] AccessControl não disponível para toggle de tema');
    }
  }

  /**
   * Delega a ação de aumentar fonte para o AccessControl
   */
  function handleFontIncrease(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Verificar se AccessControl está disponível
    if (window.AccessControl && window.AccessControl.increaseFontSizeFromButton) {
      window.AccessControl.increaseFontSizeFromButton();
    } else if (window.AccessControl && window.AccessControl.increaseFontSize) {
      window.AccessControl.increaseFontSize();
    } else {
      console.warn('[Header] AccessControl não disponível para aumentar fonte');
    }
  }

  /**
   * Delega a ação de reduzir fonte para o AccessControl
   */
  function handleFontDecrease(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Verificar se AccessControl está disponível
    if (window.AccessControl && window.AccessControl.decreaseFontSizeFromButton) {
      window.AccessControl.decreaseFontSizeFromButton();
    } else if (window.AccessControl && window.AccessControl.decreaseFontSize) {
      window.AccessControl.decreaseFontSize();
    } else {
      console.warn('[Header] AccessControl não disponível para reduzir fonte');
    }
  }

  /**
   * Delega a ação de resetar todos os recursos de acessibilidade
   * para o painel de acessibilidade (accessibility.js)
   */
  function handleResetAccessibility(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Verificar se o painel de acessibilidade está disponível
    if (window.AccessControl && window.AccessControl.resetAllSettings) {
      window.AccessControl.resetAllSettings();
    } else {
      console.warn('[Header] Painel de acessibilidade não disponível para reset');
    }
  }

  /**
   * Delega a ação de skip link para o target apropriado
   */
  function handleSkipLink(e, targetId) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    var target = document.getElementById(targetId);
    if (!target) {
      console.warn('[Header] Target de skip link não encontrado:', targetId);
      return;
    }

    // Tornar focável temporariamente
    target.setAttribute('tabindex', '-1');
    target.focus();
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // ============================================
  // ANIMAÇÕES DE CLIQUE
  // ============================================
  
  function addClickAnimation(button) {
    if (!button) return;
    
    // Remove classe existente se houver
    button.classList.remove('clicked');
    
    // Força reflow para permitir re-animação
    void button.offsetWidth;
    
    // Adiciona classe de animação
    button.classList.add('clicked');
    
    // Remove classe após animação completar
    setTimeout(function() {
      button.classList.remove('clicked');
    }, 500);
  }

  // ============================================
  // CONFIGURAÇÃO DE EVENT LISTENERS
  // ============================================
  
  function setupThemeControls() {
    // Theme toggle desktop
    var themeToggle = DOMSelectors.themeToggle();
    if (themeToggle) {
      themeToggle.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleThemeToggle(e);
      });
    }

    // Theme toggle mobile
    var mobileThemeToggle = DOMSelectors.mobileThemeToggle();
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleThemeToggle(e);
      });
    }
  }

  function setupFontControls() {
    // Font increase desktop
    var fontIncrease = DOMSelectors.fontIncrease();
    if (fontIncrease) {
      fontIncrease.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleFontIncrease(e);
      });
    }

    // Font decrease desktop (verificar IDs alternativos)
    var fontDecrease = DOMSelectors.fontDecrease() || DOMSelectors.fontReduce();
    if (fontDecrease) {
      fontDecrease.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleFontDecrease(e);
      });
    }

    // Font increase mobile
    var mobileFontIncrease = DOMSelectors.mobileFontIncrease();
    if (mobileFontIncrease) {
      mobileFontIncrease.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleFontIncrease(e);
      });
    }

    // Font decrease mobile
    var mobileFontReduce = DOMSelectors.mobileFontReduce() || DOMSelectors.mobileFontReduceAlt();
    if (mobileFontReduce) {
      mobileFontReduce.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleFontDecrease(e);
      });
    }
  }

  function setupAccessibilityControls() {
    // Botão de reset de acessibilidade
    var resetAccessibility = DOMSelectors.resetAccessibility();
    if (resetAccessibility) {
      resetAccessibility.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleResetAccessibility(e);
      });
    }
  }

  function setupSkipLinks() {
    // Skip to top
    var skipTop = DOMSelectors.skipTop();
    if (skipTop) {
      skipTop.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleSkipLink(e, 'main-header');
      });
    }

    // Skip to content
    var skipContent = DOMSelectors.skipContent();
    if (skipContent) {
      skipContent.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleSkipLink(e, 'main-content');
      });
    }

    // Skip to footer
    var skipFooter = DOMSelectors.skipFooter();
    if (skipFooter) {
      skipFooter.addEventListener('click', function(e) {
        addClickAnimation(this);
        handleSkipLink(e, 'footer');
      });
    }
  }

  // ============================================
  // EVENTOS DO THEMEMANAGER (SYNC)
  // ============================================
  
  function setupThemeManagerSync() {
    // Escutar mudanças de tema do ThemeManager
    window.addEventListener('theme:changed', function(e) {
      var isDark = e.detail.isDark;
      updateThemeIcons(isDark);
    });

    // Escutar quando ThemeManager estiver pronto
    window.addEventListener('ThemeManager:Ready', function() {
      if (window.AccessControl && window.AccessControl.ThemeManager) {
        var isDark = window.AccessControl.ThemeManager.isDarkMode();
        updateThemeIcons(isDark);
      }
    });
  }

  /**
   * Atualiza ícones do tema (delegado ao AccessControl se disponível)
   */
  function updateThemeIcons(isDark) {
    // Atualizar ícone desktop
    var themeToggle = DOMSelectors.themeToggle();
    if (themeToggle) {
      var icon = themeToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon', 'fa-sun');
        icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
      }
    }

    // Atualizar ícone mobile
    var mobileThemeToggle = DOMSelectors.mobileThemeToggle();
    if (mobileThemeToggle) {
      var icon = mobileThemeToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon', 'fa-sun');
        icon.classList.add(isDark ? 'fa-sun' : 'fa-moon');
      }

      // Atualizar status text
      var status = mobileThemeToggle.querySelector('.theme-status');
      if (status) {
        status.textContent = isDark ? 'Modo Escuro' : 'Modo Claro';
      }
    }
  }

  // ============================================
  // INICIALIZAÇÃO PRINCIPAL
  // ============================================
  
  var _initialized = false;

  function initialize() {
    if (_initialized) {
      console.log('[HeaderDelegate] Já inicializado');
      return;
    }

    console.log('[HeaderDelegate] Inicializando módulo delegate...');

    // Configurar todos os controles
    setupThemeControls();
    setupFontControls();
    setupAccessibilityControls();
    setupSkipLinks();
    setupThemeManagerSync();

    // Sincronizar com ThemeManager após um pequeno delay
    setTimeout(function() {
      if (window.AccessControl && window.AccessControl.ThemeManager) {
        var isDark = window.AccessControl.ThemeManager.isDarkMode();
        updateThemeIcons(isDark);
      }
    }, 100);

    _initialized = true;
    console.log('[HeaderDelegate] Módulo delegate inicializado com sucesso');
  }

  // ============================================
  // OBSERVER PARA DETECÇÃO DO HEADER
  // ============================================
  
  function setupHeaderObserver() {
    // Verificar se os elementos existem imediatamente
    var hasHeaderElements = DOMSelectors.headerContainer() || 
                            DOMSelectors.mainHeader() || 
                            DOMSelectors.mobileMenu();

    if (hasHeaderElements) {
      initialize();
      return;
    }

    // Usar MutationObserver para detectar inserção do header
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        var i, len = mutations.length;
        for (i = 0; i < len; i++) {
          var mutation = mutations[i];
          if (mutation.addedNodes.length > 0) {
            var hasHeader = DOMSelectors.headerContainer() || 
                            DOMSelectors.mainHeader() || 
                            DOMSelectors.mobileMenu();
            
            if (hasHeader && !_initialized) {
              console.log('[HeaderDelegate] Elementos do header detectados via MutationObserver');
              initialize();
              observer.disconnect();
              return;
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('[HeaderDelegate] MutationObserver configurado');
    }

    // Fallback: verificar periodicamente
    var attempts = 0;
    var maxAttempts = 50;
    var checkInterval;

    checkInterval = setInterval(function() {
      attempts++;
      var hasHeader = DOMSelectors.headerContainer() || 
                      DOMSelectors.mainHeader() || 
                      DOMSelectors.mobileMenu();

      if (hasHeader && !_initialized && attempts < maxAttempts) {
        console.log('[HeaderDelegate] Fallback: elementos detectados após', attempts, 'tentativas');
        clearInterval(checkInterval);
        initialize();
      } else if (attempts >= maxAttempts) {
        console.log('[HeaderDelegate] Fallback: limite de tentativas atingido');
        clearInterval(checkInterval);
      }
    }, 100);
  }

  // ============================================
  // API PÚBLICA (SOMENTE DELEGAÇÃO)
  // ============================================
  
  window.HeaderDelegate = {
    /**
     * Inicializa o módulo delegate
     */
    init: function() {
      console.log('[HeaderDelegate.init()] Chamado explicitamente');
      
      var hasHeaderElements = DOMSelectors.headerContainer() || 
                              DOMSelectors.mainHeader() || 
                              DOMSelectors.mobileMenu();

      if (!hasHeaderElements) {
        console.log('[HeaderDelegate.init()] Elementos não encontrados');
        return false;
      }

      initialize();
      return true;
    },

    /**
     * Retorna referências de elementos (apenas leitura)
     */
    getElements: function() {
      return DOMSelectors;
    },

    /**
     * Verifica se está inicializado
     */
    isLoaded: function() {
      return _initialized;
    },

    /**
     * Atualiza ícones do tema manualmente
     */
    updateThemeIcons: updateThemeIcons,

    /**
     * Adiciona animação de clique a um botão
     */
    addClickAnimation: addClickAnimation
  };

  // Iniciar observer
  setupHeaderObserver();

})();
