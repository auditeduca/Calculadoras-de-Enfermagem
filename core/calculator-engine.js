/**
 * CALCULATOR ENGINE - Motor de Renderização Modular
 * Versão 4.3 - Correção de Compatibilidade de Construtor e Renderização
 */

class CalculatorEngine {
  /**
   * Construtor Híbrido: Aceita URL (string) ou Configuração (objeto)
   * Corrige erro de integração com calculator-system-v42.js
   */
  constructor(configOrUrl) {
    if (typeof configOrUrl === 'object' && configOrUrl !== null) {
      // Inicialização via Sistema (passando objeto JSON)
      this.config = configOrUrl;
      this.configUrl = null;
    } else {
      // Inicialização Standalone (passando URL)
      this.configUrl = configOrUrl;
      this.config = null;
    }
    this.resultData = null;
  }

  /**
   * Inicializa o sistema carregando a configuração (se necessário)
   */
  async init() {
    try {
      // Se config já existe (passado via construtor), usa ele
      if (!this.config && this.configUrl) {
        const response = await fetch(this.configUrl);
        if (!response.ok) throw new Error(`Erro ao carregar config: ${response.status}`);
        this.config = await response.json();
      }

      if (!this.config) throw new Error("Configuração não definida");
      
      // Carrega modais compartilhados (merge)
      await this.loadSharedModais();
      
      // Renderiza componentes (se chamado via init direto)
      this.render();
      
      console.log('✓ Calculator Engine inicializado');
    } catch (error) {
      console.error('Erro ao inicializar Calculator Engine:', error);
    }
  }

  /**
   * Método central de renderização (Novo v4.2)
   * Chamado explicitamente pelo calculator-system-v42.js
   */
  render() {
    if (!this.config) {
        console.error("Erro: Tentativa de renderizar sem configuração carregada.");
        return;
    }
    this.renderSEO();
    this.renderHeader();
    this.renderBreadcrumb();
    this.renderTags();        
    this.renderSidebarMenu(); 
    this.renderTabs();
    this.renderForm();
    this.renderContentTabs();
  }

  /**
   * Carrega modais compartilhados do arquivo shared-modais.json
   */
  async loadSharedModais() {
    try {
      const response = await fetch('shared-modais.json');
      if (!response.ok) return; // Silencioso se não existir
      const shared = await response.json();
      if (shared.shared_modais && this.config) {
        this.config.modais = { ...this.config.modais, ...shared.shared_modais };
      }
    } catch (e) {
      console.warn('Info: Modais compartilhados não carregados (opcional).');
    }
  }

  /**
   * Renderiza tags SEO
   */
  renderSEO() {
    if (!this.config.seo) return;
    
    document.title = this.config.seo.title || document.title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && this.config.seo.description) {
      metaDesc.content = this.config.seo.description;
    }
  }

  /**
   * Renderiza breadcrumb (Corrigido para aceitar Array direto)
   */
  renderBreadcrumb() {
    const nav = document.querySelector('nav.mb-8');
    if (!nav || !this.config.breadcrumb) return;
    
    const itemsList = Array.isArray(this.config.breadcrumb) 
      ? this.config.breadcrumb 
      : this.config.breadcrumb.items;

    if (!itemsList) return;

    const itemsHTML = itemsList.map((item) => {
      if (item.url && item.url !== "" && item.url !== "#") {
        return `<a href="${item.url}" class="hover:underline text-nurse-accent transition-colors">${item.label}</a>`;
      }
      return `<span class="text-nurse-primary dark:text-cyan-400 font-bold">${item.label}</span>`;
    }).join('<i class="fa-solid fa-chevron-right text-[10px] mx-2 text-slate-400"></i>');
    
    nav.innerHTML = itemsHTML;
  }

  /**
   * Renderiza header da página
   */
  renderHeader() {
    const header = this.config.header;
    if (!header) return;
    
    const badge = document.querySelector('header span.bg-nurse-primary');
    const title = document.getElementById('header-title');
    const desc = document.getElementById('header-description');
    
    if (badge) badge.textContent = header.categoria || header.badge || 'Calculadora';
    if (title) title.innerHTML = header.titulo || '';
    if (desc) desc.textContent = header.descricao || '';
  }

  /**
   * Renderiza abas de navegação
   */
  renderTabs() {
    const nav = document.querySelector('article#calculator-container nav');
    if (!nav || !this.config.abas) return;
    
    nav.innerHTML = this.config.abas.map(aba => `
      <button 
        onclick="CALCULATOR_SYSTEM.switchTab('${aba.id}')" 
        class="tab-btn ${aba.id === 'calc' ? 'active' : ''}" 
        id="btn-tab-${aba.id}">
        ${aba.icon ? `<i class="fa-solid ${aba.icon} mr-2"></i>` : ''}
        ${aba.label}
      </button>
    `).join('');
  }

  /**
   * Renderiza formulário dinamicamente
   */
  renderForm() {
    const formContainer = document.getElementById('pane-calc');
    if (!formContainer || !this.config.formulario) return;
    
    const sectionsHTML = this.config.formulario.secoes.map(secao => `
      <div class="space-y-6">
        ${secao.titulo ? `
        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary/50 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          ${secao.titulo}
        </h3>` : ''}
        <div class="grid md:grid-cols-2 gap-6">
          ${secao.campos.map(campo => this.renderField(campo)).join('')}
        </div>
      </div>
    `).join('');
    
    formContainer.innerHTML = `
      <div class="space-y-10">
        ${sectionsHTML}
        
        <div class="grid grid-cols-2 gap-4 pt-4">
          <button onclick="CALCULATOR_SYSTEM.calculate()" class="btn-primary-action">
            <i class="fa-solid fa-calculator"></i> ${this.config.formulario.botao_texto || 'Calcular'}
          </button>
          <button onclick="CALCULATOR_SYSTEM.reset()" class="btn-secondary-action">
            ${this.config.formulario.limpar_texto || 'Limpar'}
          </button>
        </div>
        
        <div id="results-wrapper" class="hidden pt-8 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
          <div class="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 text-center border-2 border-dashed border-nurse-primary/20 mb-6">
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Resultado</p>
            <div id="res-total" class="text-6xl font-black text-[#1A3E74] dark:text-cyan-400 font-nunito">0,00</div>
            <p id="res-unit" class="text-lg font-black text-nurse-secondary mt-2 uppercase"></p>
          </div>
          
          <div class="flex flex-col gap-4 mb-10">
            <div class="grid grid-cols-2 gap-4">
              <button onclick="CALCULATOR_SYSTEM.generatePDF()" class="btn-primary-action">
                <i class="fa-solid fa-file-pdf"></i> PDF
              </button>
              <button onclick="CALCULATOR_SYSTEM.copyResult()" class="btn-secondary-action">
                <i class="fa-solid fa-copy"></i> Copiar
              </button>
            </div>
          </div>
          
          <div class="mb-12">
            <h3 class="text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4">
              <i class="fa-solid fa-clipboard-check"></i> Auditoria / Detalhes
            </h3>
            <ul id="audit-list" class="space-y-3"></ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza um campo do formulário
   */
  renderField(campo) {
    const colClass = campo.col || 'md:col-span-1';
    
    let inputHTML = '';
    
    switch (campo.type) {
      case 'select':
        inputHTML = `
          <select id="${campo.id}" class="input-field" ${campo.required ? 'required' : ''}>
            ${campo.opcoes.map(opt => `
              <option value="${opt.value}">${opt.label}</option>
            `).join('')}
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
            step="${campo.step || 'any'}"
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
        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" for="${campo.id}">
          ${campo.label}
        </label>
        ${inputHTML}
      </div>
    `;
  }

  /**
   * Renderiza conteúdo das abas
   */
  renderContentTabs() {
    if (!this.config.conteudo) return;
    
    // ABA SOBRE
    const sobrePane = document.getElementById('pane-sobre');
    const conteudoSobre = this.config.conteudo.sobre;
    
    if (sobrePane && conteudoSobre) {
      const sobre = conteudoSobre;
      if (sobre.texto && !sobre.titulo) {
         sobrePane.innerHTML = `<div class="prose dark:prose-invert">${sobre.texto}</div>`;
      } else {
         sobrePane.innerHTML = `
        ${sobre.titulo ? `<h2 class="text-2xl font-black mb-4 font-nunito">${sobre.titulo}</h2>` : ''}
        ${sobre.texto || ''}
        ${sobre.formula_visual ? `
        <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl font-mono text-xs my-6 text-center border border-slate-200 dark:border-slate-700">
          <code>${sobre.formula_visual}</code>
        </div>` : ''}
        ${sobre.exemplo ? `
          <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-l-4 border-blue-500 mt-4">
            <h4 class="font-bold mb-3 text-blue-800 dark:text-blue-300">Exemplo Prático:</h4>
            <p class="text-sm">${sobre.exemplo.explicacao || ''}</p>
            ${sobre.exemplo.resultado ? `
            <div class="mt-4 font-mono text-sm bg-white dark:bg-slate-800 p-2 rounded">
              <strong>Cálculo:</strong> ${sobre.exemplo.prescricao || ''} ÷ ${sobre.exemplo.concentracao || ''} = ${sobre.exemplo.resultado}
            </div>` : ''}
          </div>
        ` : ''}
      `;
      }
    }
    
    // ABA AJUDA
    const ajudaPane = document.getElementById('pane-ajuda');
    const conteudoAjuda = this.config.conteudo.ajuda;

    if (ajudaPane && conteudoAjuda) {
      const ajuda = conteudoAjuda;
      if (ajuda.texto && !ajuda.passos) {
          ajudaPane.innerHTML = `<div class="prose dark:prose-invert">${ajuda.texto}</div>`;
      } else {
          ajudaPane.innerHTML = `
            ${ajuda.titulo ? `<h2 class="text-2xl font-black mb-6 font-nunito">${ajuda.titulo}</h2>` : ''}
            <div class="space-y-6">
            ${ajuda.passos ? ajuda.passos.map(passo => `
                <div class="flex gap-4 items-start">
                <div class="w-8 h-8 rounded-full bg-nurse-primary text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                    ${passo.numero}
                </div>
                <div>
                    <h4 class="font-bold text-lg mb-1">${passo.titulo}</h4>
                    <p class="text-slate-600 dark:text-slate-300 text-sm">${passo.descricao}</p>
                </div>
                </div>
            `).join('') : ''}
            </div>
        `;
      }
    }
    
    // ABA REFERÊNCIA
    const refPane = document.getElementById('pane-referencia');
    if (refPane && this.config.conteudo.referencia) {
      const ref = this.config.conteudo.referencia;
      refPane.innerHTML = `
        <h2 class="text-2xl font-black mb-6 font-nunito">${ref.titulo || 'Referências'}</h2>
        <div class="space-y-4">
          ${ref.itens.map(item => `
            <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div class="flex items-start gap-3">
                <i class="fa-solid ${this.getIconForType(item.tipo)} text-nurse-primary mt-1 opacity-70"></i>
                <div class="flex-1">
                  <h5 class="font-bold text-sm">${item.titulo}</h5>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    ${item.autores} ${item.ano ? `(${item.ano})` : ''}
                  </p>
                  ${item.link ? `
                    <a href="${item.link}" target="_blank" class="text-xs text-nurse-accent hover:underline mt-2 inline-flex items-center gap-1">
                      Acessar fonte <i class="fa-solid fa-external-link-alt text-[10px]"></i>
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  /**
   * Retorna ícone baseado no tipo de referência
   */
  getIconForType(tipo) {
    const icons = {
      'artigo': 'fa-file-lines',
      'protocolo': 'fa-clipboard-check',
      'resolucao': 'fa-gavel',
      'livro': 'fa-book',
      'web': 'fa-globe'
    };
    return icons[tipo] || 'fa-file';
  }

  /**
   * Realiza o cálculo (Lógica Padrão/Insulina)
   */
  calculate() {
    const elPrescricao = document.getElementById('prescricao_medica');
    const elConcentracao = document.getElementById('concentracao_insulina');

    if (!elPrescricao || !elConcentracao) {
        console.warn('Método calculate() base chamado, mas campos de insulina não encontrados. Verifique se a classe filha implementou calculate().');
        return;
    }

    const prescricao = parseFloat(elPrescricao.value);
    const concentracao = parseFloat(elConcentracao.value);
    
    if (!prescricao || prescricao <= 0) {
      if(window.showToast) window.showToast("Informe uma prescrição válida!", "warning");
      return;
    }
    
    const volumeMl = prescricao / concentracao;
    
    const casasDecimais = this.config.calculo?.casas_decimais || 3;
    const unidade = this.config.calculo?.unidade_resultado || 'mL';

    const resTotal = document.getElementById('res-total');
    if(resTotal) resTotal.innerText = volumeMl.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: casasDecimais 
    });

    const resUnit = document.getElementById('res-unit');
    if(resUnit) resUnit.innerText = `${unidade} (${volumeMl.toFixed(casasDecimais)} ${unidade})`;
    
    const resultsWrapper = document.getElementById('results-wrapper');
    if(resultsWrapper) resultsWrapper.classList.remove('hidden');
    
    this.renderAudit(prescricao, concentracao, volumeMl);
    this.checkAlerts(volumeMl);
    
    this.resultData = { prescricao, concentracao, volumeMl };
    
    if(window.showToast) window.showToast("Cálculo realizado com sucesso!", "success");
  }

  /**
   * Renderiza auditoria do cálculo (Baseado em Insulina)
   */
  renderAudit(prescricao, concentracao, resultado) {
    const auditList = document.getElementById('audit-list');
    if (!auditList) return;
    
    const formula = this.config.calculo?.formula || 'Prescrição / Concentração';

    auditList.innerHTML = `
      <li class="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm border-l-4 border-green-500">
        <div class="flex items-center font-bold text-green-800 dark:text-green-300">
             <i class="fa-solid fa-check mr-2"></i> Fórmula
        </div>
        <div class="ml-6 text-slate-600 dark:text-slate-400">${formula}</div>
      </li>
      <li class="bg-slate-50 dark:bg-slate-900/50 p-3 rounded text-sm border border-slate-200 dark:border-slate-700">
        <div class="flex items-center font-bold text-slate-700 dark:text-slate-300">
            <i class="fa-solid fa-calculator mr-2"></i> Memória de Cálculo
        </div>
        <div class="ml-6 font-mono mt-1">
            ${prescricao} UI ÷ ${concentracao} UI/mL = <strong>${resultado.toFixed(4)} mL</strong>
        </div>
      </li>
      <li class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
        <i class="fa-solid fa-info-circle text-blue-600 mr-2"></i>
        <strong>Concentração:</strong> ${concentracao === 100 ? 'U100' : 'U300'}
      </li>
    `;
  }

  /**
   * Verifica alertas baseados em condições
   */
  checkAlerts(resultado) {
    if (!this.config.calculo?.alertas) return;
    
    this.config.calculo.alertas.forEach(alerta => {
      try {
          const condicao = alerta.condicao.replace('resultado', resultado);
          if (eval(condicao)) {
            if(window.showToast) window.showToast(alerta.mensagem, alerta.tipo);
          }
      } catch (e) {
          console.error('Erro ao avaliar alerta:', e);
      }
    });
  }

  /**
   * Reseta o formulário
   */
  reset() {
    if(this.config.formulario && this.config.formulario.secoes) {
        this.config.formulario.secoes.forEach(secao => {
        secao.campos.forEach(campo => {
            const element = document.getElementById(campo.id);
            if (element) {
            if (campo.type === 'select' && campo.opcoes.length > 0) {
                 element.value = campo.opcoes[0].value;
            } else {
                 element.value = '';
            }
            }
        });
        });
    }
    
    const resultsWrapper = document.getElementById('results-wrapper');
    if(resultsWrapper) resultsWrapper.classList.add('hidden');
    this.resultData = null;
  }

  /**
   * Obtém dados do resultado para exportação
   */
  getResultData() {
    return this.resultData;
  }

  /**
   * Obtém configuração dos modais
   */
  getModalConfig(modalId) {
    return this.config.modais?.[modalId] || null;
  }

  /**
   * Renderiza menu lateral (sidebar tools)
   */
  renderSidebarMenu() {
    const sidebar = document.getElementById('sidebar-tools');
    if (!sidebar || !this.config.menu_lateral) return;
    
    const html = this.config.menu_lateral.map(item => `
      <button class="tool-btn"
              id="btn-${item.id}"
              aria-label="${item.label}"
              title="${item.label}"
              onclick="CALCULATOR_SYSTEM.${item.acao}('${item.parametro}')">
        <i class="fa-solid ${item.icone}" aria-hidden="true"></i>
        <span class="btn-label">${item.label}</span>
      </button>
    `).join('');
    
    sidebar.innerHTML = html;
    console.log('✓ Menu lateral renderizado');
  }

  /**
   * Renderiza tags clicáveis
   */
  renderTags() {
    const container = document.getElementById('tags-container');
    if (!container || !this.config.tags) return;
    
    const html = this.config.tags.map(tag => `
      <a href="busca-e-conteudo.html?tag=${encodeURIComponent(tag.label)}" 
         class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                bg-nurse-primary/10 text-nurse-primary dark:bg-cyan-400/10 dark:text-cyan-400
                border border-nurse-primary/20 dark:border-cyan-400/20
                hover:bg-nurse-primary/20 transition-all cursor-pointer">
        <i class="fa-solid ${tag.icone} text-[10px]"></i>
        ${tag.label}
      </a>
    `).join('');
    
    container.innerHTML = `
      <div class="flex flex-wrap gap-2 mb-6">
        ${html}
      </div>
    `;
    console.log('✓ Tags renderizadas');
  }
}

window.CALCULATOR_ENGINE = CalculatorEngine;