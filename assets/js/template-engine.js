/**
 * TEMPLATE ENGINE
 * Sistema de Injeção de Componentes Modular
 * Versão: 2.2 - Integração Corrigida
 *
 * Responsável por:
 * - Carregar e injetar componentes HTML dinamicamente
 * - Gerenciar a ordem de carregamento
 * - Sincronizar inicialização dos módulos JS
 * - Disparar eventos globais de lifecycle
 */
class TemplateEngine {
  constructor() {
    this.components = new Map();
    this.loadedComponents = new Set();
    this.isInitialized = false;
    this.basePath = '';
    this.moduleInitializers = new Map();
    // Callback para quando todos os componentes estiverem carregados
    this.onReadyCallback = null;
    // Mapeamento de módulos JS para componentes (sem path fixo - será construído dinamicamente)
    this.moduleMapping = {
      'header': { module: 'HeaderEngine', initializer: 'init' },
      'footer': { module: 'FooterManager', initializer: 'initFooter' },
      'modals': { module: 'ModalSystem', initializer: 'init' },
      'preload': { module: 'LoadingScreen', initializer: 'init' }
    };
  }

  /**
   * Configura o caminho base para os componentes
   * @param {string} path - Caminho base
   */
  setBasePath(path) {
    this.basePath = path.replace(/\/$/, '');
  }

  /**
   * Registra um componente para carregamento
   * @param {string} name - Nome do componente
   * @param {string} filePath - Caminho do arquivo HTML
   * @param {string} targetSelector - Seletor onde injetar
   * @param {Object} options - Opções adicionais
   */
  registerComponent(name, filePath, targetSelector, options = {}) {
    this.components.set(name, {
      filePath,
      targetSelector,
      loaded: false,
      ...options
    });
    // Registrar módulo JS associado se existir
    if (options.modulePath && this.moduleMapping[name]) {
      this.moduleMapping[name].path = options.modulePath;
    }
  }

  /**
   * Carrega um componente individual via Fetch
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise} HTML do componente
   */
  async fetchComponent(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`[TemplateEngine] Erro ao carregar ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Aguarda até que um elemento exista no DOM
   * @param {string} selector - Seletor do elemento
   * @param {number} timeout - Tempo máximo de espera em ms
   * @returns {Promise<Element>}
   */
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Verificar se já existe
      const existingElement = document.querySelector(selector);
      if (existingElement) {
        resolve(existingElement);
        return;
      }

      // Criar observer para detectar quando o elemento for adicionado
      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout
      setTimeout(() => {
        observer.disconnect();
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else {
          reject(new Error(`Timeout: Elemento ${selector} não encontrado`));
        }
      }, timeout);
    });
  }

  /**
   * Carrega e injeta um componente no DOM com sincronização melhorada
   * @param {string} name - Nome do componente
   * @returns {Promise} Sucesso da operação
   */
  async loadComponent(name) {
    const component = this.components.get(name);
    if (!component) {
      console.warn(`[TemplateEngine] Componente não registrado: ${name}`);
      return false;
    }

    console.log(`[TemplateEngine] Carregando componente: ${name}`);

    // Se já foi carregado, não carregar novamente
    if (component.loaded) {
      console.log(`[TemplateEngine] Componente '${name}' já carregado anteriormente`);
      return true;
    }

    // Se o componente já tem HTML inline (para desenvolvimento)
    const inlineElement = document.getElementById(`inline-${name}`);
    if (inlineElement) {
      // Aguardar o container existir
      try {
        await this.waitForElement(component.targetSelector, 3000);
      } catch (error) {
        console.warn(`[TemplateEngine] Container não encontrado para '${name}':`, error.message);
        return false;
      }

      const target = document.querySelector(component.targetSelector);
      target.innerHTML = inlineElement.innerHTML;
      inlineElement.remove();
      
      // Sincronização: Aguardar um tick do navegador para garantir que o DOM foi atualizado
      await new Promise(resolve => setTimeout(resolve, 0));
      
      component.loaded = true;
      this.loadedComponents.add(name);
      
      // Disparar evento específico indicando que este componente está pronto
      window.dispatchEvent(new CustomEvent(`TemplateEngine:${name}:Ready`, {
        detail: { 
          component: name,
          container: component.targetSelector,
          timestamp: Date.now()
        }
      }));
      
      console.log(`[TemplateEngine] Componente '${name}' carregado e pronto`);
      return true;
    }

    // Aguardar o container existir antes de carregar via Fetch
    try {
      await this.waitForElement(component.targetSelector, 3000);
    } catch (error) {
      console.warn(`[TemplateEngine] Container não encontrado para '${name}':`, error.message);
      return false;
    }

    // Carregar via Fetch
    const html = await this.fetchComponent(component.filePath);
    if (html) {
      const target = document.querySelector(component.targetSelector);
      if (!target) {
        console.warn(`[TemplateEngine] Alvo não encontrado após espera: ${component.targetSelector}`);
        return false;
      }
      
      target.innerHTML = html;
      
      // Sincronização: Aguardar um tick do navegador para garantir que o DOM foi atualizado
      await new Promise(resolve => setTimeout(resolve, 0));
      
      component.loaded = true;
      this.loadedComponents.add(name);
      
      console.log(`[TemplateEngine] Componente '${name}' carregado e pronto`);
      
      // Disparar evento específico indicando que este componente está pronto
      window.dispatchEvent(new CustomEvent(`TemplateEngine:${name}:Ready`, {
        detail: { 
          component: name,
          container: component.targetSelector,
          timestamp: Date.now()
        }
      }));
      
      return true;
    }
    return false;
  }

  /**
   * Carrega todos os componentes registrados
   * @param {Object} order - Ordem específica de carregamento
   * @returns {Promise}
   */
  async loadAll(order = null) {
    console.log('[TemplateEngine] Iniciando carregamento de componentes...');
    // Se há uma ordem específica, carregar nessa ordem
    if (order && order.sequence) {
      for (const name of order.sequence) {
        await this.loadComponent(name);
      }
    } else {
      // Carregar em ordem padrão de prioridade
      const priorityOrder = ['preload', 'header', 'modals', 'footer'];
      const regularComponents = [];
      for (const [name] of this.components) {
        if (!priorityOrder.includes(name)) {
          regularComponents.push(name);
        }
      }
      // Carregar na ordem de prioridade
      for (const name of priorityOrder) {
        if (this.components.has(name)) {
          await this.loadComponent(name);
        }
      }
      // Carregar demais componentes
      for (const name of regularComponents) {
        await this.loadComponent(name);
      }
    }
    console.log(`[TemplateEngine] Componentes carregados: ${Array.from(this.loadedComponents).join(', ')}`);
  }

  /**
   * Inicializa o módulo JS associado a um componente
   * @param {string} name - Nome do componente
   */
  async initializeModule(name) {
    const mapping = this.moduleMapping[name];
    if (!mapping) return;
    
    // Usar o path registrado ou construir a partir do basePath
    let scriptPath = mapping.path;
    if (!scriptPath) {
      // Fallback: construir path baseado no nome do componente
      scriptPath = `${this.basePath}assets/js/${name}.js`;
    }
    
    try {
      // Carregar script do módulo se ainda não estiver carregado
      if (!this.isModuleLoaded(mapping.module)) {
        console.log(`[TemplateEngine] Carregando script: ${scriptPath}`);
        await this.loadModuleScript(scriptPath);
        
        // Sincronização: Aguardar um tick após carregar o JS
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      // Inicializar módulo
      const moduleObj = window[mapping.module];
      if (moduleObj && typeof moduleObj[mapping.initializer] === 'function') {
        moduleObj[mapping.initializer]();
        console.log(`[TemplateEngine] Módulo ${mapping.module} inicializado`);
      } else if (moduleObj && typeof moduleObj.init === 'function') {
        // Fallback para inicializadores com nome diferente
        moduleObj.init();
        console.log(`[TemplateEngine] Módulo ${mapping.module} inicializado (via init)`);
      }
    } catch (error) {
      console.error(`[TemplateEngine] Erro ao inicializar módulo ${name}:`, error);
    }
  }

  /**
   * Verifica se um módulo já foi carregado
   * @param {string} moduleName - Nome do módulo
   * @returns {boolean}
   */
  isModuleLoaded(moduleName) {
    return typeof window[moduleName] !== 'undefined';
  }

  /**
   * Carrega um script de módulo dinamicamente
   * @param {string} scriptPath - Caminho do script
   * @returns {Promise}
   */
  async loadModuleScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.async = false; // Carregar de forma síncrona para garantir ordem
      script.onload = () => resolve();
      script.onerror = (error) => {
        console.error(`[TemplateEngine] Erro ao carregar script: ${scriptPath}`, error);
        reject(new Error(`Falha ao carregar: ${scriptPath}`));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Inicializa todos os módulos JS na ordem correta
   */
  async initializeAllModules() {
    const moduleOrder = ['header', 'modals', 'footer', 'preload'];
    console.log('[TemplateEngine] Inicializando módulos JS...');
    
    for (const name of moduleOrder) {
      if (this.components.has(name)) {
        console.log(`[TemplateEngine] Processando módulo: ${name}`);
        await this.initializeModule(name);
      }
    }
  }

  /**
   * Verifica se um componente específico foi carregado
   * @param {string} name - Nome do componente
   * @returns {boolean}
   */
  isComponentLoaded(name) {
    return this.loadedComponents.has(name);
  }

  /**
   * Obtém o status de todos os componentes
   * @returns {Object}
   */
  getStatus() {
    const status = {};
    for (const [name, component] of this.components) {
      status[name] = {
        loaded: component.loaded,
        target: component.targetSelector
      };
    }
    return status;
  }

  /**
   * Callback quando todos os componentes estiverem prontos
   * @param {Function} callback - Função de callback
   */
  onReady(callback) {
    this.onReadyCallback = callback;
    // Se já estiver inicializado, chamar imediatamente
    if (this.isInitialized) {
      callback();
    }
  }

  /**
   * Finaliza a inicialização e dispara eventos
   */
  markAsReady() {
    this.isInitialized = true;
    console.log('[TemplateEngine] Todos os componentes estão prontos');
    // Disparar evento global
    window.dispatchEvent(new CustomEvent('TemplateEngine:Ready'));
    // Chamar callback se existir
    if (this.onReadyCallback) {
      this.onReadyCallback();
    }
  }

  /**
   * Remove um componente do DOM e da memória
   * @param {string} name - Nome do componente
   */
  unloadComponent(name) {
    const component = this.components.get(name);
    if (component && component.loaded) {
      const target = document.querySelector(component.targetSelector);
      if (target) {
        target.innerHTML = '';
      }
      component.loaded = false;
      this.loadedComponents.delete(name);
      console.log(`[TemplateEngine] Componente descarregado: ${name}`);
    }
  }
}

// Instância global do Template Engine
window.templateEngine = new TemplateEngine();

// Função helper para carregamento simplificado
async function loadTemplates() {
  await window.templateEngine.loadAll();
}

// Função helper para inicializar módulos
async function initializeModules() {
  await window.templateEngine.initializeAllModules();
}

// Função principal de inicialização completa
async function initializeSite() {
  console.log('[TemplateEngine] Inicializando site...');
  
  // 1. Aguardar containers existirem no DOM
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 2. Carregar todos os componentes
  await window.templateEngine.loadAll();
  
  // 3. Inicializar módulos JS
  await window.templateEngine.initializeAllModules();
  
  // 4. Marcar como pronto
  window.templateEngine.markAsReady();
  
  // 5. Inicializar conteúdo principal se existir
  if (typeof window.MainIndexLoader !== 'undefined') {
    window.MainIndexLoader.load();
  }
  
  console.log('[TemplateEngine] Site inicializado com sucesso');
}

// Configuração padrão de componentes
document.addEventListener('DOMContentLoaded', () => {
  // Configurar caminhos base
  const currentPath = window.location.pathname;
  let basePath = './';
  
  if (currentPath.includes('/Calculadoras-de-Enfermagem/')) {
    basePath = '/Calculadoras-de-Enfermagem/';
  } else if (currentPath.endsWith('/')) {
    basePath = currentPath;
  }
  
  window.templateEngine.setBasePath(basePath);
  console.log(`[TemplateEngine] BasePath configurado: ${basePath}`);

  // Registrar componentes padrão
  window.templateEngine.registerComponent(
    'preload',
    `${basePath}assets/components/preload.html`,
    '#preload-container',
    { modulePath: `${basePath}assets/js/preload.js` }
  );
  window.templateEngine.registerComponent(
    'header',
    `${basePath}assets/components/header.html`,
    '#header-container',
    { modulePath: `${basePath}assets/js/header.js` }
  );
  window.templateEngine.registerComponent(
    'modals',
    `${basePath}assets/components/modals.html`,
    '#modals-container',
    { modulePath: `${basePath}assets/js/modals.js` }
  );
  window.templateEngine.registerComponent(
    'footer',
    `${basePath}assets/components/footer.html`,
    '#footer-container',
    { modulePath: `${basePath}assets/js/footer.js` }
  );
  
  console.log('[TemplateEngine] Componentes registrados:', Array.from(window.templateEngine.components.keys()).join(', '));
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateEngine };
}
