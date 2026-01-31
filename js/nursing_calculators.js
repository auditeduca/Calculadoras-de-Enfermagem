/**
 * NURSING_CALCULATORS.JS - Sistema de Calculadoras de Enfermagem
 * Orquestra todas as funcionalidades do sistema modular
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class NursingCalculators {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/';
    this.core = window.CalculatorCore ? new window.CalculatorCore(options) : null;
    this.notificationManager = window.NOTIFICATION_MANAGER;
    this.uiManager = window.UI_MANAGER;
    this.voiceManager = window.VOICE_MANAGER;
    this.accessibilityManager = window.ACCESSIBILITY_MANAGER;
    this.calculatorEngine = window.CALCULATOR_ENGINE;
    this.nursingEngine = window.NURSING_ENGINE;
    this.contentInjector = window.MAIN_CONTENT_INJECTOR;
    this.modalReferenceManager = window.MODAL_REFERENCE_MANAGER;
    this.pdfGenerator = window.PDF_GENERATOR;

    this.currentCalculator = null;
    this.lastResult = null;

    this.initialize();
  }

  /**
   * Inicializar sistema
   */
  async initialize() {
    console.log('🏥 Inicializando Sistema de Calculadoras de Enfermagem...');

    try {
      // Carregar calculadoras
      await this.contentInjector.loadCalculators();

      // Configurar listeners
      this.setupEventListeners();

      // Aplicar preferências de acessibilidade
      this.accessibilityManager.checkSystemPreferences();
      this.accessibilityManager.createSkipLink();
      this.accessibilityManager.enableKeyboardNavigation();

      console.log('✅ Sistema inicializado com sucesso');
      this.notificationManager.success('Sistema de Calculadoras carregado!', 3000);
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
      this.notificationManager.error('Erro ao inicializar o sistema');
    }
  }

  /**
   * Configurar listeners de eventos
   */
  setupEventListeners() {
    // Detectar calculadora na URL
    const params = new URLSearchParams(window.location.search);
    const calculatorId = params.get('calculator') || 'insulina';
    
    this.loadCalculator(calculatorId);

    // Listener para mudanças de tema
    document.addEventListener('theme:changed', (e) => {
      this.uiManager.setDarkMode(e.detail.darkMode);
    });

    // Listener para mudanças de acessibilidade
    document.addEventListener('accessibility:changed', (e) => {
      if (e.detail.voiceEnabled !== undefined) {
        this.voiceManager.setEnabled(e.detail.voiceEnabled);
      }
    });
  }

  /**
   * Carregar calculadora
   */
  async loadCalculator(calculatorId) {
    const calculator = this.contentInjector.getCalculator(calculatorId);
    
    if (!calculator) {
      this.notificationManager.error(`Calculadora '${calculatorId}' não encontrada`);
      return;
    }

    this.currentCalculator = calculator;
    
    // Injetar conteúdo
    await this.contentInjector.injectMainContent(calculatorId);

    // Renderizar checklists
    this.contentInjector.renderChecklists();

    // Configurar handlers de cálculo
    this.setupCalculationHandlers(calculatorId);

    // Anunciar carregamento
    this.accessibilityManager.announce(`Calculadora ${calculator.title} carregada`);
    this.voiceManager.speak(`Calculadora ${calculator.title} carregada`);

    console.log(`✅ Calculadora '${calculatorId}' carregada`);
  }

  /**
   * Configurar handlers de cálculo
   */
  setupCalculationHandlers(calculatorId) {
    const calculator = this.contentInjector.getCalculator(calculatorId);
    if (!calculator) return;

    // Botão de cálculo
    const calculateBtn = document.getElementById('btn-calculate');
    if (calculateBtn) {
      calculateBtn.onclick = () => this.performCalculation(calculatorId);
    }

    // Botão de reset
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.onclick = () => this.resetCalculator();
    }

    // Botão de PDF
    const pdfBtn = document.getElementById('btn-pdf');
    if (pdfBtn) {
      pdfBtn.onclick = () => this.generatePDF();
    }

    // Botão de copiar
    const copyBtn = document.getElementById('btn-copy');
    if (copyBtn) {
      copyBtn.onclick = () => this.copyResult();
    }

    // Botões de referência
    const nandaBtn = document.getElementById('btn-nanda');
    if (nandaBtn) {
      nandaBtn.onclick = () => this.modalReferenceManager.showNANDAModal();
    }

    const medicationBtn = document.getElementById('btn-medication');
    if (medicationBtn) {
      medicationBtn.onclick = () => this.modalReferenceManager.showMedicationChecklistModal();
    }

    const safetyBtn = document.getElementById('btn-safety');
    if (safetyBtn) {
      safetyBtn.onclick = () => this.modalReferenceManager.showSafetyGoalsModal();
    }
  }

  /**
   * Realizar cálculo
   */
  async performCalculation(calculatorId) {
    try {
      // Coletar dados de entrada
      const inputs = this.collectInputs(calculatorId);

      // Validar
      const validation = this.nursingEngine.validateClinicalInput(calculatorId, inputs);
      if (!validation.valid) {
        this.notificationManager.error(`Erro: ${validation.errors.join(', ')}`);
        this.accessibilityManager.announceError(validation.errors.join(', '));
        return;
      }

      // Executar cálculo
      const result = await this.nursingEngine.executeNursingCalculation(calculatorId, inputs);
      
      if (!result.success) {
        this.notificationManager.error(result.error);
        this.accessibilityManager.announceError(result.error);
        return;
      }

      // Salvar resultado
      this.lastResult = result.result;
      window.CURRENT_RESULT = {
        calculatorId,
        inputs,
        result: result.result,
        timestamp: new Date().toISOString()
      };

      // Exibir resultado
      this.displayResult(result.result);

      // Anunciar resultado
      this.accessibilityManager.announceCalculationResult(result.result.value, result.result.unit);

      // Notificação
      this.notificationManager.success('Cálculo realizado com sucesso!');

      console.log('✅ Cálculo executado:', result.result);
    } catch (error) {
      console.error('Erro ao realizar cálculo:', error);
      this.notificationManager.error('Erro ao realizar cálculo');
      this.accessibilityManager.announceError('Erro ao realizar cálculo');
    }
  }

  /**
   * Coletar dados de entrada
   */
  collectInputs(calculatorId) {
    const calculator = this.contentInjector.getCalculator(calculatorId);
    if (!calculator) return {};

    const inputs = {};
    calculator.inputs.forEach(input => {
      const field = document.getElementById(input.id);
      if (field) {
        inputs[input.id] = field.value;
      }
    });

    return inputs;
  }

  /**
   * Exibir resultado
   */
  displayResult(result) {
    const wrapper = document.getElementById('results-wrapper');
    if (!wrapper) return;

    // Mostrar wrapper
    wrapper.classList.remove('hidden');

    // Atualizar valores
    const totalEl = document.getElementById('res-total');
    const unitEl = document.getElementById('res-unit');
    const formulaEl = document.getElementById('res-formula');

    if (totalEl) totalEl.textContent = result.value;
    if (unitEl) unitEl.textContent = result.unit;
    if (formulaEl) formulaEl.textContent = result.formula;

    // Scroll para resultado
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Animar
    wrapper.classList.add('animate-fade-in');
  }

  /**
   * Gerar PDF
   */
  async generatePDF() {
    if (!this.lastResult) {
      this.notificationManager.error('Realize um cálculo primeiro');
      return;
    }

    const patientData = {
      name: document.getElementById('patient_name')?.value || 'Não informado',
      birthdate: document.getElementById('patient_birthdate')?.value || 'Não informado'
    };

    await this.pdfGenerator.generateAuditPDF(window.CURRENT_RESULT, patientData);
  }

  /**
   * Copiar resultado
   */
  async copyResult() {
    if (!this.lastResult) {
      this.notificationManager.error('Nenhum resultado para copiar');
      return;
    }

    try {
      const text = `
REGISTRO DE AUDITORIA - ${this.currentCalculator.title.toUpperCase()}
Data: ${new Date().toLocaleString('pt-BR')}

RESULTADO: ${this.lastResult.value} ${this.lastResult.unit}
FÓRMULA: ${this.lastResult.formula}

Gerado por: Calculadoras de Enfermagem Profissional
      `.trim();

      await navigator.clipboard.writeText(text);
      
      this.notificationManager.success('Resultado copiado!');
      this.accessibilityManager.announceSuccess('Resultado copiado para a área de transferência');
      
      // Animar botão
      const copyBtn = document.getElementById('btn-copy');
      if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      this.notificationManager.error('Erro ao copiar resultado');
    }
  }

  /**
   * Resetar calculadora
   */
  resetCalculator() {
    // Limpar campos
    const calculator = this.currentCalculator;
    if (calculator) {
      calculator.inputs.forEach(input => {
        const field = document.getElementById(input.id);
        if (field) {
          field.value = '';
        }
      });
    }

    // Ocultar resultados
    const wrapper = document.getElementById('results-wrapper');
    if (wrapper) {
      wrapper.classList.add('hidden');
    }

    // Limpar resultado
    this.lastResult = null;
    window.CURRENT_RESULT = null;

    // Notificação
    this.notificationManager.info('Calculadora resetada');
    this.accessibilityManager.announce('Calculadora resetada');

    console.log('🔄 Calculadora resetada');
  }

  /**
   * Compartilhar resultado
   */
  share(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent('Confira esta calculadora profissional de enfermagem!');

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
      this.notificationManager.info(`Compartilhando no ${platform}...`);
    }
  }

  /**
   * Copiar link
   */
  copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        this.notificationManager.success('Link copiado!');
        this.accessibilityManager.announceSuccess('Link copiado para a área de transferência');
      })
      .catch(err => {
        console.error('Erro ao copiar link:', err);
        this.notificationManager.error('Erro ao copiar link');
      });
  }

  /**
   * Buscar NANDA online
   */
  searchNANDAOnline() {
    if (!this.currentCalculator) return;
    this.modalReferenceManager.searchNANDAOnline(this.currentCalculator.title);
  }

  /**
   * Obter histórico
   */
  getHistory() {
    return this.calculatorEngine.getHistory();
  }

  /**
   * Limpar histórico
   */
  clearHistory() {
    this.calculatorEngine.clearHistory();
    this.notificationManager.info('Histórico limpo');
  }
}

// Instância global
window.CALCULATOR_SYSTEM = new NursingCalculators({
  baseURL: 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/'
});

// Exportar
window.NursingCalculators = NursingCalculators;

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, sistema pronto');
  });
} else {
  console.log('📄 DOM já carregado, sistema pronto');
}
