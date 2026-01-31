/**
 * CORE.JS - Núcleo do Sistema Modular de Calculadoras
 * Gerencia inicialização, configuração e orquestração de módulos
 * @author Calculadoras de Enfermagem
 * @version 2.1.0 (Performance + Cache)
 */

class CalculatorCore {
  constructor(config = {}) {
    // Configurações padrão
    this.config = {
      baseURL: config.baseURL || '.',
      calculatorId: config.calculatorId || 'insulina',
      enableVoice: config.enableVoice !== false,
      enablePDF: config.enablePDF !== false,
      enableAccessibility: config.enableAccessibility !== false,
      darkMode: config.darkMode || 'auto',
      enableCache: config.enableCache !== false,
      cacheTTL: config.cacheTTL || 300000, // 5 minutos
      ...config
    };

    this.modules = new Map();
    this.state = {
      currentCalculator: null,
      lastResult: null,
      userPreferences: this.loadPreferences(),
      calculators: {},
      loading: false,
      errors: []
    };

    // Cache para dados
    this.cache = new Map();
    
    // Inicializar EventBus
    this.eventBus = this.initEventBus();
    
    console.log('🚀 CalculatorCore inicializado');
  }

  /**
   * Inicializar EventBus
   */
  initEventBus() {
    // Tentar usar EventBus global ou criar interno
    if (window.EventBus && typeof window.EventBus.emit === 'function') {
      console.log('✅ Usando EventBus global');
      return window.EventBus;
    }
    
    console.log('⚠️ Criando EventBus interno');
    return this.createInternalEventBus();
  }

  /**
   * Criar EventBus interno
   */
  createInternalEventBus() {
    const events = new Map();
    
    return {
      on: (eventName, callback) => {
        if (!events.has(eventName)) {
          events.set(eventName, []);
        }
        events.get(eventName).push(callback);
      },
      
      once: (eventName, callback) => {
        const wrapper = (...args) => {
          callback(...args);
          this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
      },
      
      off: (eventName, callback) => {
        const listeners = events.get(eventName);
        if (listeners) {
          const index = listeners.indexOf(callback);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      },
      
      emit: (eventName, data = null) => {
        const listeners = events.get(eventName);
        if (listeners) {
          listeners.forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              console.error(`Erro no listener do evento ${eventName}:`, error);
            }
          });
        }
      },
      
      clear: () => {
        events.clear();
      }
    };
  }

  /**
   * Inicializar o sistema
   */
  async init() {
    console.log('🚀 Inicializando Core do Sistema...');
    
    try {
      this.setState({ loading: true });
      
      // 1. Aplicar preferências do usuário
      this.applyUserPreferences();
      
      // 2. Configurar listeners globais
      this.setupGlobalListeners();
      
      // 3. Carregar módulos base (assíncrono)
      await this.loadBaseModules();
      
      // 4. Emitir evento de ready
      this.eventBus.emit('core:ready', { 
        timestamp: new Date(),
        config: this.config 
      });
      
      this.setState({ loading: false });
      
      console.log('✅ Core inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Core:', error);
      this.setState({ 
        loading: false, 
        errors: [...this.state.errors, error.message] 
      });
      
      this.eventBus.emit('core:error', { 
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Gerenciar estado do sistema
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.eventBus.emit('state:changed', this.state);
  }

  /**
   * Carregar módulos base
   */
  async loadBaseModules() {
    const requiredModules = [
      'NOTIFICATION_MANAGER',
      'UI_MANAGER', 
      'CALCULATOR_ENGINE',
      'ACCESSIBILITY_MANAGER'
    ];
    
    const missingModules = requiredModules.filter(mod => !window[mod]);
    
    if (missingModules.length > 0) {
      console.warn(`⚠️ Módulos não carregados: ${missingModules.join(', ')}`);
    }
    
    // Registrar módulos carregados
    requiredModules.forEach(mod => {
      if (window[mod]) {
        this.modules.set(mod.toLowerCase(), window[mod]);
      }
    });
  }

  /**
   * Configurar listeners globais
   */
  setupGlobalListeners() {
    // Listener para erros globais
    window.addEventListener('error', (event) => {
      this.eventBus.emit('system:error', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Listener para rejeição de promises
    window.addEventListener('unhandledrejection', (event) => {
      this.eventBus.emit('system:promise:error', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Listener para modo escuro do sistema
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleDarkModeChange = (e) => {
        if (this.state.userPreferences.theme === 'auto') {
          this.applyDarkMode(e.matches);
        }
      };
      
      darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
      
      // Limpar listener quando o core for destruído
      this.cleanupListeners.push(() => {
        darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
      });
    }
  }

  /**
   * Carregar preferências do usuário
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem('nurse_calc_prefs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar preferências:', error);
    }
    
    // Preferências padrão
    return { 
      theme: 'auto', 
      voice: true,
      fontSize: 'medium',
      highContrast: false,
      reduceMotion: false
    };
  }

  /**
   * Salvar preferências do usuário
   */
  savePreferences(preferences) {
    try {
      localStorage.setItem('nurse_calc_prefs', JSON.stringify(preferences));
      this.setState({ userPreferences: preferences });
      this.eventBus.emit('preferences:saved', preferences);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar preferências:', error);
      return false;
    }
  }

  /**
   * Aplicar preferências do usuário
   */
  applyUserPreferences() {
    const prefs = this.state.userPreferences;
    
    // Tema
    if (prefs.theme === 'dark' || 
       (prefs.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.applyDarkMode(true);
    } else {
      this.applyDarkMode(false);
    }
    
    // Tamanho da fonte
    if (prefs.fontSize && prefs.fontSize !== 'medium') {
      this.applyFontSize(prefs.fontSize);
    }
    
    // Alto contraste
    if (prefs.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    
    // Redução de movimento
    if (prefs.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    }
  }

  /**
   * Aplicar modo escuro
   */
  applyDarkMode(enabled) {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    this.eventBus.emit('theme:changed', { darkMode: enabled });
  }

  /**
   * Aplicar tamanho da fonte
   */
  applyFontSize(size) {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    if (sizes[size]) {
      document.documentElement.style.fontSize = sizes[size];
      this.eventBus.emit('fontsize:changed', { size });
    }
  }

  /**
   * Obter dados com cache
   */
  async getData(key, fetcher, forceRefresh = false) {
    // Verificar cache
    if (!forceRefresh && this.config.enableCache) {
      const cached = this.cache.get(key);
      if (cached && (Date.now() - cached.timestamp) < this.config.cacheTTL) {
        return cached.data;
      }
    }
    
    // Buscar dados
    try {
      const data = await fetcher();
      
      // Armazenar em cache
      if (this.config.enableCache) {
        this.cache.set(key, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Erro ao buscar dados para ${key}:`, error);
      throw error;
    }
  }

  /**
   * Limpar cache
   */
  clearCache() {
    const count = this.cache.size;
    this.cache.clear();
    this.eventBus.emit('cache:cleared', { count });
    return count;
  }

  /**
   * Obter módulo pelo nome
   */
  getModule(name) {
    return this.modules.get(name.toLowerCase()) || null;
  }

  /**
   * Registrar módulo
   */
  registerModule(name, module) {
    this.modules.set(name.toLowerCase(), module);
    this.eventBus.emit('module:registered', { name, module });
  }

  /**
   * Verificar se módulo está disponível
   */
  hasModule(name) {
    return this.modules.has(name.toLowerCase());
  }

  /**
   * Destruir instância (cleanup)
   */
  destroy() {
    // Limpar listeners
    if (this.cleanupListeners) {
      this.cleanupListeners.forEach(cleanup => cleanup());
    }
    
    // Limpar cache
    this.clearCache();
    
    // Limpar módulos
    this.modules.clear();
    
    // Emitir evento de destruição
    this.eventBus.emit('core:destroyed');
    
    console.log('🛑 CalculatorCore destruído');
  }
}

// Exportar
if (typeof window !== 'undefined') {
  window.CalculatorCore = CalculatorCore;
}

export default CalculatorCore;