/**
 * NURSING_CALCULATORS.JS - Sistema de Calculadoras de Enfermagem
 * Orquestra todas as funcionalidades do sistema modular (Factory Pattern)
 * * @author Calculadoras de Enfermagem
 * @version 2.0.4 (Added Tab Logic)
 */

class NursingCalculators {
  constructor(options = {}) {
    // 1. Inicializa Gerenciadores Básicos
    this.notificationManager = window.NOTIFICATION_MANAGER;
    this.uiManager = window.UI_MANAGER;
    this.modalReferenceManager = window.MODAL_REFERENCE_MANAGER;
    
    // 2. Instancia o Core
    if (window.CalculatorCore && typeof window.CalculatorCore === 'function') {
        this.core = new window.CalculatorCore(options);
    } else {
        this.core = { eventBus: window.EventBus };
    }

    // 3. INSTANCIAÇÃO DE DEPENDÊNCIAS
    if (window.CalculatorEngine) {
        this.calculatorEngine = new window.CalculatorEngine({
            eventBus: this.core.eventBus,
            notificationManager: this.notificationManager
        });
    }

    if (window.MainContentInjector) {
        this.contentInjector = new window.MainContentInjector({
            notificationManager: this.notificationManager
        });
    }

    if (window.NursingEngine && this.calculatorEngine) {
        this.nursingEngine = new window.NursingEngine({
            calculatorEngine: this.calculatorEngine,
            notificationManager: this.notificationManager
        });
        this.nursingEngine.initializeCalculators();
    }

    this.currentCalculator = null;
    this.lastResult = null;
  }

  async initialize() {
    console.log('🏥 Inicializando Sistema de Calculadoras de Enfermagem...');

    try {
      if (!this.contentInjector) {
          throw new Error("Content Injector não inicializado (Classe não encontrada)");
      }

      await this.contentInjector.loadCalculators();
      this.setupEventListeners();
      this.setupTabListeners(); // NOVA LÓGICA DE ABAS
      this.checkURLParams();

      const loader = document.getElementById('global-loader');
      if(loader) loader.style.display = 'none';

      console.log('✅ Sistema inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
      if(this.notificationManager) {
          this.notificationManager.error('Falha na inicialização do sistema: ' + error.message);
      }
    }
  }

  setupEventListeners() {
    const btnCalc = document.getElementById('btn-calculate');
    if (btnCalc) btnCalc.addEventListener('click', () => this.calculate());

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.resetCalculator());
    
    document.querySelectorAll('a[href^="?calculator="]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const urlParams = new URLSearchParams(link.getAttribute('href').split('?')[1]);
            const calcId = urlParams.get('calculator');
            this.loadCalculator(calcId);
        });
    });
  }

  /**
   * Configurar lógica das abas
   */
  setupTabListeners() {
      const tabs = document.querySelectorAll('.tab-btn');
      tabs.forEach(tab => {
          tab.addEventListener('click', () => {
              // Remover ativo de todas
              tabs.forEach(t => t.classList.remove('active'));
              // Adicionar ativo na clicada
              tab.classList.add('active');

              // Esconder todos os conteúdos
              const contents = document.querySelectorAll('.tab-pane');
              contents.forEach(c => c.classList.add('hidden'));

              // Mostrar conteúdo alvo
              const targetId = `tab-${tab.dataset.tab}`;
              const target = document.getElementById(targetId);
              if(target) target.classList.remove('hidden');
          });
      });
  }

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const calculatorId = urlParams.get('calculator');
    
    if (calculatorId) {
      this.loadCalculator(calculatorId);
    } else {
      this.loadCalculator('insulina');
    }
  }

  loadCalculator(id) {
    if (!this.contentInjector) return;
    
    const success = this.contentInjector.injectCalculatorInterface(id);
    if (success) {
      this.currentCalculator = this.contentInjector.getCalculator(id);
      
      const newUrl = `${window.location.pathname}?calculator=${id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
      const resultsContainer = document.getElementById('calculator-results');
      if(resultsContainer) resultsContainer.innerHTML = '';

      // Resetar para aba principal ao trocar calculadora
      const mainTab = document.querySelector('.tab-btn[data-tab="calculator"]');
      if(mainTab) mainTab.click();
    }
  }

  async calculate() {
    if (!this.currentCalculator || !this.calculatorEngine) return;

    const inputs = {};
    const inputElements = document.querySelectorAll('#calculator-inputs input, #calculator-inputs select');
    inputElements.forEach(el => inputs[el.id] = el.value);

    const btn = document.getElementById('btn-calculate');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 500));

    const result = await this.calculatorEngine.execute(this.currentCalculator.id, inputs);

    btn.innerHTML = originalText;
    btn.disabled = false;

    if (result.success) {
      this.displayResult(result.result);
    }
  }
  
  resetCalculator() {
      const inputs = document.querySelectorAll('#calculator-inputs input');
      inputs.forEach(i => i.value = '');
      document.getElementById('calculator-results').innerHTML = '';
  }

  displayResult(data) {
    const container = document.getElementById('calculator-results');
    if (!container) return;
    
    let html = `
      <div class="card-base p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 animate-slide-in">
        <h3 class="text-xl font-bold text-green-800 dark:text-green-300 mb-4">
            <i class="fa-solid fa-check-circle"></i> Resultado: ${data.resultado} ${data.unidade || ''}
        </h3>
    `;
    
    if(data.detalhes) {
        html += `<div class="space-y-2 mb-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">`;
        data.detalhes.forEach(d => {
            html += `<div class="flex justify-between text-sm"><span class="text-slate-500">${d.label}:</span> <span class="font-bold">${d.value}</span></div>`;
        });
        html += `</div>`;
    }
    
    if(data.auditoria) {
         html += `
            <div class="mt-4 pt-4 border-t border-green-200 dark:border-green-800 text-xs text-slate-500">
                <p><strong>Auditoria de Cálculo:</strong> ${data.auditoria.metodo}</p>
                <p class="font-mono mt-1">${data.auditoria.passos}</p>
            </div>
         `;
    }
    
    html += `</div>`;
    container.innerHTML = html;
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  share(platform) {
    const text = `Confira esta calculadora de ${this.currentCalculator?.title || 'Enfermagem'}: ${window.location.href}`;
    const urls = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { if(this.notificationManager) this.notificationManager.success('Link copiado!'); })
      .catch(err => { console.error(err); });
  }
}

document.addEventListener('DOMContentLoaded', () => {
    window.CALCULATOR_SYSTEM = new NursingCalculators();
    window.CALCULATOR_SYSTEM.initialize();
});