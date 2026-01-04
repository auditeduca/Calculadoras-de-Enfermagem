/**
 * UTILS.JS
 * Funções Utilitárias
 * Calculadoras de Enfermagem
 */

var Utils = {
  renderCard: function(e, t, a) {
    var n = this.isHighlighted(e, t) ? "highlighted" : "";
    var c = e.category.toLowerCase().replace(/\s+/g, "-");
    var i = this.getActionButtonText(a);
    var s = this.generateCategoryTags(e, a);
    
    return '<div class="tool-card ' + n + '" data-category="' + c + '">' +
      '<div class="tool-icon">' +
        '<i class="' + e.icon + '"></i>' +
      '</div>' +
      '<div class="tool-info">' +
        '<h3 class="tool-name">' + this.escapeHtml(e.name) + '</h3>' +
        '<span class="tool-category">' + this.escapeHtml(e.category) + '</span>' +
        '<p class="tool-description">' + this.escapeHtml(e.description) + '</p>' +
        s +
        '<a href="pages/' + e.filename + '" class="tool-button">' + i + '</a>' +
      '</div>' +
    '</div>';
  },
  
  getActionButtonText: function(e) {
    var texts = {
      calculator: "Calcular",
      scale: "Classificar",
      other: "Consultar"
    };
    return texts[e] || "Acessar";
  },
  
  generateCategoryTags: function(e, t) {
    var a = {
      calculator: "Calculadora",
      scale: "Escala",
      other: "Informação"
    };
    var r = {
      calculator: "blue",
      scale: "emerald",
      other: "amber"
    };
    
    return '<div class="tool-tags">' +
      '<span class="tool-type tag-' + (r[t] || "blue") + '">' + (a[t] || "Ferramenta") + '</span>' +
      '<span class="tool-category-tag">' + this.escapeHtml(e.category) + '</span>' +
    '</div>';
  },
  
  isHighlighted: function(e, t) {
    if (!t || !t.filterCategory || t.filterCategory === "all") return false;
    return e.category === t.filterCategory;
  },
  
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
  
  onReady: function(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  },
  
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
  
  escapeHtml: function(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
  
  formatDate: function(dateStr) {
    var date = new Date(dateStr);
    var options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return date.toLocaleDateString("pt-BR", options);
  },
  
  getUrlParam: function(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  
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
