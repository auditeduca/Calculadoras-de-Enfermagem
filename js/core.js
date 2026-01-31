/**
 * CORE.JS - Núcleo do Sistema Modular de Calculadoras
 * Gerencia inicialização, configuração e orquestração de módulos
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class CalculatorCore {
  constructor(config = {}) {
    this.config = {
      baseURL: config.baseURL || 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/',
      calculatorId: config.calculatorId || 'default',
      enableVoice: config.enableVoice !== false,
      enablePDF: config.enablePDF !== false,
      enableAccessibility: config.enableAccessibility !== false,
      darkMode: config.darkMode || false,
      ...config
    };

    this.modules = {};
    this.eventBus = new EventBus();
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
      
      // Carregar módulos base
      await this.loadModules();
      
      // Configurar listeners globais
      this.setupGlobalListeners();
      
      console.log('✅ Core inicializado com sucesso');
      this.eventBus.emit('core:ready');
    } catch (error) {
      console.error('❌ Erro ao inicializar Core:', error);
      this.eventBus.emit('core:error', error);
    }
  }

  /**
   * Carregar módulos do sistema
   */
  async loadModules() {
    const moduleList = [
      'notifications',
      'ui',
      'util',
      'calculator-engine'
    ];

    for (const moduleName of moduleList) {
      try {
        const script = document.createElement('script');
        script.src = `${this.config.baseURL}assets/js/${moduleName}.js`;
        script.async = false;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
          script.onerror = () => {
            console.warn(`⚠️ Módulo ${moduleName} não carregado`);
            resolve();
          };
        });
      } catch (error) {
        console.warn(`⚠️ Erro ao carregar ${moduleName}:`, error);
      }
    }
  }

  /**
   * Configurar listeners globais
   */
  setupGlobalListeners() {
    // Detectar mudanças de tema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        this.setDarkMode(e.matches);
      });
    }

    // Detectar mudanças de conectividade
    window.addEventListener('online', () => {
      this.eventBus.emit('connection:online');
    });

    window.addEventListener('offline', () => {
      this.eventBus.emit('connection:offline');
    });
  }

  /**
   * Carregar preferências do usuário do localStorage
   */
  loadPreferences() {
    const stored = localStorage.getItem('calculator_preferences');
    return stored ? JSON.parse(stored) : {
      darkMode: false,
      fontSize: 'medium',
      language: 'pt-BR',
      voiceEnabled: true,
      accessibilityEnabled: true
    };
  }

  /**
   * Salvar preferências do usuário
   */
  savePreferences(preferences) {
    this.state.userPreferences = { ...this.state.userPreferences, ...preferences };
    localStorage.setItem('calculator_preferences', JSON.stringify(this.state.userPreferences));
    this.eventBus.emit('preferences:updated', this.state.userPreferences);
  }

  /**
   * Aplicar preferências do usuário
   */
  applyUserPreferences() {
    const prefs = this.state.userPreferences;
    
    if (prefs.darkMode) {
      this.setDarkMode(true);
    }

    if (prefs.fontSize) {
      this.setFontSize(prefs.fontSize);
    }

    if (prefs.language) {
      document.documentElement.lang = prefs.language;
    }
  }

  /**
   * Alternar modo escuro
   */
  setDarkMode(enabled) {
    const html = document.documentElement;
    if (enabled) {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
    this.savePreferences({ darkMode: enabled });
  }

  /**
   * Definir tamanho da fonte
   */
  setFontSize(size) {
    const root = document.documentElement;
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    
    if (sizes[size]) {
      root.style.fontSize = sizes[size];
      this.savePreferences({ fontSize: size });
    }
  }

  /**
   * Registrar uma calculadora
   */
  registerCalculator(id, calculator) {
    this.state.calculators[id] = calculator;
    this.eventBus.emit('calculator:registered', { id, calculator });
  }

  /**
   * Obter uma calculadora registrada
   */
  getCalculator(id) {
    return this.state.calculators[id];
  }

  /**
   * Definir calculadora ativa
   */
  setActiveCalculator(id) {
    this.state.currentCalculator = id;
    this.eventBus.emit('calculator:activated', { id });
  }

  /**
   * Obter calculadora ativa
   */
  getActiveCalculator() {
    return this.state.currentCalculator;
  }

  /**
   * Salvar resultado
   */
  saveResult(result) {
    this.state.lastResult = {
      ...result,
      timestamp: new Date().toISOString(),
      calculatorId: this.state.currentCalculator
    };
    
    // Salvar no localStorage para persistência
    const results = JSON.parse(localStorage.getItem('calculator_results') || '[]');
    results.push(this.state.lastResult);
    localStorage.setItem('calculator_results', JSON.stringify(results.slice(-50))); // Manter últimos 50
    
    this.eventBus.emit('result:saved', this.state.lastResult);
  }

  /**
   * Obter último resultado
   */
  getLastResult() {
    return this.state.lastResult;
  }

  /**
   * Obter histórico de resultados
   */
  getResultsHistory(calculatorId = null) {
    const results = JSON.parse(localStorage.getItem('calculator_results') || '[]');
    
    if (calculatorId) {
      return results.filter(r => r.calculatorId === calculatorId);
    }
    
    return results;
  }

  /**
   * Limpar histórico
   */
  clearHistory() {
    localStorage.removeItem('calculator_results');
    this.eventBus.emit('history:cleared');
  }

  /**
   * Obter EventBus
   */
  getEventBus() {
    return this.eventBus;
  }

  /**
   * Destruir instância
   */
  destroy() {
    this.eventBus.clear();
    this.modules = {};
    console.log('🛑 Core destruído');
  }
}

/**
 * EventBus - Sistema de eventos global
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Inscrever em um evento
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    
    // Retornar função para desinscrição
    return () => this.off(eventName, callback);
  }

  /**
   * Inscrever uma única vez
   */
  once(eventName, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  /**
   * Desinscrever de um evento
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emitir um evento
   */
  emit(eventName, data = null) {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback de ${eventName}:`, error);
      }
    });
  }

  /**
   * Limpar todos os eventos
   */
  clear() {
    this.events = {};
  }
}

// Exportar para uso global
window.CalculatorCore = CalculatorCore;
window.EventBus = EventBus;
