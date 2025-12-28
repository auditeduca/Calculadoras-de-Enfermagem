/**
 * Template Engine v4.2 - Sistema Modular de Componentes
 * 
 * Correções implementadas:
 * - Configuração completa de todos os componentes (header, main-index, footer, modals)
 * - URLs corrigidas para compatibilidade com GitHub Pages
 * - Sistema de fallback robusto
 * - IDs corrigidos para bater com index.html
 * - Sistema de eventos para notificar quando componentes estão prontos
 * - Carregamento assíncrono com Promise.all
 * - Tratamento de erros robusto
 * - Suporte a baseUrl dinâmica
 */

class TemplateEngine {
  /**
   * URL base fixa para GitHub Pages
   */
  static get BASE_URL() {
    return 'https://auditeduca.github.io/Calculadoras-de-Enfermagem';
  }

  constructor() {
    // Configuração COMPLETA de todos os componentes
    this.components = {
      'header': {
        html: 'header.html',
        js: 'header.js',
        css: 'header.css',
        container: 'header-container'
      },
      'main-index': {
        html: 'main-index.html',
        container: 'main-container',
        js: 'global-main-index.js'
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
    this.componentsStatus = {};
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  /**
   * Inicializa o motor de templates
   */
  async init() {
    if (this.initialized) return this.readyPromise;
    
    console.log('[TemplateEngine] Inicializando sistema modular...');
    console.log('[TemplateEngine] Base URL:', TemplateEngine.BASE_URL);
    
    this.readyPromise = this._loadAllComponents();
    
    try {
      await this.readyPromise;
      this.initialized = true;
      
      // Dispara evento de sistema pronto
      window.dispatchEvent(new CustomEvent('TemplateEngine:Ready', { 
        detail: { 
          timestamp: Date.now(),
          components: this.componentsStatus
        } 
      }));
      
      console.log('[TemplateEngine] Todos os componentes carregados com sucesso!');
      console.log('[TemplateEngine] Status:', this.componentsStatus);
    } catch (error) {
      console.error('[TemplateEngine] Erro crítico na inicialização:', error);
      
      // Dispara evento de erro
      window.dispatchEvent(new CustomEvent('TemplateEngine:Error', { 
        detail: { error: error.message } 
      }));
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
    
    // Executa todos em paralelo, mas continua mesmo se algum falhar
    const results = await Promise.allSettled(loadPromises);
    
    // Registra status de cada componente
    results.forEach((result, index) => {
      const componentName = Object.keys(this.components)[index];
      this.componentsStatus[componentName] = result.status === 'fulfilled';
    });
  }

  /**
   * Carrega um componente individual
   */
  async _loadComponent(name, config) {
    console.log(`[TemplateEngine] Iniciando carregamento: ${name}`);
    
    const container = document.getElementById(config.container);
    
    if (!container) {
      console.error(`[TemplateEngine] Container '#${config.container}' não encontrado para '${name}'`);
      throw new Error(`Container não encontrado: ${config.container}`);
    }

    try {
      // Determina o caminho do HTML baseado no tipo de componente
      let htmlPath;
      if (name === 'main-index') {
        // main-index.html está em assets/pages/
        htmlPath = `assets/pages/${config.html}`;
      } else {
        // Outros componentes estão em assets/components/
        htmlPath = `assets/components/${config.html}`;
      }
      
      // Tenta carregar com a URL base
      const htmlUrl = this._buildUrl(htmlPath);
      console.log(`[TemplateEngine] Buscando HTML: ${htmlUrl}`);
      
      const response = await fetch(htmlUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      container.innerHTML = html;
      console.log(`[TemplateEngine] HTML de '${name}' injetado no container`);
      
      // Carrega o CSS do componente (se existir)
      if (config.css) {
        await this._loadCSS(name, config.css);
      }
      
      // Carrega o JS do componente (se existir) - APÓS o HTML estar no DOM
      if (config.js) {
        await this._loadScript(name, config.js);
      }
      
      console.log(`[TemplateEngine] Componente '${name}' carregado com sucesso`);
      
      // Dispara evento específico do componente
      window.dispatchEvent(new CustomEvent(`Component:${name}:Loaded`, {
        detail: { component: name, container: config.container }
      }));
      
    } catch (error) {
      console.warn(`[TemplateEngine] Falha ao carregar '${name}' via fetch:`, error.message);
      
      // Fallback: tentar carregar como módulo inline
      await this._loadComponentFallback(name, config);
    }
  }

  /**
   * Constrói URL absoluta
   */
  _buildUrl(path) {
    // Se já for uma URL completa, retorna como está
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove barras duplicadas
    const cleanPath = path.replace(/^\//, '');
    return `${TemplateEngine.BASE_URL}/${cleanPath}`;
  }

  /**
   * Fallback para carregar componente quando fetch falha
   */
  async _loadComponentFallback(name, config) {
    const container = document.getElementById(config.container);
    if (!container) {
      console.error(`[TemplateEngine] Container não encontrado no fallback: ${config.container}`);
      return;
    }

    console.log(`[TemplateEngine] Tentando fallback para '${name}'`);

    try {
      // Caminhos absolutos alternativos
      const fallbackPaths = [
        `assets/components/${config.html}`,
        `/${config.html}`,
        `./${config.html}`
      ];
      
      let htmlContent = null;
      
      // Tenta cada caminho alternativo
      for (const path of fallbackPaths) {
        try {
          const url = this._buildUrl(path);
          console.log(`[TemplateEngine] Tentando fallback path: ${url}`);
          
          const response = await fetch(url);
          if (response.ok) {
            htmlContent = await response.text();
            console.log(`[TemplateEngine] Fallback bem-sucedido via: ${path}`);
            break;
          }
        } catch (e) {
          // Continua para o próximo caminho
          console.log(`[TemplateEngine] Fallback path falhou: ${path}`);
        }
      }
      
      if (htmlContent) {
        container.innerHTML = htmlContent;
        
        // Tenta carregar CSS e JS do fallback
        if (config.css) {
          setTimeout(() => this._loadCSS(name, config.css), 100);
        }
        if (config.js) {
          setTimeout(() => this._loadScript(name, config.js), 200);
        }
        
        console.log(`[TemplateEngine] Componente '${name}' carregado via fallback`);
        return;
      }
      
      // Se todos os caminhos falharem, usa conteúdo embutido
      throw new Error('Todos os caminhos de fallback falharam');
      
    } catch (error) {
      console.error(`[TemplateEngine] Falha definitiva ao carregar '${name}':`, error.message);
      
      // Último recurso: mostrar mensagem de erro ou conteúdo mínimo
      this._showErrorState(container, name);
    }
  }

  /**
   * Mostra estado de erro no container
   */
  _showErrorState(container, componentName) {
    const errorMessages = {
      'header': 'Cabeçalho não disponível. A navegação pode estar limitada.',
      'footer': 'Rodapé não disponível.',
      'modals': 'Modais não disponíveis.',
      'main-index': 'Conteúdo principal não disponível.'
    };
    
    const message = errorMessages[componentName] || 'Componente não disponível';
    
    container.innerHTML = `
      <div class="component-error" style="padding: 20px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; margin: 10px;">
        <p style="color: #b91c1c; margin: 0;">
          <strong>Aviso:</strong> ${message}<br>
          <small>Recarregue a página ou tente novamente mais tarde.</small>
        </p>
      </div>
    `;
  }

  /**
   * Carrega um arquivo CSS
   */
  async _loadCSS(componentName, cssFile) {
    const cssUrl = this._buildUrl(`assets/css/${cssFile}`);
    
    // Evita carregar o mesmo CSS múltiplas vezes
    if (document.querySelector(`link[href="${cssUrl}"]`)) {
      console.log(`[TemplateEngine] CSS já carregado: ${cssUrl}`);
      return;
    }
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      link.onload = () => {
        console.log(`[TemplateEngine] CSS carregado: ${cssUrl}`);
        resolve();
      };
      link.onerror = (error) => {
        console.warn(`[TemplateEngine] Falha ao carregar CSS: ${cssUrl}`, error);
        // Resolve mesmo com erro para não bloquear o fluxo
        resolve();
      };
      
      document.head.appendChild(link);
    });
  }

  /**
   * Carrega um arquivo JS
   */
  async _loadScript(componentName, jsFile) {
    const scriptUrl = this._buildUrl(`assets/js/${jsFile}`);
    
    // Evita carregar o mesmo script múltiplas vezes
    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      console.log(`[TemplateEngine] Script já carregado: ${scriptUrl}`);
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      
      // Configuração para scripts de componentes
      script.async = false;
      script.defer = true;
      
      script.onload = () => {
        console.log(`[TemplateEngine] JS carregado: ${scriptUrl}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.warn(`[TemplateEngine] Falha ao carregar script: ${scriptUrl}`, error);
        // Resolve mesmo com erro para não bloquear outros componentes
        resolve();
      };
      
      // Adiciona ao body para garantir que o DOM esteja disponível
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
    return `
      <div class="tool-card" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
        <h3 style="color: #1A3E74; margin-top: 0;">${tool.name || 'Ferramenta'}</h3>
        <p style="color: #6b7280;">${tool.description || 'Descrição não disponível'}</p>
      </div>
    `;
  }

  /**
   * Verifica se um componente foi carregado
   */
  isComponentLoaded(componentName) {
    return this.componentsStatus[componentName] === true;
  }

  /**
   * Obtém status de todos os componentes
   */
  getComponentsStatus() {
    return { ...this.componentsStatus };
  }

  /**
   * Recarrega um componente específico
   */
  async reloadComponent(componentName) {
    const config = this.components[componentName];
    if (!config) {
      throw new Error(`Componente não configurado: ${componentName}`);
    }
    
    console.log(`[TemplateEngine] Recarregando componente: ${componentName}`);
    await this._loadComponent(componentName, config);
  }
}

// Inicializa imediatamente se possível
let templateEngineInstance = null;

function initializeTemplateEngine() {
  if (!templateEngineInstance) {
    templateEngineInstance = new TemplateEngine();
    
    // Expõe globalmente
    window.templateEngine = templateEngineInstance;
    window.TemplateEngine = TemplateEngine;
    
    // Adiciona métodos globais de conveniência
    window.loadComponent = async (name) => {
      if (templateEngineInstance) {
        return templateEngineInstance.reloadComponent(name);
      }
    };
    
    window.getComponentStatus = () => {
      if (templateEngineInstance) {
        return templateEngineInstance.getComponentsStatus();
      }
      return {};
    };
  }
  
  return templateEngineInstance;
}

// Tenta inicializar imediatamente
if (document.readyState !== 'loading') {
  setTimeout(() => initializeTemplateEngine(), 100);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initializeTemplateEngine(), 100);
  });
}

// Exporta para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateEngine, initializeTemplateEngine };
}