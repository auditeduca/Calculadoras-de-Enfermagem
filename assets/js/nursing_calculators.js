/**
 * NURSING_CALCULATORS.JS - Sistema de Calculadoras de Enfermagem
 * Orquestra todas as funcionalidades do sistema modular
 * @author Calculadoras de Enfermagem
 * @version 2.1.0 (Actions Complete + Performance)
 */

class NursingCalculators {
  constructor(options = {}) {
    // Configuração
    this.config = {
      baseURL: options.baseURL || 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/',
      jsonURL: options.jsonURL || './data/nursing_calculators.json',
      enableAnalytics: options.enableAnalytics !== false,
      ...options
    };

    // Módulos principais
    this.modules = this.initModules(options);
    
    // Estado
    this.currentCalculator = null;
    this.lastResult = null;
    this.history = [];
    this.isInitialized = false;
    
    console.log('🏥 NursingCalculators instanciado');
  }

  /**
   * Inicializar módulos
   */
  initModules(options) {
    const modules = {};
    
    // Core
    if (window.CalculatorCore) {
      modules.core = new window.CalculatorCore({
        enableVoice: true,
        enablePDF: true,
        enableAccessibility: true,
        ...options
      });
    }
    
    // Engine
    if (window.CalculatorEngine) {
      modules.engine = new window.CalculatorEngine({
        eventBus: modules.core ? modules.core.eventBus : null,
        notificationManager: window.NOTIFICATION_MANAGER
      });
    }
    
    // Content Injector
    if (window.MainContentInjector) {
      modules.injector = new window.MainContentInjector({
        notificationManager: window.NOTIFICATION_MANAGER,
        uiManager: window.UI_MANAGER
      });
    }
    
    // Nursing Engine
    if (window.NursingEngine && modules.engine) {
      modules.nursingEngine = new window.NursingEngine({
        calculatorEngine: modules.engine,
        notificationManager: window.NOTIFICATION_MANAGER
      });
    }
    
    // PDF Generator
    if (window.PDFGenerator) {
      modules.pdfGenerator = new window.PDFGenerator({
        notificationManager: window.NOTIFICATION_MANAGER
      });
    }
    
    // Modal Reference
    if (window.ModalReferenceManager) {
      modules.modalManager = new window.ModalReferenceManager({
        modalManager: window.MODAL_MANAGER,
        notificationManager: window.NOTIFICATION_MANAGER
      });
    }
    
    return modules;
  }

  /**
   * Inicializar sistema completo
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('⚠️ Sistema já inicializado');
      return;
    }
    
    console.log('🏥 Inicializando Sistema de Calculadoras de Enfermagem...');
    
    try {
      // 1. Inicializar Core
      if (this.modules.core) {
        await this.modules.core.init();
      }
      
      // 2. Carregar calculadoras
      if (this.modules.injector) {
        await this.modules.injector.loadCalculators();
      }
      
      // 3. Inicializar calculadoras de enfermagem
      if (this.modules.nursingEngine) {
        this.modules.nursingEngine.initializeCalculators();
      }
      
      // 4. Configurar listeners
      this.setupEventListeners();
      this.setupTabListeners();
      this.setupToolbarListeners();
      
      // 5. Verificar parâmetros da URL
      this.checkURLParams();
      
      // 6. Ocultar loader
      this.hideGlobalLoader();
      
      this.isInitialized = true;
      
      console.log('✅ Sistema inicializado com sucesso');
      
      // Notificação de sucesso
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.success('Sistema pronto para uso!');
      }
      
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.error('Erro ao inicializar o sistema');
      }
      
      throw error;
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botão Calcular
    const btnCalc = document.getElementById('btn-calculate');
    if (btnCalc) {
      btnCalc.addEventListener('click', () => this.calculate());
    }
    
    // Botão Reset
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetCalculator());
    }
    
    // Links de calculadoras
    document.querySelectorAll('a[href^="?calculator="]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(link.getAttribute('href').split('?')[1]);
        const calcId = urlParams.get('calculator');
        this.loadCalculator(calcId);
      });
    });
    
    // Input validation
    document.querySelectorAll('#calculator-inputs input[type="number"]').forEach(input => {
      input.addEventListener('keydown', (e) => {
        this.preventNegativeNumbers(e);
      });
    });
    
    // Eventos do sistema
    if (this.modules.core && this.modules.core.eventBus) {
      this.modules.core.eventBus.on('calculation:success', (result) => {
        this.handleCalculationSuccess(result);
      });
      
      this.modules.core.eventBus.on('calculation:error', (error) => {
        this.handleCalculationError(error);
      });
    }
  }

  /**
   * Configurar listeners de tabs
   */
  setupTabListeners() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover classe ativa de todas as tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Adicionar classe ativa à tab clicada
        tab.classList.add('active');
        
        // Ocultar todos os conteúdos
        const contents = document.querySelectorAll('.tab-pane');
        contents.forEach(c => c.classList.add('hidden'));
        
        // Mostrar conteúdo da tab clicada
        const target = document.getElementById(`tab-${tab.dataset.tab}`);
        if (target) {
          target.classList.remove('hidden');
          
          // Acessibilidade: focar no conteúdo
          setTimeout(() => {
            target.focus();
          }, 100);
        }
      });
    });
  }

  /**
   * Configurar listeners da toolbar
   */
  setupToolbarListeners() {
    // Botão Conteúdo
    const btnConteudo = document.getElementById('btn-conteudo');
    if (btnConteudo) {
      btnConteudo.addEventListener('click', () => {
        this.showContentModal();
      });
    }
    
    // Botão NANDA
    const btnNanda = document.getElementById('btn-nanda');
    if (btnNanda) {
      btnNanda.addEventListener('click', () => {
        this.showNANDAModal();
      });
    }
    
    // Botão 9 Acertos
    const btn9Acertos = document.getElementById('btn-9acertos');
    if (btn9Acertos) {
      btn9Acertos.addEventListener('click', () => {
        this.show9AcertosModal();
      });
    }
    
    // Botão Metas
    const btnMetas = document.getElementById('btn-metas');
    if (btnMetas) {
      btnMetas.addEventListener('click', () => {
        this.showMetasModal();
      });
    }
  }

  /**
   * Verificar parâmetros da URL
   */
  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const calculatorId = urlParams.get('calculator') || 'insulina';
    this.loadCalculator(calculatorId);
  }

  /**
   * Carregar calculadora específica
   */
  loadCalculator(id) {
    if (!this.modules.injector) {
      console.error('❌ ContentInjector não disponível');
      return false;
    }
    
    const success = this.modules.injector.injectCalculatorInterface(id);
    
    if (success) {
      this.currentCalculator = this.modules.injector.getCalculator(id);
      
      // Atualizar URL sem recarregar a página
      const newUrl = `${window.location.pathname}?calculator=${id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
      // Resetar calculadora
      this.resetCalculator();
      
      // Ativar aba principal
      const mainTab = document.querySelector('.tab-btn[data-tab="calculator"]');
      if (mainTab) {
        mainTab.click();
      }
      
      // Atualizar título da página
      if (this.currentCalculator && this.currentCalculator.title) {
        document.title = `${this.currentCalculator.title} | Calculadoras de Enfermagem`;
      }
      
      console.log(`✅ Calculadora '${id}' carregada`);
      
      return true;
    }
    
    console.warn(`⚠️ Falha ao carregar calculadora '${id}'`);
    return false;
  }

  /**
   * Executar cálculo
   */
  async calculate() {
    if (!this.currentCalculator || !this.modules.engine) {
      console.error('❌ Calculadora ou Engine não disponível');
      return;
    }
    
    // Coletar inputs
    const inputs = this.collectInputs();
    
    // Validar se há valores
    if (!this.hasValidInputs(inputs)) {
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.error("Preencha os campos obrigatórios");
      }
      return;
    }
    
    // Configurar estado de loading
    this.setCalculateButtonLoading(true);
    
    try {
      // Pequeno delay para feedback visual
      await new Promise(r => setTimeout(r, 300));
      
      // Executar cálculo
      const result = await this.modules.engine.execute(this.currentCalculator.id, inputs);
      
      if (result.success) {
        this.lastResult = result.result;
        this.displayResult(result.result);
        
        // Adicionar ao histórico local
        this.addToHistory(result.result);
        
        if (window.NOTIFICATION_MANAGER) {
          window.NOTIFICATION_MANAGER.success("Cálculo realizado com sucesso!");
        }
      } else {
        throw new Error(result.error || 'Erro no cálculo');
      }
      
    } catch (error) {
      console.error('❌ Erro no cálculo:', error);
      
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.error(error.message || 'Erro ao calcular');
      }
      
    } finally {
      this.setCalculateButtonLoading(false);
    }
  }

  /**
   * Coletar inputs do formulário
   */
  collectInputs() {
    const inputs = {};
    const inputElements = document.querySelectorAll('#calculator-inputs input, #calculator-inputs select');
    
    inputElements.forEach(el => {
      if (el.type === 'checkbox') {
        inputs[el.id] = el.checked;
      } else {
        inputs[el.id] = el.value;
      }
    });
    
    return inputs;
  }

  /**
   * Verificar se há inputs válidos
   */
  hasValidInputs(inputs) {
    return Object.values(inputs).some(value => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      value !== false
    );
  }

  /**
   * Configurar estado de loading do botão calcular
   */
  setCalculateButtonLoading(loading) {
    const btn = document.getElementById('btn-calculate');
    if (!btn) return;
    
    if (loading) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';
      btn.disabled = true;
    } else {
      btn.innerHTML = '<i class="fa-solid fa-calculator"></i> Calcular';
      btn.disabled = false;
    }
  }

  /**
   * Exibir resultado
   */
  displayResult(data) {
    const container = document.getElementById('calculator-results');
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Criar elemento de resultado
    const resultElement = this.createResultElement(data);
    container.appendChild(resultElement);
    
    // Mostrar container
    container.classList.remove('hidden');
    
    // Scroll suave para o resultado
    resultElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    // Feedback auditivo
    if (window.VOICE_MANAGER && data.resultado) {
      window.VOICE_MANAGER.speak(`Resultado: ${data.resultado} ${data.unidade || ''}`);
    }
  }

  /**
   * Criar elemento de resultado
   */
  createResultElement(data) {
    const div = document.createElement('div');
    div.className = 'space-y-6 animate-fade-in';
    
    // Cabeçalho do resultado
    div.innerHTML = `
      <div class="card-base p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 text-xl">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider">Resultado</h3>
            <div class="text-3xl font-black text-nurse-primary dark:text-white mt-1">
              ${data.resultado} <span class="text-lg font-bold text-slate-400">${data.unidade || ''}</span>
            </div>
          </div>
        </div>
    `;
    
    // Detalhes (se houver)
    if (data.detalhes && Array.isArray(data.detalhes)) {
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 mb-4 backdrop-blur-sm';
      
      data.detalhes.forEach(detail => {
        const detailElement = document.createElement('div');
        detailElement.className = 'flex justify-between items-center text-sm border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0 pb-2 last:pb-0';
        detailElement.innerHTML = `
          <span class="text-slate-600 dark:text-slate-400 font-medium">${detail.label}</span> 
          <span class="font-bold text-slate-800 dark:text-slate-200">${detail.value}</span>
        `;
        detailsDiv.appendChild(detailElement);
      });
      
      div.appendChild(detailsDiv);
    }
    
    // Auditoria (se houver)
    if (data.auditoria) {
      const auditDiv = document.createElement('div');
      auditDiv.className = 'mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30';
      auditDiv.innerHTML = `
        <p class="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-widest mb-1">
          <i class="fa-solid fa-microscope mr-1"></i> Auditoria de Cálculo
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-300 font-medium">${data.auditoria.metodo}</p>
        <p class="font-mono text-xs mt-1 text-slate-500 bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-700">
          ${data.auditoria.passos}
        </p>
      `;
      div.appendChild(auditDiv);
    }
    
    // Barra de ações
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-green-200 dark:border-green-800/50';
    
    const actions = [
      { 
        icon: 'fa-file-pdf', 
        label: 'Gerar PDF',
        color: 'text-red-500',
        action: () => this.exportPDF() 
      },
      { 
        icon: 'fa-copy', 
        label: 'Copiar',
        color: 'text-blue-500',
        action: () => this.copyResult() 
      },
      { 
        icon: 'fa-stethoscope', 
        label: 'NANDA',
        color: 'text-nurse-secondary',
        action: () => this.showNANDAModal() 
      },
      { 
        icon: 'fa-check-double', 
        label: '9 Certos',
        color: 'text-green-500',
        action: () => this.show9AcertosModal() 
      }
    ];
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-nurse-primary hover:text-white text-slate-600 transition-all group shadow-sm';
      button.innerHTML = `
        <i class="fa-solid ${action.icon} text-xl mb-1 ${action.color} group-hover:text-white"></i>
        <span class="text-[10px] font-bold uppercase">${action.label}</span>
      `;
      button.addEventListener('click', action.action);
      actionsDiv.appendChild(button);
    });
    
    div.appendChild(actionsDiv);
    
    return div;
  }

  /**
   * Resetar calculadora
   */
  resetCalculator() {
    // Limpar inputs
    const inputs = document.querySelectorAll('#calculator-inputs input');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
    
    // Limpar selects
    const selects = document.querySelectorAll('#calculator-inputs select');
    selects.forEach(select => {
      select.selectedIndex = 0;
    });
    
    // Ocultar resultados
    const resultsContainer = document.getElementById('calculator-results');
    if (resultsContainer) {
      resultsContainer.classList.add('hidden');
      resultsContainer.innerHTML = '';
    }
    
    // Resetar último resultado
    this.lastResult = null;
    
    // Feedback
    if (window.NOTIFICATION_MANAGER) {
      window.NOTIFICATION_MANAGER.info('Calculadora resetada');
    }
  }

  /**
   * Exportar PDF
   */
  exportPDF() {
    if (this.modules.pdfGenerator && this.lastResult) {
      this.modules.pdfGenerator.generateAuditPDF(
        this.lastResult, 
        this.currentCalculator
      );
    } else {
      // Fallback para impressão nativa
      window.print();
    }
  }

  /**
   * Copiar resultado
   */
  copyResult() {
    if (!this.lastResult) return;
    
    const text = `Resultado Calculadora Enfermagem: ${this.lastResult.resultado} ${this.lastResult.unidade || ''}`;
    
    navigator.clipboard.writeText(text).then(() => {
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.success("Resultado copiado!");
      }
    }).catch(error => {
      console.error('❌ Erro ao copiar:', error);
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.error("Erro ao copiar resultado");
      }
    });
  }

  /**
   * Mostrar modal de conteúdo
   */
  showContentModal() {
    if (this.modules.modalManager) {
      this.modules.modalManager.showContentModal(this.currentCalculator);
    } else if (window.MODAL_REFERENCE_MANAGER) {
      window.MODAL_REFERENCE_MANAGER.showContentModal();
    }
  }

  /**
   * Mostrar modal NANDA
   */
  showNANDAModal() {
    if (this.modules.modalManager) {
      this.modules.modalManager.showNANDAModal();
    } else if (window.MODAL_REFERENCE_MANAGER) {
      window.MODAL_REFERENCE_MANAGER.showNANDAModal();
    }
  }

  /**
   * Mostrar modal 9 Acertos
   */
  show9AcertosModal() {
    if (this.modules.modalManager) {
      this.modules.modalManager.showMedicationChecklistModal();
    } else if (window.MODAL_REFERENCE_MANAGER) {
      window.MODAL_REFERENCE_MANAGER.showMedicationChecklistModal();
    }
  }

  /**
   * Mostrar modal Metas
   */
  showMetasModal() {
    if (this.modules.modalManager) {
      this.modules.modalManager.showSafetyGoalsModal();
    } else if (window.MODAL_REFERENCE_MANAGER) {
      window.MODAL_REFERENCE_MANAGER.showSafetyGoalsModal();
    }
  }

  /**
   * Fechar modal
   */
  closeModal() {
    const modal = document.getElementById('reference-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  /**
   * Prevenir números negativos
   */
  preventNegativeNumbers(event) {
    if (event.key === '-') {
      event.preventDefault();
      return false;
    }
  }

  /**
   * Adicionar ao histórico local
   */
  addToHistory(result) {
    this.history.unshift({
      ...result,
      viewedAt: new Date()
    });
    
    // Manter apenas os últimos 10
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }
  }

  /**
   * Ocultar loader global
   */
  hideGlobalLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Tratar sucesso de cálculo
   */
  handleCalculationSuccess(result) {
    console.log('✅ Cálculo bem-sucedido:', result);
    
    // Atualizar UI se necessário
    if (result.calculatorId === this.currentCalculator?.id) {
      // UI já foi atualizada pelo displayResult
    }
  }

  /**
   * Tratar erro de cálculo
   */
  handleCalculationError(error) {
    console.error('❌ Erro no cálculo:', error);
    
    // Feedback adicional pode ser adicionado aqui
  }

  /**
   * Compartilhar
   */
  share(platform) {
    const text = `Confira esta calculadora de enfermagem: ${window.location.href}`;
    const urls = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Copiar link
   */
  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.success("Link copiado!");
      }
    }).catch(error => {
      console.error('❌ Erro ao copiar link:', error);
      if (window.NOTIFICATION_MANAGER) {
        window.NOTIFICATION_MANAGER.error("Erro ao copiar link");
      }
    });
  }
}

// Inicialização automática
if (typeof window !== 'undefined') {
  // Criar instância global
  window.CALCULATOR_SYSTEM = new NursingCalculators();
  
  // Inicializar quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    window.CALCULATOR_SYSTEM.initialize();
  });
}

export default NursingCalculators;