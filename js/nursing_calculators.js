/**
 * NURSING_CALCULATORS.JS - Sistema de Calculadoras de Enfermagem
 * Orquestra todas as funcionalidades do sistema modular
 * * @author Calculadoras de Enfermagem
 * @version 2.0.5 (Full Actions & Feedback)
 */

class NursingCalculators {
  constructor(options = {}) {
    this.notificationManager = window.NOTIFICATION_MANAGER;
    this.uiManager = window.UI_MANAGER;
    this.modalReferenceManager = window.MODAL_REFERENCE_MANAGER;
    this.pdfGenerator = window.PDF_GENERATOR ? new window.PDF_GENERATOR() : null;
    
    if (window.CalculatorCore && typeof window.CalculatorCore === 'function') {
        this.core = new window.CalculatorCore(options);
    } else {
        this.core = { eventBus: window.EventBus };
    }

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
      if (!this.contentInjector) throw new Error("Dependências não carregadas");

      await this.contentInjector.loadCalculators();
      this.setupEventListeners();
      this.setupTabListeners();
      this.checkURLParams();

      const loader = document.getElementById('global-loader');
      if(loader) loader.style.display = 'none';

      console.log('✅ Sistema inicializado');
    } catch (error) {
      console.error('❌ Erro:', error);
      if(this.notificationManager) this.notificationManager.error('Erro de inicialização: ' + error.message);
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

  setupTabListeners() {
      const tabs = document.querySelectorAll('.tab-btn');
      tabs.forEach(tab => {
          tab.addEventListener('click', () => {
              tabs.forEach(t => t.classList.remove('active'));
              tab.classList.add('active');
              const contents = document.querySelectorAll('.tab-pane');
              contents.forEach(c => c.classList.add('hidden'));
              const target = document.getElementById(`tab-${tab.dataset.tab}`);
              if(target) target.classList.remove('hidden');
          });
      });
  }

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const calculatorId = urlParams.get('calculator') || 'insulina';
    this.loadCalculator(calculatorId);
  }

  loadCalculator(id) {
    if (!this.contentInjector) return;
    const success = this.contentInjector.injectCalculatorInterface(id);
    if (success) {
      this.currentCalculator = this.contentInjector.getCalculator(id);
      const newUrl = `${window.location.pathname}?calculator=${id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      this.resetCalculator();
      
      // Resetar aba
      const mainTab = document.querySelector('.tab-btn[data-tab="calculator"]');
      if(mainTab) mainTab.click();
    }
  }

  async calculate() {
    if (!this.currentCalculator || !this.calculatorEngine) return;

    const inputs = {};
    const inputElements = document.querySelectorAll('#calculator-inputs input, #calculator-inputs select');
    let hasValue = false;
    
    inputElements.forEach(el => {
      inputs[el.id] = el.value;
      if(el.value) hasValue = true;
    });

    if(!hasValue) {
        this.notificationManager.error("Preencha os campos obrigatórios");
        return;
    }

    const btn = document.getElementById('btn-calculate');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 600)); // Delay para feedback visual

    const result = await this.calculatorEngine.execute(this.currentCalculator.id, inputs);

    btn.innerHTML = originalHTML;
    btn.disabled = false;

    if (result.success) {
      this.lastResult = result.result; // Salva para exportação
      this.displayResult(result.result);
      if(this.notificationManager) this.notificationManager.success("Cálculo realizado com sucesso!");
    }
  }
  
  resetCalculator() {
      const inputs = document.querySelectorAll('#calculator-inputs input');
      inputs.forEach(i => i.value = '');
      document.getElementById('calculator-results').innerHTML = '';
      this.lastResult = null;
  }

  /**
   * Exibe o resultado e os botões de ação (CORRIGIDO)
   */
  displayResult(data) {
    const container = document.getElementById('calculator-results');
    if (!container) return;
    
    // 1. Cartão de Resultado
    let html = `
      <div class="card-base p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800 animate-slide-in shadow-md">
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
    
    // 2. Detalhes
    if(data.detalhes) {
        html += `<div class="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 mb-4 backdrop-blur-sm">`;
        data.detalhes.forEach(d => {
            html += `<div class="flex justify-between items-center text-sm border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0 pb-2 last:pb-0">
                <span class="text-slate-600 dark:text-slate-400 font-medium">${d.label}</span> 
                <span class="font-bold text-slate-800 dark:text-slate-200">${d.value}</span>
            </div>`;
        });
        html += `</div>`;
    }
    
    // 3. Auditoria
    if(data.auditoria) {
         html += `
            <div class="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <p class="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-widest mb-1"><i class="fa-solid fa-microscope mr-1"></i> Auditoria de Cálculo</p>
                <p class="text-xs text-slate-700 dark:text-slate-300 font-medium">${data.auditoria.metodo}</p>
                <p class="font-mono text-xs mt-1 text-slate-500 bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-700">${data.auditoria.passos}</p>
            </div>
         `;
    }

    // 4. BARRA DE AÇÕES (Nova seção)
    html += `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-green-200 dark:border-green-800/50">
            <button onclick="window.CALCULATOR_SYSTEM.exportPDF()" class="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-nurse-primary hover:text-white text-slate-600 transition group shadow-sm">
                <i class="fa-solid fa-file-pdf text-xl mb-1 text-red-500 group-hover:text-white"></i>
                <span class="text-[10px] font-bold uppercase">Gerar PDF</span>
            </button>
            <button onclick="window.CALCULATOR_SYSTEM.copyResult()" class="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-nurse-primary hover:text-white text-slate-600 transition group shadow-sm">
                <i class="fa-regular fa-copy text-xl mb-1 text-blue-500 group-hover:text-white"></i>
                <span class="text-[10px] font-bold uppercase">Copiar</span>
            </button>
            <button onclick="window.MODAL_REFERENCE_MANAGER?.showNANDAModal()" class="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-nurse-primary hover:text-white text-slate-600 transition group shadow-sm">
                <i class="fa-solid fa-stethoscope text-xl mb-1 text-nurse-secondary group-hover:text-white"></i>
                <span class="text-[10px] font-bold uppercase">NANDA</span>
            </button>
            <button onclick="window.MODAL_REFERENCE_MANAGER?.showMedicationChecklistModal()" class="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-nurse-primary hover:text-white text-slate-600 transition group shadow-sm">
                <i class="fa-solid fa-check-double text-xl mb-1 text-green-500 group-hover:text-white"></i>
                <span class="text-[10px] font-bold uppercase">9 Certos</span>
            </button>
        </div>
    `;
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Smooth scroll e focus para acessibilidade
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Leitura automática do resultado (Feedback auditivo)
    if(this.notificationManager && data.resultado) {
        this.notificationManager.speak(`O resultado é ${data.resultado} ${data.unidade || ''}`);
    }
  }

  exportPDF() {
      if(this.pdfGenerator && this.lastResult) {
          this.pdfGenerator.generateResultPDF(this.lastResult, this.currentCalculator);
      } else {
          window.print(); // Fallback
      }
  }

  copyResult() {
      if(!this.lastResult) return;
      const text = `Resultado Calculadora Enfermagem: ${this.lastResult.resultado} ${this.lastResult.unidade}`;
      navigator.clipboard.writeText(text).then(() => {
          this.notificationManager.success("Resultado copiado para a área de transferência!");
      });
  }

  share(platform) {
      /* Mesma implementação anterior */
      const text = `Confira esta calculadora: ${window.location.href}`;
      const urls = {
          whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      };
      if(urls[platform]) window.open(urls[platform], '_blank');
  }
  
  copyLink() {
      /* Mesma implementação anterior */
      navigator.clipboard.writeText(window.location.href).then(() => {
          this.notificationManager.success("Link da ferramenta copiado!");
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
    window.CALCULATOR_SYSTEM = new NursingCalculators();
    window.CALCULATOR_SYSTEM.initialize();
});