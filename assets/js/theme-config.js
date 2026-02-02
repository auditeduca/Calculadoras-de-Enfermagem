/**
 * THEME-CONFIG.JS
 * Sistema de Configuração de Tema
 * Versão: 1.0 - Completo com suporte a dark mode
 * 
 * Funcionalidades:
 * - Alternância entre tema claro e escuro
 * - Persistência no localStorage
 * - Detecção de preferência do sistema
 * - Classes CSS dinâmicas
 * - Integração com prefers-color-scheme
 * - Transições suaves entre temas
 */

const ThemeConfig = {
  // Configurações
  config: {
    defaultTheme: 'light',
    storageKey: 'site_theme',
    className: 'dark-theme',
    attribute: 'data-theme',
    transitionDuration: 300,
    watchSystem: true
  },

  // Estado
  state: {
    currentTheme: 'light',
    isInitialized: false
  },

  /**
   * Inicializa o sistema de tema
   */
  init: function() {
    if (this.state.isInitialized) {
      console.warn('[ThemeConfig] Já inicializado');
      return;
    }

    console.log('[ThemeConfig] Inicializando...');

    // Obter tema salvo ou detectar preferência
    const savedTheme = this.getSavedTheme();
    const systemTheme = this.getSystemTheme();
    
    // Aplicar tema inicial
    this.applyTheme(savedTheme || systemTheme);

    // Configurar listener de mudanças do sistema
    if (this.config.watchSystem) {
      this.watchSystemTheme();
    }

    // Configurar toggle button se existir
    this.setupToggleButton();

    this.state.isInitialized = true;
    console.log(`[ThemeConfig] Inicializado com tema: ${this.state.currentTheme}`);

    // Disparar evento de inicialização
    window.dispatchEvent(new CustomEvent('ThemeConfig:Ready', {
      detail: { theme: this.state.currentTheme }
    }));
  },

  /**
   * Obtém tema salvo no localStorage
   * @returns {string|null}
   */
  getSavedTheme: function() {
    try {
      return localStorage.getItem(this.config.storageKey);
    } catch (e) {
      console.error('[ThemeConfig] Erro ao ler tema salvo:', e);
      return null;
    }
  },

  /**
   * Obtém tema do sistema
   * @returns {string}
   */
  getSystemTheme: function() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /**
   * Aplica tema ao documento
   * @param {string} theme - 'light' ou 'dark'
   */
  applyTheme: function(theme) {
    const validThemes = ['light', 'dark'];
    theme = validThemes.includes(theme) ? theme : this.config.defaultTheme;

    this.state.currentTheme = theme;
    const body = document.body;

    // Adicionar classe de transição para suavidade
    body.style.transition = `background-color ${this.config.transitionDuration}ms ease, color ${this.config.transitionDuration}ms ease`;

    if (theme === 'dark') {
      body.classList.add(this.config.className);
      body.setAttribute(this.config.attribute, 'dark');
    } else {
      body.classList.remove(this.config.className);
      body.setAttribute(this.config.attribute, 'light');
    }

    // Salvar preferência
    this.saveTheme(theme);

    // Atualizar ícone do toggle se existir
    this.updateToggleIcon();

    // Disparar evento
    window.dispatchEvent(new CustomEvent('ThemeChanged', {
      detail: { theme: theme }
    }));

    console.log(`[ThemeConfig] Tema aplicado: ${theme}`);
  },

  /**
   * Salva tema no localStorage
   * @param {string} theme
   */
  saveTheme: function(theme) {
    try {
      localStorage.setItem(this.config.storageKey, theme);
    } catch (e) {
      console.error('[ThemeConfig] Erro ao salvar tema:', e);
    }
  },

  /**
   * Alterna entre temas
   */
  toggle: function() {
    const newTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    return newTheme;
  },

  /**
   * Define tema específico
   * @param {string} theme - 'light' ou 'dark'
   */
  set: function(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.applyTheme(theme);
    }
  },

  /**
   * Obtém tema atual
   * @returns {string}
   */
  get: function() {
    return this.state.currentTheme;
  },

  /**
   * Verifica se tema escuro está ativo
   * @returns {boolean}
   */
  isDark: function() {
    return this.state.currentTheme === 'dark';
  },

  /**
   * Configura listener para mudanças de tema do sistema
   */
  watchSystemTheme: function() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Só alterar se usuário não tiver preferência salva
      if (!this.getSavedTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  },

  /**
   * Configura botão de toggle do tema
   */
  setupToggleButton: function() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Adicionar click listener se não existir
    if (!toggleBtn.hasAttribute('data-theme-initialized')) {
      toggleBtn.addEventListener('click', () => {
        this.toggle();
      });
      toggleBtn.setAttribute('data-theme-initialized', 'true');
    }

    // Atualizar ícone inicial
    this.updateToggleIcon();
  },

  /**
   * Atualiza ícone do botão de toggle
   */
  updateToggleIcon: function() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (this.state.currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
        toggleBtn.setAttribute('aria-label', 'Alternar para modo claro');
      } else {
        icon.className = 'fas fa-moon';
        toggleBtn.setAttribute('aria-label', 'Alternar para modo escuro');
      }
    }
  },

  /**
   * Remove transição (útil para testes)
   */
  disableTransitions: function() {
    document.body.style.transition = 'none';
  },

  /**
   * Obtém status do tema
   * @returns {Object}
   */
  getStatus: function() {
    return {
      currentTheme: this.state.currentTheme,
      savedTheme: this.getSavedTheme(),
      systemTheme: this.getSystemTheme(),
      isDark: this.isDark(),
      isInitialized: this.state.isInitialized
    };
  }
};

// Exportar globalmente
window.ThemeConfig = ThemeConfig;

// ============================================
// ACESSIBILIDADE - REDUÇÃO DE MOVIMENTO
// ============================================

(function() {
  'use strict';

  // Verificar preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Desabilitar transições para usuários que preferem movimento reduzido
    document.documentElement.style.setProperty('--transition-duration', '0ms');
    
    // Sobrescrever transições em elementos críticos
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Listener para mudanças na preferência
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
      location.reload(); // Recarregar para aplicar mudanças
    }
  });

})();

// ============================================
// INICIALIZAÇÃO
// ============================================

// Inicializar quando DOM estiver pronto
function initTheme() {
  ThemeConfig.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Listener para quando Template Engine estiver pronto
window.addEventListener('TemplateEngine:Ready', () => {
  setTimeout(() => {
    // Atualizar toggle button após componentes carregarem
    ThemeConfig.setupToggleButton();
  }, 100);
});

// Para compatibilidade com módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeConfig };
}
