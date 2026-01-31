/**
 * MAIN_CONTENT_INJECTOR.JS - Injetor de Conteúdo Dinâmico
 * Carrega e injeta conteúdo de calculadoras a partir do JSON
 * * @author Calculadoras de Enfermagem
 * @version 2.0.3 (Populates Tabs)
 */

class MainContentInjector {
  constructor(options = {}) {
    const appConfig = window.APP_CONFIG || {};
    this.baseURL = appConfig.basePath || options.baseURL || '.';
    this.jsonURL = appConfig.jsonPath || options.jsonURL || './data/nursing_calculators.json';
    
    this.calculators = {};
    this.currentCalculator = null;
    this.notificationManager = options.notificationManager || window.NOTIFICATION_MANAGER;
    this.uiManager = options.uiManager || window.UI_MANAGER;
  }

  async loadCalculators() {
    try {
      console.log(`📡 Carregando calculadoras de: ${this.jsonURL}`);
      const response = await fetch(this.jsonURL);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      this.calculators = data.calculators || {};
      console.log(`✅ ${Object.keys(this.calculators).length} calculadoras carregadas`);
      return this.calculators;
    } catch (error) {
      console.error('Erro ao carregar calculadoras (JSON):', error);
      if(this.notificationManager) this.notificationManager.error('Erro ao carregar definições.');
      return {};
    }
  }

  getCalculator(id) {
    return this.calculators[id];
  }

  injectCalculatorInterface(calculatorId) {
    const calculator = this.getCalculator(calculatorId);
    
    if (!calculator) {
      console.warn(`Calculadora ${calculatorId} não encontrada.`);
      return false;
    }

    this.currentCalculator = calculator;
    
    // UI Básica
    this.safeSetText('calculator-title', calculator.title);
    this.safeSetText('calculator-description', calculator.description);
    this.safeSetText('breadcrumb-current', calculator.title);
    
    const iconEl = document.getElementById('calculator-icon');
    if(iconEl) iconEl.className = `fa-solid ${calculator.icon || 'fa-calculator'} text-2xl text-nurse-primary dark:text-cyan-400`;

    // 1. Injetar Inputs (Aba Calculadora)
    const inputsContainer = document.getElementById('calculator-inputs');
    if(inputsContainer) {
      inputsContainer.innerHTML = calculator.inputs.map(input => this.createInputHTML(input)).join('');
    }

    // 2. Injetar Tags
    const tagsContainer = document.getElementById('tags-container');
    if(tagsContainer && calculator.tags) {
      tagsContainer.innerHTML = calculator.tags.map(tag => `<span class="tag-pill-footer">${tag}</span>`).join('');
    }
    
    // 3. Injetar Conteúdo das Abas Extras (Sobre/Instruções/Referências)
    this.populateTabs(calculator);

    // Sidebar Extra
    const sidebarContainer = document.getElementById('sidebar-content');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = ''; 
        if (calculator.sidebarContent) sidebarContainer.innerHTML = calculator.sidebarContent;
    }

    return true;
  }
  
  /**
   * Preenche as abas com base no JSON 'content'
   */
  populateTabs(calculator) {
      // Aba Sobre
      const aboutEl = document.getElementById('tab-about');
      if(aboutEl) {
          aboutEl.innerHTML = `
            <h3 class="font-bold text-lg mb-2 text-nurse-primary dark:text-cyan-400">${calculator.title}</h3>
            <p class="mb-4">${calculator.description}</p>
            ${calculator.content ? this.formatContent(calculator.content, 'about') : ''}
          `;
      }

      // Aba Instruções
      const instEl = document.getElementById('tab-instructions');
      if(instEl) {
          // Procura conteúdo marcado como instrução ou usa padrão
          instEl.innerHTML = calculator.content 
            ? this.formatContent(calculator.content, 'instructions')
            : '<p>Preencha os campos solicitados para obter o resultado.</p>';
      }
      
      // Aba Referências (Pode vir de um campo references no JSON ou content)
      const refEl = document.getElementById('tab-references');
      if(refEl) {
           // Exemplo estático ou dinâmico se houver no JSON
           refEl.innerHTML = calculator.references 
            ? `<ul class="list-disc pl-5 space-y-2">${calculator.references.map(r => `<li>${r}</li>`).join('')}</ul>`
            : '<p>Protocolos Institucionais Padrão (2025).</p>';
      }
  }

  /**
   * Formata array de conteúdo do JSON em HTML
   */
  formatContent(contentArray, filterType) {
      if(!Array.isArray(contentArray)) return '';
      
      // Filtra ou formata tudo se não houver filtro específico
      return contentArray.map(item => `
        <div class="mb-4">
            <h4 class="font-bold text-md mb-1">${item.title}</h4>
            <p>${item.description}</p>
        </div>
      `).join('');
  }

  safeSetText(id, text) {
      const el = document.getElementById(id);
      if(el) el.textContent = text;
  }

  createInputHTML(input) {
    const requiredStar = input.required ? '<span class="text-red-500 ml-1">*</span>' : '';
    const helpTooltip = input.help ? `
      <div class="group relative inline-block ml-2">
        <i class="fa-regular fa-circle-question text-slate-400 hover:text-nurse-primary cursor-help"></i>
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center shadow-lg pointer-events-none">
          ${input.help}
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      </div>
    ` : '';

    let inputField = '';
    const baseClass = "w-full rounded-xl border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-nurse-primary focus:ring focus:ring-nurse-primary/20 transition-all p-3";

    if (input.type === 'select') {
      const options = input.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
      inputField = `<select id="${input.id}" name="${input.id}" class="${baseClass}" ${input.required ? 'required' : ''}>${options}</select>`;
    } else {
      inputField = `
        <input type="${input.type}" id="${input.id}" name="${input.id}" 
          class="${baseClass}"
          placeholder="${input.placeholder || ''}"
          ${input.min ? `min="${input.min}"` : ''}
          ${input.max ? `max="${input.max}"` : ''}
          ${input.step ? `step="${input.step}"` : ''}
          ${input.required ? 'required' : ''}
          onkeydown="window.preventNegative && window.preventNegative(event)"
        />
      `;
    }

    return `
      <div class="form-group mb-4 animate-fade-in">
        <label for="${input.id}" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          ${input.label} ${requiredStar} ${helpTooltip}
        </label>
        ${inputField}
      </div>
    `;
  }
}

window.MainContentInjector = MainContentInjector;