/**
 * CORE.JS - Núcleo do Sistema Modular de Calculadoras
 * Gerencia inicialização, configuração e orquestração de módulos
 * * @author Calculadoras de Enfermagem
 * @version 2.0.1 (Fixed EventBus)
 */

class CalculatorCore {
  constructor(config = {}) {
    // Detecta se está em produção ou local
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const defaultBase = isLocal ? '.' : '.';

    this.config = {
      baseURL: config.baseURL || defaultBase,
      calculatorId: config.calculatorId || 'default',
      enableVoice: config.enableVoice !== false,
      enablePDF: config.enablePDF !== false,
      enableAccessibility: config.enableAccessibility !== false,
      darkMode: config.darkMode || false,
      ...config
    };

    this.modules = {};
    
    // CORREÇÃO CRÍTICA DO EVENTBUS:
    // Se window.EventBus já existe (definido no HTML ou external script), usamos ele.
    // Se não, usamos nossa classe interna, MAS instanciamos ela.
    if (window.EventBus && typeof window.EventBus.emit === 'function') {
        this.eventBus = window.EventBus;
    } else {
        this.eventBus = new InternalEventBus();
        // Garantir que o global aponte para a INSTÂNCIA, não para a classe
        window.EventBus = this.eventBus;
    }

    this.state = {
      currentCalculator: null,
      lastResult: null,
      userPreferences: this.loadPreferences(),
      calculators: {}
    };

    this.init();
  }

  /**
   * Inicializar o sistema
   */
  async init() {
    console.log('🚀 Inicializando Core do Sistema...');
    
    try {
      // Aplicar preferências do usuário
      this.applyUserPreferences();
      
      // Carregar módulos base (se necessário)
      await this.loadModules();
      
      // Configurar listeners globais
      this.setupGlobalListeners();
      
      console.log('✅ Core inicializado com sucesso');
      this.eventBus.emit('core:ready');
    } catch (error) {
      console.error('❌ Erro ao inicializar Core:', error);
      if(this.eventBus) this.eventBus.emit('core:error', error);
    }
  }

  /**
   * Carregar módulos essenciais
   */
  async loadModules() {
    // Simulação de carregamento de dependências se não forem script tags
    // Aqui apenas verificamos se as globais existem
    const modules = ['NOTIFICATION_MANAGER', 'UI_MANAGER', 'CALCULATOR_ENGINE'];
    
    modules.forEach(mod => {
        if (!window[mod]) {
            console.warn(`⚠️ Módulo ${mod} ainda não carregado ou não encontrado globalmente.`);
        }
    });
  }

  /**
   * Configurar listeners globais
   */
  setupGlobalListeners() {
    window.addEventListener('error', (event) => {
      this.eventBus.emit('system:error', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno
      });
    });
  }

  /**
   * Carregar preferências
   */
  loadPreferences() {
    const saved = localStorage.getItem('nurse_calc_prefs');
    return saved ? JSON.parse(saved) : { theme: 'light', voice: true };
  }

  /**
   * Aplicar preferências
   */
  applyUserPreferences() {
    // Tema
    if (this.state.userPreferences.theme === 'dark' || 
       (this.state.userPreferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  }
}

/**
 * InternalEventBus - Sistema de eventos (Fallback se o externo falhar)
 */
class InternalEventBus {
  constructor() {
    this.events = {};
    // Sincronizar com qualquer listener pré-existente no window.EventBus.l
    if(window.EventBus && window.EventBus.l) {
        this.events = window.EventBus.l;
    }
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  }

  once(eventName, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  emit(eventName, data = null) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Erro no listener do evento ${eventName}:`, e);
      }
    });
  }
  
  clear() {
      this.events = {};
  }
}

// Exportar classe para window se necessário, mas preferir instanciar
window.CalculatorCore = CalculatorCore;