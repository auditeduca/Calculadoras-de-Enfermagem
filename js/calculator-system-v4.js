class CalculatorSystem {
  constructor(calculatorId) {
    this.calculatorId = calculatorId;
    this.config = null;
    this.calculator = null;
    this.loaded = false;
  }

  async load() {
    try {
      console.log(`🚀 Carregando calculadora: ${this.calculatorId}`);
      
      // 1. Carregar configuração JSON
      await this.loadConfig();
      
      // 2. Carregar HTML da calculadora
      await this.loadHTML();
      
      // 3. Inicializar campos dinâmicos
      this.initializeDynamicFields();
      
      // 4. Inicializar tabs
      this.initializeTabs();
      
      // 5. Inicializar barra lateral de ferramentas
      this.initializeSidebarTools();
      
      // 6. Carregar lógica da calculadora
      await this.loadCalculatorLogic();
      
      this.loaded = true;
      console.log(`✅ Calculadora ${this.calculatorId} carregada com sucesso`);
      
      // Disparar evento de carregamento
      this.dispatchEvent('calculator:loaded', { calculator: this.calculatorId });
      
    } catch (error) {
      console.error(`❌ Erro ao carregar calculadora ${this.calculatorId}:`, error);
      this.showError(`Erro ao carregar a calculadora: ${error.message}`);
    }
  }

  async loadConfig() {
    const response = await fetch(
      `https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/components/${this.calculatorId}.json`
    );
    
    if (!response.ok) {
      throw new Error(`Configuração não encontrada: ${response.status}`);
    }
    
    this.config = await response.json();
    console.log(`📋 Configuração carregada:`, this.config);
  }

  async loadHTML() {
    const response = await fetch(
      `https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/components/${this.calculatorId}.html`
    );
    
    if (!response.ok) {
      throw new Error(`HTML não encontrado: ${response.status}`);
    }
    
    const html = await response.text();
    const container = document.getElementById(`${this.calculatorId}-container`);
    
    if (!container) {
      throw new Error(`Container #${this.calculatorId}-container não encontrado`);
    }
    
    container.innerHTML = html;
    console.log(`📄 HTML da calculadora injetado`);
  }

  initializeDynamicFields() {
    // Campos do paciente
    const patientFieldsContainer = document.getElementById('patient-fields');
    if (patientFieldsContainer && this.config.fields) {
      const patientFields = this.config.fields.filter(f => 
        f.id.startsWith('patient_')
      );
      
      patientFieldsContainer.innerHTML = patientFields.map(field => 
        this.generateFieldHTML(field)
      ).join('');
    }

    // Campos de cálculo
    const calculationFieldsContainer = document.getElementById('calculation-fields');
    if (calculationFieldsContainer && this.config.fields) {
      const calculationFields = this.config.fields.filter(f => 
        !f.id.startsWith('patient_')
      );
      
      calculationFieldsContainer.innerHTML = calculationFields.map(field => 
        this.generateFieldHTML(field)
      ).join('');
    }
  }

  generateFieldHTML(field) {
    const isRequired = field.required ? 'required-field' : '';
    const tooltipHTML = field.tooltip ? `
      <span class="tooltip-container ml-1">
        <i class="fa-solid fa-circle-info label-tooltip"></i>
        <span class="tooltip-text">${field.tooltip}</span>
      </span>
    ` : '';

    let inputHTML = '';
    
    switch(field.type) {
      case 'select':
        inputHTML = `
          <select id="${field.id}" class="input-field" ${field.required ? 'required' : ''}>
            ${field.options.map(opt => 
              `<option value="${opt.value}" ${opt.value === field.default ? 'selected' : ''}>
                ${opt.label}
              </option>`
            ).join('')}
          </select>
        `;
        break;
        
      case 'date':
        inputHTML = `
          <input id="${field.id}" 
                 type="date" 
                 class="input-field"
                 ${field.required ? 'required' : ''}
                 onchange="CALCULATOR_SYSTEM.validateDate(this)"/>
          <span class="text-xs text-slate-500 mt-1 block">${field.placeholder || 'Campo opcional'}</span>
        `;
        break;
        
      default:
        inputHTML = `
          <input id="${field.id}" 
                 type="${field.type}" 
                 placeholder="${field.placeholder || ''}"
                 ${field.min !== undefined ? `min="${field.min}"` : ''}
                 ${field.step !== undefined ? `step="${field.step}"` : ''}
                 class="input-field" 
                 ${field.required ? 'required' : ''}
                 oninput="this.value = this.value.replace(/[^0-9.]/g, '')"
                 onkeydown="return event.key !== '-' && event.key !== 'e' && event.key !== '+'"/>
          <span class="text-xs text-slate-500 mt-1 block">${field.placeholder || ''}</span>
        `;
    }

    return `
      <div>
        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-inter ${isRequired}">
          ${field.label}
          ${tooltipHTML}
        </label>
        ${inputHTML}
      </div>
    `;
  }

  initializeTabs() {
    const tabsContainer = document.getElementById('calculator-tabs');
    if (!tabsContainer || !this.config.tabs) return;

    tabsContainer.innerHTML = this.config.tabs.map((tab, index) => `
      <button onclick="CALCULATOR_SYSTEM.switchTab('${tab.id}')" 
              class="tab-btn ${index === 0 ? 'active' : ''}" 
              id="btn-tab-${tab.id}">
        ${tab.label}
      </button>
    `).join('');

    // Inicializar conteúdo das tabs
    this.initializeTabContent();
  }

  initializeTabContent() {
    // Tab Sobre
    const sobreContent = document.getElementById('sobre-content');
    if (sobreContent && this.config.formula) {
      sobreContent.innerHTML = `
        <p class="mb-4">Esta calculadora permite o cálculo preciso da quantidade de insulina a ser aspirada em seringas de insulina, considerando diferentes concentrações (U100, U200, U300).</p>
        <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs overflow-x-auto">
          <span class="text-nurse-secondary font-bold block mb-2 uppercase tracking-widest">Equação Auditada</span>
          <code>${this.config.formula.calculation}</code>
        </div>
      `;
    }

    // Tab Instruções
    const ajudaContent = document.getElementById('ajuda-content');
    if (ajudaContent && this.config.instructions) {
      ajudaContent.innerHTML = this.config.instructions.map(instruction => `
        <li class="flex gap-3 text-sm font-medium">
          <i class="fa-solid fa-check-circle text-nurse-secondary mt-1"></i>
          <span>${instruction}</span>
        </li>
      `).join('');
    }

    // Tab Referências
    const referenciaContent = document.getElementById('referencia-content');
    if (referenciaContent && this.config.references) {
      referenciaContent.innerHTML = `
        <div class="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-700">
          ${this.config.references.map(ref => 
            `<p>• <strong>${ref.split('.').shift()}.</strong> ${ref.split('.').slice(1).join('.')}</p>`
          ).join('')}
        </div>
      `;
    }
  }

  initializeSidebarTools() {
    const sidebarContainer = document.getElementById('sidebar-tools');
    if (!sidebarContainer || !this.config.sidebar_tools) return;

    sidebarContainer.innerHTML = this.config.sidebar_tools.map(tool => `
      <button class="tool-btn" 
              id="${tool.id}" 
              aria-label="${tool.label}"
              aria-describedby="${tool.id}-desc"
              role="button"
              tabindex="0"
              title="${tool.label}" 
              onclick="CALCULATOR_SYSTEM.${tool.action}">
        <i class="fas ${tool.icon}" aria-hidden="true"></i>
        <span class="btn-label">${tool.label}</span>
        <span id="${tool.id}-desc" class="sr-only">${tool.description}</span>
      </button>
    `).join('');
  }

  async loadCalculatorLogic() {
    // Carregar o módulo de lógica específica da calculadora
    const modulePath = `https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/components/${this.calculatorId}.js`;
    
    try {
      // Verificar se já existe
      if (window.CalculatorLogic && window.CalculatorLogic[this.calculatorId]) {
        this.calculator = window.CalculatorLogic[this.calculatorId];
        this.calculator.init(this.config);
        return;
      }

      // Carregar dinamicamente
      const script = document.createElement('script');
      script.src = modulePath;
      script.type = 'module';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Esperar inicialização
      setTimeout(() => {
        if (window.CalculatorLogic && window.CalculatorLogic[this.calculatorId]) {
          this.calculator = window.CalculatorLogic[this.calculatorId];
          this.calculator.init(this.config);
        } else {
          console.warn('Módulo de lógica não exportado corretamente');
          this.loadFallbackLogic();
        }
      }, 100);
      
    } catch (error) {
      console.warn(`Módulo de lógica não encontrado, usando fallback:`, error);
      this.loadFallbackLogic();
    }
  }

  loadFallbackLogic() {
    // Lógica básica fallback
    this.calculator = {
      init: (config) => {
        console.log('Usando lógica fallback para:', config.name);
        window.CALCULATOR_SYSTEM = window.CALCULATOR_SYSTEM || {};
        window.CALCULATOR_SYSTEM.config = config;
      }
    };
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded';
    errorDiv.innerHTML = `
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fa-solid fa-exclamation-triangle"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm">${message}</p>
        </div>
      </div>
    `;
    
    const container = document.getElementById(`${this.calculatorId}-container`);
    if (container) {
      container.prepend(errorDiv);
    }
  }

  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // Métodos estáticos para gerenciar múltiplas calculadoras
  static async loadAll() {
    const calculators = document.querySelectorAll('[data-calculator]');
    
    for (const element of calculators) {
      const calculatorId = element.dataset.calculator;
      const system = new CalculatorSystem(calculatorId);
      await system.load();
    }
  }
}

// Exportar para uso global
window.CalculatorSystem = CalculatorSystem;