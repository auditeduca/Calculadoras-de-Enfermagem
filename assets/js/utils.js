/**
 * UTILS.JS
 * Funções Utilitárias
 * Calculadoras de Enfermagem
 */

const Utils = {
  renderCard: function(e, t, a) {
    const n = this.isHighlighted(e, t) ? "highlighted" : "",
          c = e.category.toLowerCase().replace(/\s+/g, "-"),
          i = this.getActionButtonText(a),
          s = this.generateCategoryTags(e, a);
    
    return `
      <div class="tool-card ${n}" data-category="${c}">
        <div class="tool-icon">
          <i class="${e.icon}"></i>
        </div>
        <div class="tool-info">
          <h3 class="tool-name">${this.escapeHtml(e.name)}</h3>
          <span class="tool-category">${this.escapeHtml(e.category)}</span>
          <p class="tool-description">${this.escapeHtml(e.description)}</p>
          ${s}
          <a href="pages/${e.filename}" class="tool-button">${i}</a>
        </div>
      </div>
    `;
  },
  
  getActionButtonText: function(e) {
    return {
      calculator: "Calcular",
      scale: "Classificar",
      other: "Consultar"
    }[e] || "Acessar";
  },
  
  generateCategoryTags: function(e, t) {
    const a = {
      calculator: "Calculadora",
      scale: "Escala",
      other: "Informação"
    };
    const r = {
      calculator: "blue",
      scale: "emerald",
      other: "amber"
    };
    
    return `
      <div class="tool-tags">
        <span class="tool-type tag-${r[t] || "blue"}">${a[t] || "Ferramenta"}</span>
        <span class="tool-category-tag">${this.escapeHtml(e.category)}</span>
      </div>
    `;
  },
  
  isHighlighted: function(e, t) {
    return !t || !t.filterCategory || t.filterCategory === "all" ? false : e.category === t.filterCategory;
  },
  
  debounce: function(e, t) {
    let a;
    return function(...n) {
      const c = () => {
        clearTimeout(a);
        e(...n);
      };
      clearTimeout(a);
      a = setTimeout(c, t);
    };
  },
  
  throttle: function(e, t) {
    let a;
    return function(...n) {
      a || (e(...n), a = true, setTimeout(() => a = false, t));
    };
  },
  
  onReady: function(e) {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", e) : e();
  },
  
  createElement: function(e, t = {}, a = "") {
    const r = document.createElement(e);
    
    Object.entries(t).forEach(([n, c]) => {
      if (n === "className") {
        r.className = c;
      } else if (n.startsWith("on") && typeof c === "function") {
        r.addEventListener(n.slice(2).toLowerCase(), c);
      } else {
        r.setAttribute(n, c);
      }
    });
    
    if (a instanceof HTMLElement) {
      r.appendChild(a);
    } else if (a) {
      r.innerHTML = a;
    }
    
    return r;
  },
  
  escapeHtml: function(e) {
    const t = document.createElement("div");
    t.textContent = e;
    return t.innerHTML;
  },
  
  formatDate: function(e) {
    return new Date(e).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  },
  
  getUrlParam: function(e) {
    return new URLSearchParams(window.location.search).get(e);
  },
  
  scrollTo: function(e, t = 0) {
    const a = typeof e === "string" ? document.querySelector(e) : e;
    if (a) {
      const r = a.getBoundingClientRect(),
            n = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: r.top + n - t,
        behavior: "smooth"
      });
    }
  },
  
  async copyToClipboard: function(e) {
    try {
      return await navigator.clipboard.writeText(e), true;
    } catch {
      return false;
    }
  },
  
  isElementInViewport: function(e) {
    const t = e.getBoundingClientRect();
    return t.top >= 0 && t.left >= 0 && t.bottom <= (window.innerHeight || document.documentElement.clientHeight) && t.right <= (window.innerWidth || document.documentElement.clientWidth);
  }
};

window.Utils = Utils;