/**
 * THEME-CONFIG.JS
 * Configuração de Tema (Claro/Escuro)
 * Versão: 2.0
 */

(function() {
  'use strict';

  const ThemeConfig = {
    STORAGE_KEY: 'theme_preference',
    SYSTEM_KEY: 'prefers-color-scheme',
    DARK_CLASS: 'dark-theme',
    
    /**
     * Inicializa o sistema de tema
     */
    init: function() {
      // Aplica tema salvo ou preferência do sistema
      this.applyTheme(this.getSavedTheme());
      
      // Espera o DOM estar pronto para sincronizar com controles do header
      this.syncWithHeader();
      
      // Espera o Template Engine estar pronto
      if (window.TemplateEngine) {
        window.addEventListener('TemplateEngine:Ready', function() {
          this.syncWithHeader();
        }.bind(this));
      }
      
      console.log('[ThemeConfig] Sistema de tema inicializado');
    },

    /**
     * Obtém o tema salvo ou detecta preferência
     */
    getSavedTheme: function() {
      // Primeiro verifica localStorage
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      
      // Depois verifica preferência do sistema
      if (window.matchMedia && window.matchMedia('(' + this.SYSTEM_KEY + ': dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    },

    /**
     * Aplica o tema ao documento
     */
    applyTheme: function(theme) {
      theme = theme || 'light';
      
      if (theme === 'dark') {
        document.body.classList.add(this.DARK_CLASS);
      } else {
        document.body.classList.remove(this.DARK_CLASS);
      }
      
      // Salva preferência
      localStorage.setItem(this.STORAGE_KEY, theme);
      
      // Dispara evento para outros scripts
      window.dispatchEvent(new CustomEvent('theme:change', {
        detail: { theme: theme }
      }));
    },

    /**
     * Alterna entre temas
     */
    toggle: function() {
      const isDark = document.body.classList.contains(this.DARK_CLASS);
      this.applyTheme(isDark ? 'light' : 'dark');
      
      // Atualiza ícone do header
      this.updateHeaderIcon();
    },

    /**
     * Define tema específico
     */
    set: function(theme) {
      if (theme === 'dark' || theme === 'light') {
        this.applyTheme(theme);
        this.updateHeaderIcon();
      }
    },

    /**
     * Obtém tema atual
     */
    get: function() {
      return document.body.classList.contains(this.DARK_CLASS) ? 'dark' : 'light';
    },

    /**
     * Sincroniza com controles do header
     */
    syncWithHeader: function() {
      this.updateHeaderIcon();
    },

    /**
     * Atualiza ícone do botão de tema no header
     */
    updateHeaderIcon: function() {
      const themeToggle = document.getElementById('theme-toggle');
      const icon = themeToggle ? themeToggle.querySelector('i') : null;
      const isDark = this.get() === 'dark';
      
      if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      }
      
      if (themeToggle) {
        themeToggle.setAttribute('aria-label', 
          isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
        );
      }
    },

    /**
     * Escuta mudanças na preferência do sistema
     */
    watchSystemPreference: function() {
      if (!window.matchMedia) return;
      
      const mediaQuery = window.matchMedia('(' + this.SYSTEM_KEY + ': dark)');
      
      mediaQuery.addEventListener('change', function(e) {
        // Só altera se o usuário não tiver preferência salva
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.applyTheme(e.matches ? 'dark' : 'light');
          this.updateHeaderIcon();
        }
      }.bind(this));
    }
  };

  // Expõe globalmente
  window.ThemeConfig = ThemeConfig;
  window.themeConfig = ThemeConfig;

  // Função global compatível com onclick no HTML
  window.toggleTheme = function() {
    ThemeConfig.toggle();
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ThemeConfig.init();
      ThemeConfig.watchSystemPreference();
    });
  } else {
    ThemeConfig.init();
    ThemeConfig.watchSystemPreference();
  }

  // Também ouvir o evento do Template Engine
  window.addEventListener('TemplateEngine:Ready', function() {
    ThemeConfig.syncWithHeader();
  });

})();
