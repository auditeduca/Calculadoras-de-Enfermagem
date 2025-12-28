(function() {
  'use strict';

  const ConsoleCleaner = {
    /**
     * Inicializa o limpador de console
     */
    init: function() {
      // Verifica se está em ambiente de produção
      const isProduction = this.isProduction();
      
      if (isProduction) {
        // Remove métodos de console em produção
        this.cleanConsole();
        
        // Sobrescreve console.error para evitar stack traces feios
        this.overrideConsole();
      }
      
      // Sempre registra versão em ambiente de desenvolvimento
      if (!isProduction) {
        console.log('%c[System] Console Cleaner ativado (desenvolvimento)', 
          'color: #10b981; font-weight: bold;');
      }
    },

    /**
     * Verifica se está em produção
     */
    isProduction: function() {
      // Verifica se há flag no localStorage
      if (localStorage.getItem('clean_console') === 'true') {
        return true;
      }
      
      // Verifica se hostname não é localhost ou 127.0.0.1
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return false;
      }
      
      // Verifica se há query param de debug
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('debug') || urlParams.has('console')) {
        return false;
      }
      
      // Por padrão, considera produção
      return true;
    },

    /**
     * Remove métodos de console em produção
     */
    cleanConsole: function() {
      // Salva referências originais
      const originalConsole = window.console;
      
      // Cria novo objeto console apenas com os métodos essenciais
      const cleanConsole = {
        log: function() {},
        info: function() {},
        warn: function() {},
        error: function() {
          // Em produção, erros ainda são registrados mas de forma mais limpa
          if (arguments.length > 0 && arguments[0] && arguments[0].includes && arguments[0].includes('[Error]')) {
            originalConsole.error.apply(originalConsole, arguments);
          }
        },
        debug: function() {},
        trace: function() {},
        dir: function() {},
        time: function() {},
        timeEnd: function() {},
        group: function() {},
        groupCollapsed: function() {},
        groupEnd: function() {},
        table: function() {},
        clear: function() {},
        count: function() {},
        assert: function() {},
        profile: function() {},
        profileEnd: function() {},
        dirxml: function() {}
      };
      
      // Substitui console
      window.console = cleanConsole;
    },

    /**
     * Sobrescreve console.error para tratamento especial
     */
    overrideConsole: function() {
      const self = this;
      const originalError = window.console.error;
      
      window.console.error = function() {
        // Filtra erros não críticos
        const args = Array.prototype.slice.call(arguments);
        
        // Ignora erros de recursos externos (imagens, fonts, etc)
        const isResourceError = args.some(function(arg) {
          return arg && (
            arg.includes && (arg.includes('Failed to load resource') ||
            arg.includes('net::ERR') ||
            arg.includes('favicon'))
          );
        });
        
        if (!isResourceError) {
          // Log simplificado para erros reais
          self.logError('[ConsoleCleaner] Erro capturado:', args.join(' '));
        }
      };
    },

    /**
     * Log simplificado de erros
     */
    logError: function() {
      if (window.console && window.console.log) {
        // Não faz nada em produção silenciosa
      }
    },

    /**
     * Ativa modo debug (para testes)
     */
    enableDebug: function() {
      localStorage.setItem('clean_console', 'false');
      window.location.reload();
    },

    /**
     * Desativa modo debug
     */
    disableDebug: function() {
      localStorage.setItem('clean_console', 'true');
      window.location.reload();
    }
  };

  // Expõe globalmente
  window.ConsoleCleaner = ConsoleCleaner;

  // Funções de debug globais
  window.enableDebugMode = function() {
    ConsoleCleaner.enableDebug();
  };

  window.disableDebugMode = function() {
    ConsoleCleaner.disableDebug();
  };

  // Inicializa automaticamente
  ConsoleCleaner.init();

})();