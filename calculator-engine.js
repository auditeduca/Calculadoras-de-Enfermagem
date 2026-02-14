/**
 * CALCULATOR ENGINE - Motor de Renderização Modular
 * Versão 4.4.2 - Fix URLs Absolutas (Core Styles & Modais)
 */

class CalculatorEngine {
  constructor(configOrUrl) {
    if (typeof configOrUrl === 'object' && configOrUrl !== null) {
      this.config = configOrUrl;
      this.configUrl = null;
    } else {
      this.configUrl = configOrUrl;
      this.config = null;
    }
    this.resultData = null;
  }

  async init() {
    try {
      if (!this.config && this.configUrl) {
        const response = await fetch(this.configUrl);
        if (!response.ok) throw new Error(`Erro config: ${response.status}`);
        this.config = await response.json();
      }

      if (!this.config) throw new Error("Configuração indefinida");
      
      // Carrega modais com fallback remoto
      await this.loadSharedModais();
      
      this.render();
      console.log('✓ Calculator Engine inicializado');
    } catch (error) {
      console.error('Erro Engine:', error);
    }
  }

  render() {
    if (!this.config) return;
    
    // Fix Styles (Fallback para URL absoluta correta)
    this.fixStyles();

    this.renderSEO();
    this.renderHeader();
    this.renderBreadcrumb();
    this.renderTags();        
    this.renderSidebarMenu(); 
    this.renderTabs();
    this.renderForm();
    this.renderContentTabs();
    
    // Inicializa a primeira aba como ativa
    this.switchTab('calc');
  }

  /**
   * Garante o carregamento do CSS Core via URL absoluta se falhar localmente
   */
  fixStyles() {
    const cssId = 'core-styles-fixed';
    const absoluteUrl = 'https://auditeduca.github.io/Calculadoras-de-Enfermagem/core/core-styles.css';
    
    if (document.getElementById(cssId)) return;

    // Remove links quebrados ou duplicados para limpar erros do console
    try {
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            // Se o link contiver 'styles.css' mas não for o nosso core oficial, remove para evitar conflito/404
            if (link.href && link.href.includes('styles.css') && link.href !== absoluteUrl && !link.href.includes('core-styles.css')) {
               // link.remove(); // Opcional: manter comentado se quiser permitir styles.css locais customizados
            }
        });
    } catch(e) { console.warn('Erro ao limpar styles:', e); }

    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = absoluteUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    console.log('✓ Styles corrigido para: core/core-styles.css');
  }

  /**
   * Carrega modais compartilhados com estratégia de Fallback (Local -> Remoto)
   */
  async loadSharedModais() {
    const paths = [
        'shared-modais.json', // Tentativa 1: Local
        'https://auditeduca.github.io/Calculadoras-de-Enfermagem/shared-modais.json' // Tentativa 2: GitHub Pages
    ];

    for (const path of paths) {
        try {
            const response = await fetch(path);
            
            // Validações de resposta
            if (!response.ok) continue;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") === -1) continue;

            const shared = await response.json();
            
            if (shared.shared_modais && this.config) {
                this.config.modais = { ...this.config.modais, ...shared.shared_modais };
                console.log(`✓ Modais compartilhados carregados de: ${path}`);
                return; // Sucesso, encerra o loop
            }
        } catch (e) {
            // Falha silenciosa para tentar o próximo path
        }
    }
    console.warn('Info: Modais compartilhados não disponíveis (Local e Remoto falharam).');
  }

  // --- RENDERIZADORES DE UI ---

  renderSEO() {
    if (!this.config?.seo) return;
    document.title = this.config.seo.title || document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && this.config.seo.description) metaDesc.content = this.config.seo.description;
  }

  renderBreadcrumb() {
    const nav = document.querySelector('nav.mb-8');
    if (!nav || !this.config.breadcrumb) return;
    const items = Array.isArray(this.config.breadcrumb) ? this.config.breadcrumb : this.config.breadcrumb.items;
    if (!items) return;
    nav.innerHTML = items.map(item => {
      if (item.url && item.url !== "" && item.url !== "#") return `<a href="${item.url}" class="hover:underline text-nurse-accent transition-colors">${item.label}</a>`;
      return `<span class="text-nurse-primary dark:text-cyan-400 font-bold">${item.label}</span>`;
    }).join('<i class="fa-solid fa-chevron-right text-[10px] mx-2 text-slate-400"></i>');
  }

  renderHeader() {
    const h = this.config.header;
    if (!h) return;
    const b = document.querySelector('header span.bg-nurse-primary');
    const t = document.getElementById('header-title');
    const d = document.getElementById('header-description');
    if (b) b.textContent = h.categoria || h.badge || 'Calculadora';
    if (t) t.innerHTML = h.titulo || '';
    if (d) d.textContent = h.descricao || '';
  }

  renderTabs() {
    const nav = document.querySelector('article#calculator-container nav');
    if (!nav || !this.config.abas) return;
    nav.innerHTML = this.config.abas.map(aba => `
      <button onclick="CALCULATOR_SYSTEM.switchTab('${aba.id}')" class="tab-btn" id="btn-tab-${aba.id}">
        ${aba.icon ? `<i class="fa-solid ${aba.icon} mr-2"></i>` : ''}${aba.label}
      </button>
    `).join('');
  }

  renderForm() {
    const c = document.getElementById('pane-calc');
    if (!c || !this.config.formulario) return;
    const f = this.config.formulario;
    const sections = f.secoes.map(s => `
      <div class="space-y-6">
        ${s.titulo ? `<h3 class="text-xs font-black uppercase text-nurse-primary/50 mb-4 border-b pb-2">${s.titulo}</h3>` : ''}
        <div class="grid md:grid-cols-2 gap-6">${s.campos.map(f => this.renderField(f)).join('')}</div>
      </div>
    `).join('');
    
    c.innerHTML = `
      <div class="space-y-10">${sections}
        <div class="grid grid-cols-2 gap-4 pt-4">
          <button onclick="CALCULATOR_SYSTEM.calculate()" class="btn-primary-action"><i class="fa-solid fa-calculator"></i> ${f.botao_texto || 'Calcular'}</button>
          <button onclick="CALCULATOR_SYSTEM.reset()" class="btn-secondary-action">${f.limpar_texto || 'Limpar'}</button>
        </div>
        <div id="results-wrapper" class="hidden pt-8 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
          <div class="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 text-center border-2 border-dashed border-nurse-primary/20 mb-6">
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Resultado</p>
            <div id="res-total" class="text-6xl font-black text-[#1A3E74] dark:text-cyan-400 font-nunito">0,00</div>
            <p id="res-unit" class="text-lg font-black text-nurse-secondary mt-2 uppercase"></p>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-10">
            <button onclick="CALCULATOR_SYSTEM.generatePDF()" class="btn-primary-action"><i class="fa-solid fa-file-pdf"></i> PDF</button>
            <button onclick="CALCULATOR_SYSTEM.copyResult()" class="btn-secondary-action"><i class="fa-solid fa-copy"></i> Copiar</button>
          </div>
          <div class="mb-12"><h3 class="text-xs font-black uppercase mb-4"><i class="fa-solid fa-clipboard-check"></i> Auditoria</h3><ul id="audit-list" class="space-y-3"></ul></div>
        </div>
      </div>
    `;
  }

  renderField(campo) {
    const col = campo.col || 'md:col-span-1';
    let input = '';
    if (campo.type === 'select') {
      input = `<select id="${campo.id}" class="input-field" ${campo.required?'required':''}>${campo.opcoes.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select>`;
    } else {
      input = `<input id="${campo.id}" type="${campo.type}" class="input-field" placeholder="${campo.placeholder||''}" ${campo.required?'required':''} step="${campo.step||'any'}">`;
    }
    return `<div class="${col}"><label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" for="${campo.id}">${campo.label}</label>${input}</div>`;
  }

  renderContentTabs() {
    if (!this.config.conteudo) return;
    const setHtml = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
    
    // Sobre
    const s = this.config.conteudo.sobre;
    if (s) setHtml('pane-sobre', s.texto && !s.titulo ? `<div class="prose dark:prose-invert">${s.texto}</div>` : `
      ${s.titulo ? `<h2 class="text-2xl font-black mb-4 font-nunito">${s.titulo}</h2>` : ''}
      ${s.texto || ''}
      ${s.formula_visual ? `<div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl font-mono text-xs my-6 text-center border border-slate-200"><code>${s.formula_visual}</code></div>` : ''}
      ${s.exemplo ? `<div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-l-4 border-blue-500 mt-4"><h4 class="font-bold mb-3 text-blue-800 dark:text-blue-300">Exemplo:</h4><p class="text-sm">${s.exemplo.explicacao||''}</p></div>` : ''}
    `);

    // Ajuda
    const a = this.config.conteudo.ajuda;
    if (a) setHtml('pane-ajuda', `
      ${a.titulo ? `<h2 class="text-2xl font-black mb-6 font-nunito">${a.titulo}</h2>` : ''}
      <div class="space-y-6">${a.passos ? a.passos.map(p => `<div class="flex gap-4 items-start"><div class="w-8 h-8 rounded-full bg-nurse-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">${p.numero}</div><div><h4 class="font-bold text-lg mb-1">${p.titulo}</h4><p class="text-slate-600 dark:text-slate-300 text-sm">${p.descricao}</p></div></div>`).join('') : ''}</div>
    `);

    // Referência
    const r = this.config.conteudo.referencia;
    if (r) setHtml('pane-referencia', `
      <h2 class="text-2xl font-black mb-6 font-nunito">${r.titulo || 'Referências'}</h2>
      <div class="space-y-4">${r.itens.map(i => `<div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"><div class="flex items-start gap-3"><i class="fa-solid fa-book text-nurse-primary mt-1 opacity-70"></i><div class="flex-1"><h5 class="font-bold text-sm">${i.titulo}</h5><p class="text-xs text-slate-500 mt-1">${i.autores} ${i.ano ? `(${i.ano})` : ''}</p>${i.link?`<a href="${i.link}" target="_blank" class="text-xs text-nurse-accent hover:underline mt-2 inline-block">Acessar fonte</a>`:''}</div></div></div>`).join('')}</div>
    `);
  }

  renderSidebarMenu() {
    const s = document.getElementById('sidebar-tools');
    if (!s || !this.config.menu_lateral) return;
    s.innerHTML = this.config.menu_lateral.map(i => `
      <button class="tool-btn" id="btn-${i.id}" aria-label="${i.label}" title="${i.label}" onclick="CALCULATOR_SYSTEM.${i.acao}('${i.parametro}')">
        <i class="fa-solid ${i.icone}"></i><span class="btn-label">${i.label}</span>
      </button>`).join('');
  }

  renderTags() {
    const c = document.getElementById('tags-container');
    if (!c || !this.config.tags) return;
    c.innerHTML = `<div class="flex flex-wrap gap-2 mb-6">${this.config.tags.map(t => `<a href="busca-e-conteudo.html?tag=${encodeURIComponent(t.label)}" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-nurse-primary/10 text-nurse-primary dark:bg-cyan-400/10 dark:text-cyan-400 border border-nurse-primary/20 hover:bg-nurse-primary/20 transition-all"><i class="fa-solid ${t.icone} text-[10px]"></i>${t.label}</a>`).join('')}</div>`;
  }

  // --- LÓGICA DE AÇÃO ---

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-tab-${tabId}`)?.classList.add('active');
    ['calc', 'sobre', 'ajuda', 'referencia'].forEach(id => {
      const el = document.getElementById(`pane-${id}`);
      if(el) el.classList.add('hidden');
    });
    document.getElementById(`pane-${tabId}`)?.classList.remove('hidden');
  }

  calculate() {
    const p = parseFloat(document.getElementById('prescricao_medica')?.value);
    const c = parseFloat(document.getElementById('concentracao_insulina')?.value);
    
    if (isNaN(p)) {
      if(window.showToast) window.showToast("Preencha os campos obrigatórios", "warning");
      return;
    }
    
    let result = 0;
    if(c) result = p / c;
    
    // Renderiza resultado
    const rTotal = document.getElementById('res-total');
    if(rTotal) rTotal.textContent = result.toLocaleString('pt-BR', {maximumFractionDigits:3});
    
    document.getElementById('results-wrapper')?.classList.remove('hidden');
    
    // Auditoria simples
    const audit = document.getElementById('audit-list');
    if(audit) audit.innerHTML = `<li class="bg-green-50 p-2 text-sm rounded border-l-4 border-green-500">Cálculo realizado: ${result.toFixed(3)}</li>`;
    
    this.resultData = { p, c, result };
    if(window.showToast) window.showToast("Cálculo realizado!", "success");
  }

  reset() {
    document.querySelectorAll('.input-field').forEach(i => i.value = '');
    document.getElementById('results-wrapper')?.classList.add('hidden');
    this.resultData = null;
  }

  copyResult() {
    if(!this.resultData) return;
    const txt = `Resultado: ${this.resultData.result}`;
    navigator.clipboard.writeText(txt).then(() => {
        if(window.showToast) window.showToast("Copiado!", "success");
    });
  }

  generatePDF() {
    window.print();
  }
}

window.CALCULATOR_ENGINE = CalculatorEngine;