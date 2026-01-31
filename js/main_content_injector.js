/**
 * MAIN_CONTENT_INJECTOR.JS - Injetor de Conteúdo Dinâmico
 * Carrega e injeta conteúdo de calculadoras a partir do JSON
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class MainContentInjector {
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/';
    this.jsonURL = options.jsonURL || `${this.baseURL}assets/json/nursing_calculators.json`;
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
      const response = await fetch(this.jsonURL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      this.calculators = data.calculators || {};
      
      console.log(`✅ ${Object.keys(this.calculators).length} calculadoras carregadas`);
      return this.calculators;
    } catch (error) {
      console.error('Erro ao carregar calculadoras:', error);
      this.notificationManager.error('Erro ao carregar calculadoras');
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
   * Injetar conteúdo principal
   */
  async injectMainContent(calculatorId) {
    const calculator = this.getCalculator(calculatorId);
    
    if (!calculator) {
      this.notificationManager.error(`Calculadora '${calculatorId}' não encontrada`);
      return;
    }

    this.currentCalculator = calculator;

    // Atualizar título e meta tags
    this.updatePageMetadata(calculator);

    // Injetar seção de entrada
    this.injectInputSection(calculator);

    // Injetar seção de resultados
    this.injectResultsSection(calculator);

    // Injetar seção de conteúdo lateral
    this.injectSidebarContent(calculator);

    // Injetar tags
    this.injectTags(calculator);

    console.log(`✅ Conteúdo de '${calculatorId}' injetado`);
  }

  /**
   * Atualizar metadados da página
   */
  updatePageMetadata(calculator) {
    document.title = `${calculator.title} | Calculadoras de Enfermagem Profissional`;
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', calculator.description);
    }

    // Meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      const keywords = [...calculator.tags, ...calculator.keywords || []].join(', ');
      metaKeywords.setAttribute('content', keywords);
    }

    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', calculator.title);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', calculator.description);
  }

  /**
   * Injetar seção de entrada
   */
  injectInputSection(calculator) {
    const container = document.getElementById('calculator-inputs');
    if (!container) return;

    let html = '<div class="space-y-4">';

    calculator.inputs.forEach(input => {
      html += `
        <div class="form-group">
          <label for="${input.id}" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
            ${input.label}
            ${input.required ? '<span class="text-red-500">*</span>' : ''}
            ${input.tooltip ? `<span class="label-tooltip" title="${input.tooltip}"><i class="fa-solid fa-circle-question"></i></span>` : ''}
          </label>
          
          ${this.createInputField(input)}
          
          ${input.help ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${input.help}</p>` : ''}
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Criar campo de entrada
   */
  createInputField(input) {
    const baseAttrs = `
      id="${input.id}"
      name="${input.id}"
      class="input-field"
      ${input.required ? 'required' : ''}
      ${input.min !== undefined ? `min="${input.min}"` : ''}
      ${input.max !== undefined ? `max="${input.max}"` : ''}
      ${input.placeholder ? `placeholder="${input.placeholder}"` : ''}
    `;

    switch (input.type) {
      case 'number':
        return `<input type="number" ${baseAttrs} step="${input.step || 0.01}" onkeypress="return window.preventNegative(event)"/>`;
      
      case 'select':
        return `
          <select ${baseAttrs}>
            <option value="">Selecione uma opção</option>
            ${input.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        `;
      
      case 'date':
        return `<input type="date" ${baseAttrs}/>`;
      
      case 'text':
      default:
        return `<input type="text" ${baseAttrs}/>`;
    }
  }

  /**
   * Injetar seção de resultados
   */
  injectResultsSection(calculator) {
    const container = document.getElementById('calculator-results');
    if (!container) return;

    let html = `
      <div class="hidden" id="results-wrapper">
        <div class="bg-gradient-to-br from-nurse-primary to-nurse-accent text-white p-8 rounded-2xl mb-6">
          <p class="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Resultado Final</p>
          <div class="text-5xl font-black font-nunito mb-2">
            <span id="res-total">---</span>
            <span id="res-unit" class="text-2xl ml-2">---</span>
          </div>
          <p id="res-formula" class="text-sm opacity-90 mt-4"></p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button id="btn-pdf" onclick="window.PDF_GENERATOR?.generateAuditPDF(window.CURRENT_RESULT)" class="btn btn-primary">
            <i class="fa-solid fa-file-pdf"></i> Gerar PDF
          </button>
          <button onclick="window.CALCULATOR_SYSTEM?.copyResult()" class="btn btn-secondary">
            <i class="fa-solid fa-copy"></i> <span id="copy-btn-text">Copiar Resultado</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Injetar conteúdo lateral
   */
  injectSidebarContent(calculator) {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    let html = `
      <div class="card-base p-6 mb-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary dark:text-cyan-400 mb-4 flex items-center gap-2 border-b pb-3">
          <i class="fa-solid fa-book"></i> Conteúdo
        </h3>
        <div class="space-y-3 text-sm">
          ${calculator.content ? calculator.content.map((section, idx) => `
            <div class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border-l-4 border-nurse-secondary">
              <h4 class="font-bold text-slate-900 dark:text-slate-100 mb-1">${section.title}</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400">${section.description}</p>
            </div>
          `).join('') : '<p class="text-xs text-slate-500">Nenhum conteúdo disponível</p>'}
        </div>
      </div>

      <div class="card-base p-6 mb-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary dark:text-cyan-400 mb-4 flex items-center gap-2 border-b pb-3">
          <i class="fa-solid fa-check-double"></i> 9 Certos
        </h3>
        <div id="checklist-9certos" class="space-y-2"></div>
      </div>

      <div class="card-base p-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary dark:text-cyan-400 mb-4 flex items-center gap-2 border-b pb-3">
          <i class="fa-solid fa-star"></i> Metas Internacionais
        </h3>
        <div id="checklist-metas" class="space-y-2"></div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Injetar tags
   */
  injectTags(calculator) {
    const container = document.getElementById('tags-container');
    if (!container) return;

    const tagsHTML = calculator.tags.map(tag => `
      <a href="?search=${encodeURIComponent(tag)}" class="tag-pill" onclick="window.MAIN_CONTENT_INJECTOR?.searchByTag('${tag}'); return false;">
        #${tag}
      </a>
    `).join('');

    container.innerHTML = tagsHTML;
  }

  /**
   * Buscar por tag
   */
  async searchByTag(tag) {
    const results = Object.values(this.calculators).filter(calc =>
      calc.tags && calc.tags.includes(tag)
    );

    if (results.length === 0) {
      this.notificationManager.info(`Nenhuma calculadora encontrada com a tag #${tag}`);
      return;
    }

    // Exibir resultados em modal ou página de busca
    this.showSearchResults(results, tag);
  }

  /**
   * Mostrar resultados de busca
   */
  showSearchResults(results, query) {
    const content = `
      <div class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <p class="text-sm font-bold text-blue-900 dark:text-blue-200">
            ${results.length} resultado(s) encontrado(s) para: <strong>#${query}</strong>
          </p>
        </div>

        <div class="space-y-2">
          ${results.map(calc => `
            <a href="?calculator=${calc.id}" class="block p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-nurse-secondary transition">
              <h4 class="font-bold text-slate-900 dark:text-slate-100 mb-1">${calc.title}</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400">${calc.description}</p>
            </a>
          `).join('')}
        </div>
      </div>
    `;

    window.MODAL_MANAGER?.register('search-results', {
      title: `Resultados da Busca: #${query}`,
      icon: 'fa-magnifying-glass',
      content
    });

    window.MODAL_MANAGER?.show('search-results');
  }

  /**
   * Renderizar checklists
   */
  renderChecklists() {
    const certos = [
      'Paciente Certo',
      'Medicação Certa',
      'Dose Certa',
      'Via Certa',
      'Hora Certa',
      'Registro Certo',
      'Validade Certa',
      'Resposta Certa',
      'Forma Farmacêutica Certa'
    ];

    const checklistContainer = document.getElementById('checklist-9certos');
    if (checklistContainer) {
      checklistContainer.innerHTML = certos.map(c => `
        <label class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer hover:border-green-500 transition group animate-fade-in">
          <input type="checkbox" class="w-4 h-4 accent-green-600 transition"/>
          <span class="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-green-600">${c}</span>
        </label>
      `).join('');
    }

    const metas = [
      { id: 1, text: 'Identificar o paciente corretamente', class: 'glass-meta-blue' },
      { id: 2, text: 'Comunicação Efetiva na passagem de plantão', class: 'glass-meta-blue' },
      { id: 3, text: 'Segurança de Medicamentos de Alta Vigilância', class: 'glass-meta-orange' },
      { id: 6, text: 'Reduzir risco de quedas do paciente', class: 'glass-meta-blue' }
    ];

    const metasContainer = document.getElementById('checklist-metas');
    if (metasContainer) {
      metasContainer.innerHTML = metas.map(m => `
        <label class="glass-meta ${m.class} py-3 cursor-pointer group animate-fade-in">
          <input type="checkbox" class="w-4 h-4 accent-white mr-2 transition"/>
          <span class="text-xs uppercase font-black tracking-wider group-hover:underline">Meta ${m.id}: ${m.text}</span>
        </label>
      `).join('');
    }
  }
}

// Instância global
window.MAIN_CONTENT_INJECTOR = new MainContentInjector({
  notificationManager: window.NOTIFICATION_MANAGER,
  uiManager: window.UI_MANAGER
});

// Exportar
window.MainContentInjector = MainContentInjector;
