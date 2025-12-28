/**
 * Console Cleaner v2.0
 * Limpa console em produção, mantém em desenvolvimento
 */

(function() {
  'use strict';

  const ConsoleManager = {
    isProduction: true,
    allowedPrefixes: ['[TemplateEngine]', '[MainIndexLoader]', '[ThemeConfig]', '[Header]', '[App]'],
    
    init: function() {
      // Detecta ambiente
      this.isProduction = !window.location.hostname.includes('localhost') && 
                         !window.location.hostname.includes('127.0.0.1') &&
                         !window.location.hostname.includes('dev.');
      
      if (this.isProduction) {
        this.setupProductionConsole();
      } else {
        this.setupDevelopmentConsole();
      }
      
      console.log(`[ConsoleManager] Ambiente: ${this.isProduction ? 'Produção' : 'Desenvolvimento'}`);
    },
    
    setupProductionConsole: function() {
      // Salva referências originais
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
      };
      
      // Sobrescreve console.log
      console.log = function(...args) {
        const message = args[0] || '';
        if (typeof message === 'string' && this.isAllowed(message)) {
          originalConsole.log.apply(console, args);
        }
      }.bind(this);
      
      // Sobrescreve console.warn
      console.warn = function(...args) {
        const message = args[0] || '';
        if (typeof message === 'string' && this.isAllowed(message)) {
          originalConsole.warn.apply(console, args);
        }
      }.bind(this);
      
      // Mantém console.error sempre visível
      console.error = originalConsole.error;
      
      // Limpa console.info e console.debug
      console.info = function() {};
      console.debug = function() {};
      
      // Limpa console no carregamento
      if (typeof console.clear === 'function') {
        setTimeout(() => console.clear(), 100);
      }
    },
    
    setupDevelopmentConsole: function() {
      // Em desenvolvimento, mantém tudo visível
      console.log('[ConsoleManager] Modo desenvolvimento - todos os logs visíveis');
      
      // Adiciona banner de desenvolvimento
      console.log(
        '%c🚀 MODO DESENVOLVIMENTO 🚀',
        'color: white; background: linear-gradient(90deg, #1A3E74, #1e40af); padding: 10px; border-radius: 5px; font-weight: bold;'
      );
    },
    
    isAllowed: function(message) {
      return this.allowedPrefixes.some(prefix => message.startsWith(prefix));
    },
    
    addAllowedPrefix: function(prefix) {
      if (!this.allowedPrefixes.includes(prefix)) {
        this.allowedPrefixes.push(prefix);
      }
    },
    
    forceShowLog: function() {
      // Método para forçar exibição de logs específicos
      const originalLog = console.log;
      return function(...args) {
        originalLog.apply(console, args);
      };
    }
  };

  // Inicializa imediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ConsoleManager.init());
  } else {
    ConsoleManager.init();
  }

  // Expõe para uso global
  window.ConsoleManager = ConsoleManager;
  
  // Método helper para logs importantes
  window.importantLog = function(...args) {
    console.log('%c🔔 IMPORTANTE:', 'color: #1A3E74; font-weight: bold;', ...args);
  };
  
  // Método para logs de erro estruturados
  window.errorLog = function(context, error) {
    console.error(`[ERRO:${context}]`, error);
  };

})();