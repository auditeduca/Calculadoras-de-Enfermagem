/**
 * Template Engine v4.0 - Sistema Modular de Componentes
 * 
 * Correções implementadas:
 * - IDs corrigidos para bater com index.html (header-container, footer-container, modals-container)
 * - Sistema de eventos para notificar quando componentes estão prontos
 * - Carregamento assíncrono com Promise.all
 * - Tratamento de erros robusto
 * - Suporte a baseUrl dinâmica para GitHub Pages
 */

class TemplateEngine {
  constructor() {
    this.components = {
      'header': {
        html: 'header.html',
        js: 'header.js',
        css: 'header.css',
        container: 'header-container'
      },
      'footer': {
        html: 'footer.html',
        js: 'footer.js',
        css: 'footer.css',
        container: 'footer-container'
      },
      'modals': {
        html: 'modals-main.html',
        js: 'modals.js',
        css: 'modals.css',
        container: 'modals-container'
      }
    };
    
    this.initialized = false;
    this.readyPromise = null;
    this.baseUrl = this._detectBaseUrl();
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Detecta a URL base automaticamente
   */
  _detectBaseUrl() {
    const path = window.location.pathname;
    const repoName = '/Calculadoras-de-Enfermagem';
    
    // Se estiver no GitHub Pages
    if (path.includes(repoName)) {
      return repoName;
    }
    
    // Se for desenvolvimento local
    if (path === '/' || path.endsWith('.html')) {
      return '';
    }
    
    // Extrai o diretório base do arquivo atual
    const lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash) : '';
  }

  /**
   * Inicializa o motor de templates
   */
  async init() {
    if (this.initialized) return this.readyPromise;
    
    console.log('[TemplateEngine] Inicializando sistema modular...');
    console.log('[TemplateEngine] Base URL detectada:', this.baseUrl);
    
    this.readyPromise = this._loadAllComponents();
    
    try {
      await this.readyPromise;
      this.initialized = true;
      
      // Dispara evento de sistema pronto
      window.dispatchEvent(new CustomEvent('TemplateEngine:Ready', { 
        detail: { timestamp: Date.now() } 
      }));
      
      console.log('[TemplateEngine] Todos os componentes carregados com sucesso!');
    } catch (error) {
      console.error('[TemplateEngine] Erro crítico na inicialização:', error);
    }
    
    return this.readyPromise;
  }

  /**
   * Carrega todos os componentes em paralelo
   */
  async _loadAllComponents() {
    const loadPromises = [];
    
    for (const [name, config] of Object.entries(this.components)) {
      loadPromises.push(this._loadComponent(name, config));
    }
    
    await Promise.all(loadPromises);
  }

  /**
   * Carrega um componente individual
   */
  async _loadComponent(name, config) {
    const container = document.getElementById(config.container);
    
    if (!container) {
      console.warn(`[TemplateEngine] Container '#${config.container}' não encontrado para '${name}'`);
      return;
    }

    console.log(`[TemplateEngine] Carregando componente: ${name}`);
    
    try {
      // Determina o caminho base baseado na pasta do componente
      let htmlPath;
      if (name === 'main') {
        // main-index.html está em assets/pages/
        htmlPath = `assets/pages/${config.html}`;
      } else {
        // Outros componentes estão em assets/components/
        htmlPath = `assets/components/${config.html}`;
      }
      
      // Carrega o HTML do componente
      const htmlUrl = `${this.baseUrl}${htmlPath}`;
      const response = await fetch(htmlUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      container.innerHTML = html;
      
      // Carrega o CSS do componente (se existir)
      if (config.css) {
        this._loadCSS(`${this.baseUrl}assets/css/${config.css}`);
      }
      
      // Carrega o JS do componente (se existir)
      if (config.js) {
        await this._loadScript(`${this.baseUrl}assets/js/${config.js}`);
      }
      
      console.log(`[TemplateEngine] Componente '${name}' carregado com sucesso`);
      
    } catch (error) {
      console.warn(`[TemplateEngine] Falha ao carregar '${name}':`, error.message);
      // Não lança erro para não bloquear outros componentes
    }
  }

  /**
   * Carrega um arquivo CSS
   */
  _loadCSS(href) {
    // Evita carregar o mesmo CSS múltiplas vezes
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    
    console.log(`[TemplateEngine] CSS carregado: ${href}`);
  }

  /**
   * Carrega um arquivo JS como módulo
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      // Evita carregar o mesmo script múltiplas vezes
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`[TemplateEngine] Script já carregado: ${src}`);
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.defer = true;
      script.type = 'module';
      
      script.onload = () => {
        console.log(`[TemplateEngine] JS carregado: ${src}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.warn(`[TemplateEngine] Falha ao carregar script: ${src}`);
        // Resolve mesmo com erro para não bloquear outros componentes
        resolve();
      };
      
      document.body.appendChild(script);
    });
  }

  /**
   * Método utilitário para renderizar cards (delegado para Utils)
   */
  renderCard(tool, state = {}) {
    if (typeof window.Utils !== 'undefined' && typeof window.Utils.renderCard === 'function') {
      return window.Utils.renderCard(tool, state);
    }
    
    // Fallback simples caso Utils não esteja pronto
    return `<div class="tool-card"><h3>${tool.name}</h3><p>${tool.description}</p></div>`;
  }
}

// Cria instância única e expõe globalmente
window.templateEngine = new TemplateEngine();
window.TemplateEngine = window.templateEngine;
