/**
 * MAIN_CONTENT_INJECTOR.JS - Injetor de Conteúdo Dinâmico
 * Carrega e injeta conteúdo de calculadoras a partir do JSON
 * * @author Calculadoras de Enfermagem
 * @version 2.0.1 (Fixed JSON Path)
 */

class MainContentInjector {
  constructor(options = {}) {
    // CORREÇÃO: Prioriza a configuração global definida no HTML
    const config = window.APP_CONFIG || {};
    
    // Se definirmos jsonPath no HTML, usa ele. Se não, tenta um fallback.
    // O erro 404 acontecia porque ele buscava em assets/json/ por padrão.
    this.jsonURL = config.jsonPath || options.jsonURL || './data/nursing_calculators.json';
    
    this.calculators = {};
    this.currentCalculator = null;
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.uiManager = options.uiManager || window.UI_MANAGER;
  }

  /**
   * Carregar JSON de calculadoras
   */
  async loadCalculators() {
    try {
      console.log(`📡 Tentando carregar calculadoras de: ${this.jsonURL}`);
      const response = await fetch(this.jsonURL);
      
      if (!response.ok) {
          throw new Error(`HTTP Erro ${response.status}: Arquivo não encontrado em ${this.jsonURL}`);
      }
      
      const data = await response.json();
      this.calculators = data.calculators || {};
      
      console.log(`✅ ${Object.keys(this.calculators).length} calculadoras carregadas com sucesso.`);
      return this.calculators;
    } catch (error) {
      console.error('❌ Erro Crítico ao carregar JSON:', error);
      
      // Tentar notificar o usuário se o gerenciador de notificações estiver carregado
      if (this.notificationManager) {
        this.notificationManager.error('Falha ao carregar dados. Verifique se o arquivo nursing_calculators.json existe na pasta correta.');
      }
      return {};
    }
  }

  /**
   * Obter calculadora por ID
   */
  getCalculator(id) {
    return this.calculators[id];
  }

  /**
   * Injetar interface da calculadora
   */
  injectCalculatorInterface(calculatorId) {
    const calculator = this.getCalculator(calculatorId);
    
    if (!calculator) {
      console.warn(`Calculadora '${calculatorId}' não encontrada no JSON.`);
      return false;
    }

    this.currentCalculator = calculator;
    
    // Atualizar UI
    this.updateElementText('calculator-title', calculator.title);
    this.updateElementText('calculator-description', calculator.description);
    
    const iconEl = document.getElementById('calculator-icon');
    if(iconEl) iconEl.className = `fa-solid ${calculator.icon || 'fa-calculator'} text-3xl text-nurse-primary`;

    // Gerar Inputs
    const inputsContainer = document.getElementById('calculator-inputs');
    if(inputsContainer) {
      inputsContainer.innerHTML = calculator.inputs.map(input => this.createInputHTML(input)).join('');
    }

    return true;
  }

  updateElementText(id, text) {
      const el = document.getElementById(id);
      if(el) el.textContent = text;
  }

  createInputHTML(input) {
    const requiredStar = input.required ? '<span class="text-red-500">*</span>' : '';
    
    let inputField = '';
    const commonClasses = "w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:border-nurse-primary focus:ring-2 focus:ring-nurse-primary/20 transition-all p-3";

    if (input.type === 'select') {
      const options = input.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
      inputField = `<select id="${input.id}" class="${commonClasses}">${options}</select>`;
    } else {
      inputField = `<input type="${input.type}" id="${input.id}" class="${commonClasses}" placeholder="${input.placeholder || ''}" ${input.step ? `step="${input.step}"` : ''}>`;
    }

    return `
      <div class="form-group">
        <label for="${input.id}" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          ${input.label} ${requiredStar}
        </label>
        ${inputField}
        ${input.help ? `<p class="text-xs text-slate-500 mt-1">${input.help}</p>` : ''}
      </div>
    `;
  }
}

// Exportar para global
window.MainContentInjector = MainContentInjector;