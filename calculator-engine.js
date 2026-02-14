/**
 * CALCULATOR ENGINE - Motor de Renderização Modular
 * Versão 4.2 - Baseado em JSON
 */

class CalculatorEngine {
  constructor(configUrl) {
    this.configUrl = configUrl;
    this.config = null;
    this.resultData = null;
  }

  async init() {
    try {
      const response = await fetch(this.configUrl);
      if (!response.ok) throw new Error(`Erro ao carregar config: ${response.status}`);
      this.config = await response.json();

      this.renderSEO();
      this.renderBreadcrumb();
      this.renderHeader();
      this.renderTabs();
      this.renderForm();           // ← agora inclui checklists e botão NANDA
      this.renderContentTabs();
      this.renderSidebarMenu();

      await this.loadSharedModais(); // tenta carregar shared-content.json
      console.log('✓ Calculator Engine inicializado');
    } catch (error) {
      console.error('Erro ao inicializar Calculator Engine:', error);
    }
  }

  async loadSharedModais() {
    try {
      const response = await fetch('shared-content.json');
      if (!response.ok) throw new Error('Não foi possível carregar shared-content.json');
      const shared = await response.json();
      window.__sharedContent = shared.shared_content;
      console.log('✓ Conteúdo compartilhado carregado');
    } catch (error) {
      console.info('Info: Modais compartilhados não disponíveis (ignorado).');
    }
  }

  renderSEO() {
    if (!this.config.seo) return;
    document.title = this.config.seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = this.config.seo.description;
  }

  renderBreadcrumb() {
    const nav = document.querySelector('nav.mb-8');
    if (!nav || !this.config.breadcrumb) return;
    const items = this.config.breadcrumb.items.map((item, index) => {
      if (item.url) return `<a href="${item.url}" class="hover:underline text-nurse-accent">${item.label}</a>`;
      return `<span class="text-nurse-primary dark:text-cyan-400 font-bold">${item.label}</span>`;
    }).join('<i class="fa-solid fa-chevron-right text-[10px]"></i>');
    nav.innerHTML = items;
  }

  renderHeader() {
    const header = this.config.header;
    if (!header) return;
    const badge = document.querySelector('header span.bg-nurse-primary');
    const title = document.getElementById('header-title');
    const desc = document.getElementById('header-description');
    if (badge) badge.textContent = header.badge;
    if (title) title.innerHTML = header.titulo;
    if (desc) desc.textContent = header.descricao;
  }

  renderTabs() {
    const nav = document.querySelector('article#calculator-container nav');
    if (!nav || !this.config.abas) return;
    nav.innerHTML = this.config.abas.map(aba => `
      <button 
        onclick="CALCULATOR_SYSTEM.switchTab('${aba.id}')" 
        class="tab-btn ${aba.ativa ? 'active' : ''}" 
        id="btn-tab-${aba.id}">
        ${aba.label}
      </button>
    `).join('');
  }

  renderForm() {
    const formContainer = document.getElementById('pane-calc');
    if (!formContainer || !this.config.formulario) return;

    const sectionsHTML = this.config.formulario.secoes.map(secao => `
      <div class="space-y-6">
        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary/50 mb-4 border-b pb-2">${secao.titulo}</h3>
        <div class="grid md:grid-cols-2 gap-6">
          ${secao.campos.map(campo => this.renderField(campo)).join('')}
        </div>
      </div>
    `).join('');

    // Formulário + resultados + auditoria + checklists + botão NANDA
    formContainer.innerHTML = `
      <div class="space-y-10">
        ${sectionsHTML}
        
        <div class="grid grid-cols-2 gap-4 pt-4">
          <button onclick="CALCULATOR_SYSTEM.calculate()" class="btn-primary-action">
            <i class="fa-solid fa-calculator"></i> Calcular
          </button>
          <button onclick="CALCULATOR_SYSTEM.reset()" class="btn-secondary-action">
            Limpar
          </button>
        </div>
        
        <div id="results-wrapper" class="hidden pt-8 border-t border-slate-200 dark:border-slate-700">
          <div class="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 text-center border-2 border-dashed border-nurse-primary/20 mb-6">
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Dose a Aspirar</p>
            <div id="res-total" class="text-6xl font-black text-[#1A3E74] dark:text-cyan-400 font-nunito">0,00</div>
            <p id="res-unit" class="text-lg font-black text-nurse-secondary mt-2 uppercase">mL</p>
          </div>
          
          <div class="flex flex-col gap-4 mb-10">
            <div class="grid grid-cols-2 gap-4">
              <button id="btn-pdf" onclick="CALCULATOR_SYSTEM.generatePDF()" class="btn-primary-action">
                <i class="fa-solid fa-file-pdf"></i> PDF
              </button>
              <button onclick="CALCULATOR_SYSTEM.copyResult()" class="btn-secondary-action">
                <i class="fa-solid fa-copy"></i> Copiar
              </button>
            </div>
            <!-- Botão NANDA -->
            <button onclick="CALCULATOR_SYSTEM.showNANDAModal()" class="btn-secondary-action bg-nurse-accent text-white hover:bg-nurse-primary py-5 text-xs">
              <i class="fa-solid fa-stethoscope"></i> Buscar Diagnóstico de Enfermagem (NANDA)
            </button>
          </div>
          
          <div class="mb-12">
            <h3 class="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4">
              <i class="fa-solid fa-clipboard-check"></i> Auditoria
            </h3>
            <ul id="audit-list" class="space-y-3"></ul>
          </div>

          <!-- CHECKLISTS DE SEGURANÇA -->
          <div class="space-y-8 mb-12">
            <h2 class="text-xl font-black text-nurse-primary dark:text-cyan-400 flex items-center gap-2 border-l-4 border-nurse-secondary pl-4">
              <i class="fa-solid fa-user-shield"></i> Check-list de Segurança do Paciente
            </h2>
            <div class="bg-white dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
              <div class="mb-8">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <i class="fa-solid fa-check-double"></i> 9 Certos da Medicação
                  </h3>
                  <button onclick="CALCULATOR_SYSTEM.showMedicationChecklist()" class="text-xs text-nurse-secondary hover:text-nurse-primary font-bold">
                    <i class="fa-solid fa-circle-info mr-1"></i> Ver Referência
                  </button>
                </div>
                <div id="checklist-9certos" class="grid grid-cols-1 md:grid-cols-2 gap-2"></div>
              </div>
              <div>
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <i class="fa-solid fa-star"></i> Metas Internacionais de Segurança
                  </h3>
                  <button onclick="CALCULATOR_SYSTEM.showSafetyGoals()" class="text-xs text-nurse-secondary hover:text-nurse-primary font-bold">
                    <i class="fa-solid fa-circle-info mr-1"></i> Ver Referência
                  </button>
                </div>
                <div id="checklist-metas" class="space-y-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderField(campo) {
    const colClass = campo.col || 'md:col-span-1';
    let inputHTML = '';

    switch (campo.type) {
      case 'select':
        inputHTML = `
          <select id="${campo.id}" class="input-field" ${campo.required ? 'required' : ''}>
            ${campo.opcoes.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        `;
        break;
      case 'number':
        inputHTML = `
          <input 
            id="${campo.id}" 
            type="number" 
            class="input-field" 
            placeholder="${campo.placeholder || ''}"
            ${campo.required ? 'required' : ''}
            ${campo.validacao?.min ? `min="${campo.validacao.min}"` : ''}
            ${campo.validacao?.max ? `max="${campo.validacao.max}"` : ''}
          >
        `;
        break;
      default:
        inputHTML = `
          <input 
            id="${campo.id}" 
            type="${campo.type}" 
            class="input-field" 
            placeholder="${campo.placeholder || ''}"
            ${campo.required ? 'required' : ''}
          >
        `;
    }

    return `
      <div class="${colClass}">
        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          ${campo.label}
        </label>
        ${inputHTML}
      </div>
    `;
  }

  renderContentTabs() {
    if (!this.config.conteudo) return;

    const sobrePane = document.getElementById('pane-sobre');
    if (sobrePane && this.config.conteudo.sobre) {
      const sobre = this.config.conteudo.sobre;
      sobrePane.innerHTML = `
        <h2 class="text-2xl font-black mb-4 font-nunito">${sobre.titulo}</h2>
        <p>${sobre.texto}</p>
        <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl font-mono text-xs my-6">
          <code>${sobre.formula_visual}</code>
        </div>
        ${sobre.exemplo ? `
          <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-l-4 border-blue-500">
            <h4 class="font-bold mb-3">Exemplo Prático:</h4>
            <p>${sobre.exemplo.explicacao}</p>
          </div>
        ` : ''}
      `;
    }

    const ajudaPane = document.getElementById('pane-ajuda');
    if (ajudaPane && this.config.conteudo.ajuda) {
      const ajuda = this.config.conteudo.ajuda;
      ajudaPane.innerHTML = `
        <h2 class="text-2xl font-black mb-6 font-nunito">${ajuda.titulo}</h2>
        <div class="space-y-6">
          ${ajuda.passos.map(passo => `
            <div class="flex gap-4 items-start">
              <div class="w-10 h-10 rounded-full bg-nurse-primary text-white flex items-center justify-center font-bold flex-shrink-0">${passo.numero}</div>
              <div>
                <h4 class="font-bold text-lg mb-2">${passo.titulo}</h4>
                <p class="text-slate-600 dark:text-slate-300">${passo.descricao}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    const refPane = document.getElementById('pane-referencia');
    if (refPane && this.config.conteudo.referencia) {
      const ref = this.config.conteudo.referencia;
      refPane.innerHTML = `
        <h2 class="text-2xl font-black mb-6 font-nunito">${ref.titulo}</h2>
        <div class="space-y-4">
          ${ref.itens.map(item => `
            <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <div class="flex items-start gap-3">
                <i class="fa-solid ${this.getIconForType(item.tipo)} text-nurse-primary mt-1"></i>
                <div class="flex-1">
                  <h5 class="font-bold">${item.titulo}</h5>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">${item.autores} ${item.ano ? `(${item.ano})` : ''}</p>
                  ${item.link ? `<a href="${item.link}" target="_blank" class="text-sm text-nurse-accent hover:underline mt-2 inline-block">Acessar</a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  getIconForType(tipo) {
    const icons = { artigo: 'fa-file-lines', protocolo: 'fa-clipboard-check', resolucao: 'fa-gavel', livro: 'fa-book' };
    return icons[tipo] || 'fa-file';
  }

  renderSidebarMenu() {
    const sidebar = document.getElementById('sidebar-tools');
    if (!sidebar || !this.config.menu_lateral) return;
    sidebar.innerHTML = this.config.menu_lateral.map(item => {
      let action = 'showModal';
      if (item.acao === 'switchTab') action = 'switchTab';
      else if (item.acao === 'showModalShared') action = 'showModalShared';
      else if (item.acao === 'tourGuiado') action = 'tourGuiado';
      return `
        <button class="tool-btn" onclick="CALCULATOR_SYSTEM.${action}('${item.parametro}')" title="${item.label}">
          <i class="fas ${item.icone}"></i>
          <span class="btn-label">${item.label}</span>
        </button>
      `;
    }).join('');
  }

  calculate() {
    // Método base – deve ser sobrescrito por engines específicas
    console.warn('Método calculate() não implementado na engine base.');
  }

  renderAudit(prescricao, concentracao, resultado) {
    const auditList = document.getElementById('audit-list');
    if (!auditList) return;
    auditList.innerHTML = `
      <li class="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm">
        <i class="fa-solid fa-check text-green-600 mr-2"></i>
        <strong>Fórmula:</strong> ${this.config.calculo.formula}
      </li>
      <li class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm">
        <i class="fa-solid fa-calculator text-slate-500 mr-2"></i>
        <strong>Cálculo:</strong> ${prescricao} UI ÷ ${concentracao} UI/mL = ${resultado.toFixed(4)} mL
      </li>
      <li class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
        <i class="fa-solid fa-info-circle text-blue-600 mr-2"></i>
        <strong>Concentração:</strong> ${concentracao === 100 ? 'U100' : 'U300'}
      </li>
    `;
  }

  checkAlerts(resultado) {
    if (!this.config.calculo.alertas) return;
    this.config.calculo.alertas.forEach(alerta => {
      const condicao = alerta.condicao.replace('resultado', resultado);
      if (eval(condicao)) {
        window.showToast?.(alerta.mensagem, alerta.tipo);
      }
    });
  }

  reset() {
    this.config.formulario.secoes.forEach(secao => {
      secao.campos.forEach(campo => {
        const element = document.getElementById(campo.id);
        if (element) element.value = campo.type === 'select' ? campo.opcoes[0].value : '';
      });
    });
    document.getElementById('results-wrapper')?.classList.add('hidden');
    this.resultData = null;
  }

  getResultData() {
    return this.resultData;
  }

  getModalConfig(modalId) {
    const modal = this.config.modais?.[modalId];
    if (!modal) return null;
    if (modal.source === 'shared' && modal.shared_id && window.__sharedContent) {
      const shared = window.__sharedContent[modal.shared_id];
      if (shared) return { titulo: shared.titulo, icone: shared.icone, conteudo: shared.html };
    }
    return modal;
  }
}

window.CALCULATOR_ENGINE = null;