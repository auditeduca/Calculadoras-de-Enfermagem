/**
 * UTILS.JS - Funções Utilitárias
 * Versão: 2.0
 * 
 * Contém:
 * - Escape de HTML
 * - Debounce/Throttle
 * - Verificação de DOM pronto
 * - Renderização de cards
 */

const Utils = {
  /**
   * Escapa caracteres HTML para prevenir XSS
   */
  escapeHTML: function(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  },

  /**
   * Escapa caracteres para regex
   */
  escapeRegex: function(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Verifica se o DOM está pronto e executa callback
   */
  onReady: function(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(callback, 1);
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  },

  /**
   * Debounce - executa função após intervalo sem chamadas
   */
  debounce: function(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(this, args);
      }, wait);
    };
  },

  /**
   * Throttle - executa função no máximo uma vez por intervalo
   */
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  },

  /**
   * Deep clone de objetos
   */
  deepClone: function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(function(item) {
      return Utils.deepClone(item);
    });
    if (typeof obj === 'object') {
      var clonedObj = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          clonedObj[prop] = Utils.deepClone(obj[prop]);
        }
      }
      return clonedObj;
    }
  },

  /**
   * Verifica se objeto está vazio
   */
  isEmpty: function(obj) {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj) && obj.length === 0) return true;
    if (typeof obj === 'object' && Object.keys(obj).length === 0) return true;
    return false;
  },

  /**
   * Formata número para moeda brasileira
   */
  formatCurrency: function(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Formata data para padrão brasileiro
   */
  formatDate: function(date, format) {
    format = format || 'dd/MM/yyyy';
    var d = new Date(date);
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year);
  },

  /**
   * Trunca texto com reticências
   */
  truncate: function(str, length, suffix) {
    if (typeof str !== 'string') return str;
    if (str.length <= length) return str;
    suffix = suffix || '...';
    return str.substring(0, length - suffix.length) + suffix;
  },

  /**
   * Capitaliza primeira letra
   */
  capitalize: function(str) {
    if (typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Remove acentos
   */
  removeAccents: function(str) {
    if (typeof str !== 'string') return str;
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Gera slug URL-friendly
   */
  slugify: function(str) {
    if (typeof str !== 'string') return str;
    return Utils.removeAccents(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  },

  /**
   * Parse URL query parameters
   */
  parseQueryParams: function() {
    var params = {};
    var queryString = window.location.search.slice(1);
    if (queryString) {
      queryString.split('&').forEach(function(param) {
        var pair = param.split('=');
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1] || '');
        params[key] = value;
      });
    }
    return params;
  },

  /**
   * Armazena dados no localStorage com JSON
   */
  localStorageSet: function(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Utils] Erro ao salvar no localStorage:', e);
      return false;
    }
  },

  /**
   * Recupera dados do localStorage
   */
  localStorageGet: function(key, defaultValue) {
    try {
      var item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('[Utils] Erro ao ler do localStorage:', e);
      return defaultValue;
    }
  },

  /**
   * Remove item do localStorage
   */
  localStorageRemove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('[Utils] Erro ao remover do localStorage:', e);
      return false;
    }
  },

  /**
   * Renderização de cards para ferramentas
   */
  renderCard: function(tool, state, sectionType) {
    // Define classe de cor baseada no tipo
    var colorClass = 'color-blue';
    if (tool.color) {
      colorClass = 'color-' + tool.color;
    } else if (tool.type === 'calculator') {
      colorClass = 'color-emerald';
    } else if (tool.type === 'scale') {
      colorClass = 'color-blue';
    } else if (tool.type === 'other') {
      colorClass = 'color-amber';
    }

    // Determina ícone baseado no tipo ou usa o fornecido
    var icon = tool.icon || 'fas fa-tools';
    if (tool.type === 'calculator') icon = icon || 'fas fa-calculator';
    if (tool.type === 'scale') icon = icon || 'fas fa-clipboard-list';

    // Determina texto da tag baseada na seção
    var sectionTag = '';
    var buttonText = 'Acessar';
    var buttonIcon = 'fas fa-external-link-alt mr-2';
    
    if (sectionType === 'calculator') {
      sectionTag = '<span class="section-tag">Calculadoras</span>';
      buttonIcon = 'fas fa-calculator mr-2';
      buttonText = 'Calcular';
    } else if (sectionType === 'scale') {
      sectionTag = '<span class="section-tag">Escalas</span>';
      buttonIcon = 'fas fa-clipboard-list mr-2';
      buttonText = 'Classificar';
    } else if (sectionType === 'other') {
      sectionTag = '<span class="section-tag">Informação</span>';
      buttonIcon = 'fas fa-calendar-check mr-2';
      buttonText = 'Consultar';
    }

    // Template do card
    var html = 
      '<div class="tool-card ' + colorClass + '" data-id="' + Utils.escapeHTML(tool.id || '') + '" data-type="' + Utils.escapeHTML(tool.type || '') + '">' +
        sectionTag +
        '<div class="card-icon-wrapper">' +
          '<i class="' + icon + '"></i>' +
        '</div>' +
        '<h3>' + Utils.escapeHTML(tool.name) + '</h3>' +
        '<p class="description">' + Utils.escapeHTML(tool.description) + '</p>' +
        '<div class="card-footer">' +
          '<a href="' + Utils.escapeHTML(tool.filename) + '" class="btn btn-primary" aria-label="' + buttonText + ' ' + Utils.escapeHTML(tool.name) + '">' +
            '<i class="' + buttonIcon + '"></i>' + buttonText +
          '</a>' +
        '</div>' +
      '</div>';

    return html;
  },

  /**
   * Renderização de card em modo lista
   */
  renderCardList: function(tool) {
    var colorClass = tool.color ? 'color-' + tool.color : 'color-blue';
    
    return (
      '<div class="list-card ' + colorClass + '">' +
        '<h3>' + Utils.escapeHTML(tool.name) + '</h3>' +
        '<p class="category">' + Utils.escapeHTML(tool.category) + '</p>' +
        '<p class="description">' + Utils.escapeHTML(tool.description) + '</p>' +
        '<a href="' + Utils.escapeHTML(tool.filename) + '" class="button">Acessar</a>' +
      '</div>'
    );
  },

  /**
   * Loading indicator
   */
  showLoading: function(container, message) {
    message = message || 'Carregando...';
    container.innerHTML = 
      '<div class="loading-state">' +
        '<i class="fas fa-spinner fa-spin"></i>' +
        '<p>' + Utils.escapeHTML(message) + '</p>' +
      '</div>';
  },

  /**
   * Mensagem de estado vazio
   */
  showEmpty: function(container, message, icon) {
    icon = icon || 'fa-search';
    message = message || 'Nenhum resultado encontrado';
    container.innerHTML = 
      '<div class="empty-state">' +
        '<i class="fas ' + icon + '"></i>' +
        '<h3>Nada encontrado</h3>' +
        '<p>' + Utils.escapeHTML(message) + '</p>' +
      '</div>';
  },

  /**
   * Mensagem de erro
   */
  showError: function(container, message) {
    message = message || 'Ocorreu um erro';
    container.innerHTML = 
      '<div class="error-state">' +
        '<i class="fas fa-exclamation-triangle"></i>' +
        '<h3>Ops!</h3>' +
        '<p>' + Utils.escapeHTML(message) + '</p>' +
      '</div>';
  }
};

// Expõe globalmente
window.Utils = Utils;