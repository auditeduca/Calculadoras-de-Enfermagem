/**
 * TEMPLATE ENGINE
 * Sistema de Injeção de Componentes Modular
 * Versão: 3.0 - Integração Completa com Melhorias
 *
 * Baseado em melhores práticas de sistemas modulares
 * Responsável por:
 * - Carregar e injetar componentes HTML dinamicamente
 * - Gerenciar a ordem de carregamento com retry
 * - Sincronizar inicialização dos módulos JS
 * - Disparar eventos globais de lifecycle
 */
class TemplateEngine {
  constructor() {
    // Configuração de componentes (containerId -> path)
    this.config = {
      'preload-container': 'assets/components/preload.html',
      'header-container': 'assets/components/header.html',
      'modals-container': 'assets/components/modals.html',
      'footer-container': 'assets/components/footer.html'
    };
    
    // Configuração de estilos CSS (path -> ordem de carregamento)
    this.cssConfig = {
      'assets/css/header.css': 1,      // Header principal
      'assets/css/footer.css': 2,      // Footer
      'assets/css/modals.css': 3,      // Modais
      'assets/css/main.css': 10        // Estilos gerais (último)
    };
    
    // Mapeamento de módulos JS para componentes
    this.moduleMapping = {
      'header-container': { module: 'HeaderEngine', initializer: 'init', jsPath: 'assets/js/header.js' },
      'modals-container': { module: 'ModalSystem', initializer: 'init', jsPath: 'assets/js/modals.js' },
      'footer-container': { module: 'FooterManager', initializer: 'initFooter', jsPath: 'assets/js/footer.js' },
      'preload-container': { module: 'LoadingScreen', initializer: 'init', jsPath: 'assets/js/preload.js' }
    };
    
    this.componentsLoaded = false;
    this.modulesInitialized = false;
    this.cssLoaded = false;
    this.basePath = '';
    this.initPromise = null;
    
    // Singleton protection
    if (window.__TEMPLATE_ENGINE_INIT__) {
      return;
    }
    window.__TEMPLATE_ENGINE_INIT__ = true;
    
    // Auto-inicialização
    this.waitForDOM().then(() => {
      this.init();
    });
  }

  /**
   * Aguarda o DOM estar pronto
   * @returns {Promise}
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * Inicialização principal
   */
  async init() {
    try {
      console.log('[TemplateEngine] Inicializando sistema...');
      
      // Detectar basePath
      this.detectBasePath();
      
      // Atualizar caminhos na config com basePath
      this.updateConfigPaths();
      
      // Carregar estilos CSS primeiro (síncrono para evitar FOU)
      await this.loadStylesheets();
      
      // Carregar componentes com retry
      await this.loadComponentsWithRetry();
      
      // Inicializar módulos JS
      await this.initializeModules();
      
      // Configurar sistemas complementares
      this.setupScrollToTop();
      this.highlightActiveMenuItem();
      
      // Marcar como pronto e disparar evento
      this.componentsLoaded = true;
      this.modulesInitialized = true;
      this.cssLoaded = true;
      document.dispatchEvent(new Event('TemplateEngine:Ready'));
      
      // Inicializar conteúdo principal se existir
      if (typeof window.MainIndexLoader !== 'undefined') {
        window.MainIndexLoader.load();
      }
      
      console.log('[TemplateEngine] Sistema operacional');
      
    } catch (error) {
      console.error('[TemplateEngine] Erro crítico:', error);
      this.showCriticalError("Não foi possível carregar partes do site. Verifique sua conexão.");
    }
  }

  /**
   * Detecta o caminho base automaticamente
   */
  detectBasePath() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/Calculadoras-de-Enfermagem/')) {
      this.basePath = '/Calculadoras-de-Enfermagem/';
    } else if (currentPath.endsWith('/')) {
      this.basePath = currentPath;
    } else {
      this.basePath = './';
    }
    
    console.log(`[TemplateEngine] BasePath: ${this.basePath}`);
  }

  /**
   * Atualiza os caminhos na config com o basePath
   */
  updateConfigPaths() {
    const updatedConfig = {};
    const updatedModuleMapping = {};
    const updatedCssConfig = {};
    
    // Atualizar config de componentes
    for (const [containerId, path] of Object.entries(this.config)) {
      updatedConfig[containerId] = `${this.basePath}${path}`;
    }
    this.config = updatedConfig;
    
    // Atualizar mapping de módulos
    for (const [containerId, moduleInfo] of Object.entries(this.moduleMapping)) {
      updatedModuleMapping[containerId] = {
        ...moduleInfo,
        jsPath: `${this.basePath}${moduleInfo.jsPath}`
      };
    }
    this.moduleMapping = updatedModuleMapping;
    
    // Atualizar config de CSS
    for (const [path, order] of Object.entries(this.cssConfig)) {
      updatedCssConfig[`${this.basePath}${path}`] = order;
    }
    this.cssConfig = updatedCssConfig;
  }
  
  /**
   * Carrega todos os estilos CSS configurados
   */
  async loadStylesheets() {
    console.log('[TemplateEngine] Carregando estilos CSS...');
    
    // Ordenar estilos por prioridade
    const sortedStyles = Object.entries(this.cssConfig)
      .sort((a, b) => a[1] - b[1])
      .map(([path]) => path);
    
    // Carregar estilos em paralelo
    const loadPromises = sortedStyles.map(path => this.loadStylesheet(path));
    
    await Promise.all(loadPromises);
    console.log(`[TemplateEngine] ${sortedStyles.length} estilos carregados`);
  }
  
  /**
   * Carrega um único stylesheet
   */
  loadStylesheet(path) {
    return new Promise((resolve, reject) => {
      // Verificar se já existe
      const existingLink = document.querySelector(`link[href="${path}"]`);
      if (existingLink) {
        console.log(`[TemplateEngine] Stylesheet já existente: ${path}`);
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      link.media = 'all';
      link.id = `css-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
      
      link.onload = () => {
        console.log(`[TemplateEngine] Stylesheet carregado: ${path}`);
        resolve();
      };
      
      link.onerror = (error) => {
        console.warn(`[TemplateEngine] Erro ao carregar stylesheet: ${path}`, error);
        // Não rejeitar - permitir que o site continue funcionando
        resolve();
      };
      
      // Adicionar ao head
      document.head.appendChild(link);
    });
  }
  
  /**
   * Adiciona novo stylesheet dinamicamente
   */
  addStylesheet(path, order = 5) {
    this.cssConfig[path] = order;
    return this.loadStylesheet(`${this.basePath}${path}`);
  }
  
  /**
   * Remove um stylesheet
   */
  removeStylesheet(path) {
    const fullPath = `${this.basePath}${path}`;
    const link = document.getElementById(`css-${fullPath.replace(/[^a-zA-Z0-9]/g, '-')}`);
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
      console.log(`[TemplateEngine] Stylesheet removido: ${fullPath}`);
    }
  }

  /**
   * Carrega componentes com sistema de retry
   */
  async loadComponentsWithRetry() {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        await this.loadComponents();
        console.log('[TemplateEngine] Componentes carregados com sucesso');
        return;
      } catch (error) {
        attempt++;
        console.warn(`[TemplateEngine] Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
        
        if (attempt >= maxRetries) {
          throw new Error(`Falha definitiva após ${maxRetries} tentativas`);
        }
        
        // Exponential backoff
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }
  }

  /**
   * Carrega todos os componentes configurados
   */
  async loadComponents() {
    const containerIds = Object.keys(this.config);
    
    // Verificar se containers existem
    const missingContainers = containerIds.filter(id => !document.getElementById(id));
    if (missingContainers.length > 0) {
      console.warn(`[TemplateEngine] Containers não encontrados: ${missingContainers.join(', ')}`);
    }
    
    // Carregar componentes em paralelo
    const promises = containerIds
      .filter(containerId => document.getElementById(containerId))
      .map(async (containerId) => {
        const componentPath = this.config[containerId];
        
        try {
          const response = await fetch(componentPath);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const html = await response.text();
          const container = document.getElementById(containerId);
          
          if (container) {
            container.innerHTML = html;
            
            // Executar scripts inline do componente
            this.executeScripts(container);
            
            console.log(`[TemplateEngine] Componente ${containerId} carregado`);
          }
        } catch (error) {
          console.error(`[TemplateEngine] Erro ao carregar ${containerId}:`, error.message);
          throw error;
        }
      });
    
    await Promise.all(promises);
  }

  /**
   * Executa scripts inline após injeção no DOM
   */
  executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      
      if (script.src) {
        newScript.src = script.src;
        newScript.async = false;
      } else {
        newScript.textContent = script.textContent;
      }
      
      // Copiar atributos
      Array.from(script.attributes).forEach(attr => {
        if (attr.name !== 'src' && attr.name !== 'textContent') {
          newScript.setAttribute(attr.name, attr.value);
        }
      });
      
      // Substituir script original
      script.parentNode.insertBefore(newScript, script);
      script.parentNode.removeChild(script);
    });
  }

  /**
   * Inicializa todos os módulos JS
   */
  async initializeModules() {
    console.log('[TemplateEngine] Inicializando módulos JS...');
    
    const modulePromises = Object.entries(this.moduleMapping)
      .filter(([containerId]) => document.getElementById(containerId))
      .map(async ([containerId, moduleInfo]) => {
        try {
          // Verificar se módulo já existe no window
          if (typeof window[moduleInfo.module] !== 'undefined') {
            console.log(`[TemplateEngine] Módulo ${moduleInfo.module} já carregado`);
            return;
          }
          
          // Carregar script
          await this.loadScript(moduleInfo.jsPath);
          
          // Aguardar um tick para o script executar
          await new Promise(r => setTimeout(r, 50));
          
          // Inicializar módulo
          const moduleObj = window[moduleInfo.module];
          if (moduleObj && typeof moduleObj[moduleInfo.initializer] === 'function') {
            moduleObj[moduleInfo.initializer]();
            console.log(`[TemplateEngine] Módulo ${moduleInfo.module} inicializado`);
          } else if (moduleObj && typeof moduleObj.init === 'function') {
            moduleObj.init();
            console.log(`[TemplateEngine] Módulo ${moduleInfo.module} inicializado (via init)`);
          }
        } catch (error) {
          console.warn(`[TemplateEngine] Erro ao inicializar ${moduleInfo.module}:`, error.message);
        }
      });
    
    await Promise.all(modulePromises);
  }

  /**
   * Carrega um script dinamicamente
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      
      script.onload = () => {
        console.log(`[TemplateEngine] Script carregado: ${src}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`[TemplateEngine] Erro ao carregar script: ${src}`);
        reject(new Error(`Falha ao carregar: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Configura botão de scroll to top
   */
  setupScrollToTop() {
    const checkBtn = setInterval(() => {
      const btn = document.getElementById('backToTop');
      if (btn) {
        clearInterval(checkBtn);
        
        window.addEventListener('scroll', () => {
          if (window.scrollY > 300) {
            btn.classList.remove('hidden');
          } else {
            btn.classList.add('hidden');
          }
        });

        btn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }, 100);

    setTimeout(() => clearInterval(checkBtn), 5000);
  }

  /**
   * Destaca o item de menu ativo
   */
  highlightActiveMenuItem() {
    requestAnimationFrame(() => {
      const currentPath = window.location.pathname;
      const pageName = currentPath.split('/').pop() || 'index.html';
      
      const navLinks = document.querySelectorAll('header nav a, header .mobile-menu a, #top-bar-links a');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        link.classList.remove('active', 'text-yellow-500', 'font-bold');
        
        if (href === pageName || (pageName === '' && href === 'index.html') || currentPath.endsWith(href)) {
          link.classList.add('active', 'text-yellow-500', 'font-bold');
        }
      });
    });
  }

  /**
   * Exibe erro crítico na tela
   */
  showCriticalError(message) {
    const div = document.createElement('div');
    div.className = 'fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 shadow-lg';
    div.innerHTML = `<strong class="font-bold">Erro:</strong> <span class="block sm:inline">${message}</span>`;
    document.body.appendChild(div);
    
    // Auto-remover após 10 segundos
    setTimeout(() => div.remove(), 10000);
  }

  /**
   * Adiciona novo componente dinamicamente
   */
  registerComponent(containerId, componentPath, moduleInfo = null) {
    this.config[containerId] = componentPath;
    
    if (moduleInfo) {
      this.moduleMapping[containerId] = {
        module: moduleInfo.module || containerId,
        initializer: moduleInfo.initializer || 'init',
        jsPath: moduleInfo.jsPath || `assets/js/${containerId}.js`
      };
    }
    
    console.log(`[TemplateEngine] Componente registrado: ${containerId}`);
  }

  /**
   * Recarrega um componente específico
   */
  async reloadComponent(containerId) {
    if (!this.config[containerId]) {
      console.warn(`[TemplateEngine] Componente não registrado: ${containerId}`);
      return false;
    }
    
    try {
      const response = await fetch(this.config[containerId]);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const html = await response.text();
      const container = document.getElementById(containerId);
      
      if (container) {
        container.innerHTML = html;
        this.executeScripts(container);
        console.log(`[TemplateEngine] Componente ${containerId} recarregado`);
        return true;
      }
    } catch (error) {
      console.error(`[TemplateEngine] Erro ao recarregar ${containerId}:`, error.message);
    }
    
    return false;
  }

  /**
   * Verifica status de carregamento
   */
  getStatus() {
    return {
      loaded: this.componentsLoaded,
      modulesInitialized: this.modulesInitialized,
      cssLoaded: this.cssLoaded,
      basePath: this.basePath,
      components: Object.keys(this.config),
      containers: Object.keys(this.config).filter(id => document.getElementById(id)),
      stylesheets: Object.keys(this.cssConfig)
    };
  }
  
  /**
   * Verifica se todos os recursos estão carregados
   */
  isReady() {
    return this.componentsLoaded && this.modulesInitialized && this.cssLoaded;
  }
}

// Inicialização singleton
if (!window.__TEMPLATE_ENGINE_GLOBAL_INIT__) {
  window.__TEMPLATE_ENGINE_GLOBAL_INIT__ = true;
  
  const initEngine = () => {
    window.templateEngine = new TemplateEngine();
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }
}

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateEngine };
}