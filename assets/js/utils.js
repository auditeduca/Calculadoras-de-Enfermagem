/**
 * UTILS.JS
 * Funcoes Utilitarias
 * Calculadoras de Enfermagem
 */

var Utils = {
  /**
   * Renderiza um card de ferramenta
   * @param {Object} tool - Dados da ferramenta
   * @param {Object} sectionState - Estado da secao (viewMode, showIcons, etc)
   * @param {string} type - Tipo da ferramenta (calculator, scale, other)
   */
  renderCard: function(tool, sectionState, type) {
    var highlighted = this.isHighlighted(tool, sectionState) ? "highlighted" : "";
    var categoryClass = tool.category.toLowerCase().replace(/\s+/g, "-");
    var actionHtml = this.getActionButton(type);
    var iconHtml = '';
    
    // Verifica se deve mostrar icones
    if (sectionState.showIcons !== false) {
      iconHtml = '<div class="tool-icon"><i class="' + tool.icon + '"></i></div>';
    }
    
    return '<a href="pages/' + tool.filename + '" class="tool-card ' + highlighted + '" data-category="' + categoryClass + '">' +
      iconHtml +
      '<div class="tool-info">' +
        '<h3 class="tool-name">' + this.escapeHtml(tool.name) + '</h3>' +
        '<p class="tool-description">' + this.escapeHtml(tool.description) + '</p>' +
        actionHtml +
      '</div>' +
    '</a>';
  },
  
  /**
   * Retorna o botao de acao com icone e estilo
   */
  getActionButton: function(type) {
    var icons = {
      calculator: "fas fa-calculator",
      scale: "fas fa-clipboard-list",
      other: "fas fa-calendar-check"
    };
    
    var texts = {
      calculator: "Calcular",
      scale: "Classificar",
      other: "Consultar"
    };
    
    var iconClass = icons[type] || "fas fa-arrow-right";
    var text = texts[type] || "Acessar";
    
    return '<span class="tool-action-btn"><i class="' + iconClass + '"></i> ' + text + '</span>';
  },
  
  /**
   * Verifica se o card deve ser destacado
   */
  isHighlighted: function(tool, sectionState) {
    if (!sectionState || !sectionState.filterCategory || sectionState.filterCategory === "all") return false;
    return tool.category === sectionState.filterCategory;
  },
  
  /**
   * Debounce - Atraso na execução da função
   */
  debounce: function(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  },
  
  /**
   * Throttle - Limita a frequência de execução
   */
  throttle: function(func, limit) {
    var inThrottle;
    return function() {
      var args = arguments;
      var context = this;
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
   * Callback quando o DOM está pronto
   */
  onReady: function(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  },
  
  /**
   * Cria um elemento DOM
   */
  createElement: function(tag, attributes, children) {
    var element = document.createElement(tag);
    
    if (attributes) {
      Object.keys(attributes).forEach(function(key) {
        if (key === "className") {
          element.className = attributes[key];
        } else if (key.indexOf("on") === 0 && typeof attributes[key] === "function") {
          element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
        } else {
          element.setAttribute(key, attributes[key]);
        }
      });
    }
    
    if (children) {
      if (children instanceof HTMLElement) {
        element.appendChild(children);
      } else if (typeof children === "string") {
        element.innerHTML = children;
      }
    }
    
    return element;
  },
  
  /**
   * Escapa caracteres HTML
   */
  escapeHtml: function(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
  
  /**
   * Formata uma data
   */
  formatDate: function(dateStr) {
    var date = new Date(dateStr);
    var options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return date.toLocaleDateString("pt-BR", options);
  },
  
  /**
   * Obtém parâmetro da URL
   */
  getUrlParam: function(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  
  /**
   * Scroll suave até um elemento
   */
  scrollTo: function(target, offset) {
    var element;
    if (typeof target === "string") {
      element = document.querySelector(target);
    } else {
      element = target;
    }
    
    if (element) {
      var rect = element.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var targetTop = rect.top + scrollTop - (offset || 0);
      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });
    }
  },
  
  /**
   * Copia texto para o clipboard
   */
  copyToClipboard: function(text) {
    return new Promise(function(resolve) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          resolve(true);
        }).catch(function() {
          resolve(false);
        });
      } else {
        resolve(false);
      }
    });
  },
  
  /**
   * Verifica se o elemento está visível na viewport
   */
  isElementInViewport: function(el) {
    var rect = el.getBoundingClientRect();
    var winHeight = window.innerHeight || document.documentElement.clientHeight;
    var winWidth = window.innerWidth || document.documentElement.clientWidth;
    return rect.top >= 0 && 
           rect.left >= 0 && 
           rect.bottom <= winHeight && 
           rect.right <= winWidth;
  }
};

// Export to global scope
if (typeof window !== "undefined") {
  window.Utils = Utils;
}
