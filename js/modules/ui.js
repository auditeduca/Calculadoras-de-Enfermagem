/**
 * MÓDULO DE INTERFACE DO USUÁRIO
 * Componentes e renderização de UI
 */

window.UI_MODULE = {
    
    /**
     * Renderizar calculadora completa
     */
    renderCalculator(calculator) {
        if (!calculator) return '<p>Calculadora não encontrada</p>';
        
        const fieldsHTML = this.renderFields(calculator.fields);
        
        return `
            <!-- Abas -->
            <nav class="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto">
                <button onclick="NURSE_SYSTEM.switchTab('calc')" id="btn-tab-calc" class="tab-btn active">
                    <i class="fa-solid fa-calculator mr-2"></i> Calculadora
                </button>
                <button onclick="NURSE_SYSTEM.switchTab('sobre')" id="btn-tab-sobre" class="tab-btn">
                    <i class="fa-solid fa-circle-info mr-2"></i> Sobre
                </button>
                <button onclick="NURSE_SYSTEM.switchTab('ajuda')" id="btn-tab-ajuda" class="tab-btn">
                    <i class="fa-solid fa-question-circle mr-2"></i> Instruções
                </button>
                ${calculator.references ? `
                    <button onclick="NURSE_SYSTEM.switchTab('ref')" id="btn-tab-ref" class="tab-btn">
                        <i class="fa-solid fa-book mr-2"></i> Referências
                    </button>
                ` : ''}
            </nav>
            
            <div class="p-6 md:p-10">
                <!-- Painel Calculadora -->
                <section id="pane-calc" class="tab-pane active space-y-10">
                    <!-- Identificação do Paciente -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary/50 mb-4 border-b pb-2">
                            <i class="fa-solid fa-user-nurse mr-2"></i> Identificação do Paciente
                        </h3>
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="label-main">
                                    Nome completo <span class="text-[9px] lowercase opacity-50">(opcional)</span>
                                </label>
                                <input id="patient_name" type="text" placeholder="Nome do paciente" class="input-field"/>
                            </div>
                            <div>
                                <label class="label-main">
                                    Data de Nascimento
                                    <span id="age-badge" class="ml-auto text-nurse-secondary font-black text-[9px] hidden"></span>
                                </label>
                                <input id="patient_dob" type="text" placeholder="DD/MM/YYYY" class="input-field" 
                                       maxlength="10" onkeyup="UTIL_MODULE.maskField(this, 'date')"/>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parâmetros do Cálculo -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary/50 mb-4 border-b pb-2">
                            <i class="fa-solid fa-sliders mr-2"></i> Parâmetros do Cálculo
                            <span class="text-red-500 ml-1">*</span>
                        </h3>
                        <div id="dynamic-fields" class="grid md:grid-cols-2 gap-6">
                            ${fieldsHTML}
                        </div>
                        <span class="mandatory-note">
                            <i class="fa-solid fa-asterisk text-red-500 mr-1"></i>
                            Campos obrigatórios
                        </span>
                    </div>
                    
                    <!-- Botões de Ação -->
                    <div class="grid grid-cols-2 gap-4 pt-4">
                        <button onclick="NURSE_SYSTEM.calculate()" class="btn-primary-action">
                            <i class="fa-solid fa-calculator"></i> Calcular
                        </button>
                        <button onclick="NURSE_SYSTEM.resetForm()" class="btn-secondary-action">
                            <i class="fa-solid fa-rotate-left"></i> Limpar
                        </button>
                    </div>
                    
                    <!-- Resultados (inicialmente oculto) -->
                    <div id="results-wrapper" class="hidden pt-12 border-t border-slate-200 dark:border-slate-700">
                        <!-- Resultados serão injetados aqui -->
                    </div>
                </section>
                
                <!-- Painéis de Informação (inicialmente ocultos) -->
                <section id="pane-sobre" class="tab-pane hidden"></section>
                <section id="pane-ajuda" class="tab-pane hidden"></section>
                <section id="pane-ref" class="tab-pane hidden"></section>
            </div>
        `;
    },
    
    /**
     * Renderizar campos dinâmicos
     */
    renderFields(fields) {
        if (!fields || typeof fields !== 'object') return '';
        
        let html = '';
        
        Object.entries(fields).forEach(([groupName, fieldList]) => {
            if (Array.isArray(fieldList)) {
                // Título do grupo
                html += `
                    <div class="md:col-span-2">
                        <h4 class="text-xs font-black uppercase tracking-widest text-slate-500 mb-3 border-b pb-2">
                            <i class="fa-solid fa-folder mr-2"></i> ${groupName}
                        </h4>
                    </div>
                `;
                
                // Campos do grupo
                fieldList.forEach(field => {
                    html += this.renderField(field);
                });
            }
        });
        
        return html;
    },
    
    /**
     * Renderizar um campo individual
     */
    renderField(field) {
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder || '';
        const tooltip = field.tooltip ? `title="${field.tooltip}"` : '';
        
        switch (field.type) {
            case 'select':
                return `
                    <div>
                        <label class="label-main">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                        <select id="${field.id}" class="input-field ${field.required ? 'border-red-500' : ''}" ${required}>
                            <option value="">Selecione...</option>
                            ${field.options.map(opt => 
                                `<option value="${opt.value}">${opt.label}</option>`
                            ).join('')}
                        </select>
                        ${field.unit ? `<span class="text-xs text-slate-500 mt-1">${field.unit}</span>` : ''}
                    </div>
                `;
                
            case 'number':
                return `
                    <div>
                        <label class="label-main">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                        <input type="number" 
                               id="${field.id}" 
                               class="input-field ${field.required ? 'border-red-500' : ''}"
                               placeholder="${placeholder}"
                               ${required}
                               ${field.min ? `min="${field.min}"` : ''}
                               ${field.max ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}
                               onkeydown="NURSE_SYSTEM.preventNegative(event)">
                        ${field.unit ? `<span class="text-xs text-slate-500 mt-1">${field.unit}</span>` : ''}
                    </div>
                `;
                
            case 'checkbox':
                return `
                    <div class="md:col-span-2">
                        <label class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
                            <input type="checkbox" id="${field.id}" class="w-4 h-4 accent-nurse-primary">
                            <span class="text-sm font-medium">${field.name}</span>
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                    </div>
                `;
                
            default:
                return `
                    <div>
                        <label class="label-main">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                        <input type="${field.type || 'text'}" 
                               id="${field.id}" 
                               class="input-field ${field.required ? 'border-red-500' : ''}"
                               placeholder="${placeholder}"
                               ${required}>
                    </div>
                `;
        }
    },
    
    /**
     * Renderizar resultados do cálculo
     */
    renderResults(result, calculator) {
        if (!result || !calculator) return '<p>Nenhum resultado para exibir</p>';
        
        const auditHTML = this.renderAudit(result);
        const safetyHTML = this.renderSafetyChecklists();
        
        return `
            <!-- Resultado Principal -->
            <div class="result-highlight bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-nurse-primary/20 mb-8">
                <p class="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">Resultado</p>
                <div id="res-total" class="text-7xl md:text-8xl font-black text-nurse-primary dark:text-cyan-400 tracking-tighter leading-none">
                    ${result.resultado ? UTIL_MODULE.formatNumber(result.resultado) : '0,00'}
                </div>
                <p id="res-unit" class="text-xl font-black text-nurse-secondary mt-3 uppercase tracking-widest">
                    ${result.unidade || calculator.unit || ''}
                </p>
                ${result.interpretation ? `
                    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl max-w-md mx-auto">
                        <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
                            <i class="fa-solid fa-comment-medical mr-2"></i>
                            ${result.interpretation}
                        </p>
                    </div>
                ` : ''}
            </div>
            
            <!-- AdSense Placeholder -->
            <div class="adsense-placeholder min-h-[120px] mb-10">
                <span class="adsense-text">Espaço Publicitário</span>
            </div>
            
            <!-- Botões de Ação -->
            <div class="grid grid-cols-2 gap-4 mb-10">
                <button onclick="NURSE_SYSTEM.generatePDF()" class="btn-primary-action">
                    <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                </button>
                <button onclick="NURSE_SYSTEM.copyResult()" class="btn-secondary-action">
                    <i class="fa-solid fa-copy"></i> Copiar Resultado
                </button>
            </div>
            
            <!-- Busca NANDA/NIC/NOC -->
            <button onclick="UI_MODULE.searchNandaNocNic()" class="w-full bg-nurse-accent text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest mb-12 hover:brightness-110 transition-all">
                <i class="fa-solid fa-magnifying-glass"></i> Buscar Diagnóstico NANDA/NIC/NOC
            </button>
            
            <!-- Auditoria do Cálculo -->
            ${auditHTML}
            
            <!-- Checklists de Segurança -->
            ${safetyHTML}
        `;
    },
    
    /**
     * Renderizar auditoria do cálculo
     */
    renderAudit(result) {
        if (!result || typeof result !== 'object') return '';
        
        const auditItems = [];
        
        // Extrair itens de auditoria (tudo que não for resultado principal)
        Object.entries(result).forEach(([key, value]) => {
            if (!['resultado', 'unidade', 'unit', 'error', 'interpretation'].includes(key)) {
                auditItems.push({ key, value });
            }
        });
        
        if (auditItems.length === 0) return '';
        
        return `
            <div class="mb-12 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div class="bg-slate-50 dark:bg-slate-900/50 px-8 py-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 class="audit-label">
                        <i class="fa-solid fa-clipboard-check mr-2"></i> Auditoria do Cálculo
                    </h3>
                </div>
                <div class="p-8 space-y-6">
                    ${auditItems.map(item => `
                        <div class="audit-step">
                            <span class="audit-label">${this.formatLabel(item.key)}</span>
                            <span class="audit-value">
                                ${typeof item.value === 'number' ? UTIL_MODULE.formatNumber(item.value) : item.value}
                            </span>
                        </div>
                    `).join('')}
                    
                    ${result.formula ? `
                        <div class="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <p class="audit-label mb-2 opacity-50">Memória de Cálculo:</p>
                            <p class="text-[9px] font-inter font-bold text-slate-400 mb-2 italic">${result.formula}</p>
                            <p class="audit-value text-base">${result.calculation || ''}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar checklists de segurança
     */
    renderSafetyChecklists() {
        const certos = [
            "Paciente Certo",
            "Medicação Certa", 
            "Dose Certa",
            "Via Certa",
            "Hora Certa",
            "Registro Certo",
            "Validade Certa",
            "Resposta Certa",
            "Forma Farmacêutica Certa"
        ];
        
        const metas = [
            { id: 1, text: "Identificar corretamente o paciente", type: "blue" },
            { id: 2, text: "Melhorar a comunicação eficaz", type: "blue" },
            { id: 3, text: "Segurança de medicamentos de alta vigilância", type: "orange" },
            { id: 4, text: "Assegurar cirurgias no local certo", type: "blue" },
            { id: 5, text: "Reduzir risco de infecções", type: "blue" },
            { id: 6, text: "Reduzir risco de quedas", type: "blue" }
        ];
        
        return `
            <div class="space-y-8 mb-12">
                <h2 class="text-xl font-black text-nurse-primary dark:text-cyan-400 flex items-center gap-2 border-l-4 border-nurse-secondary pl-4 uppercase text-[11px] tracking-widest">
                    <i class="fa-solid fa-shield-virus"></i> Check-list de Segurança do Paciente
                </h2>
                
                <div class="grid md:grid-cols-2 gap-8">
                    <!-- 9 Certos -->
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <i class="fa-solid fa-list-check"></i> 9 Certos da Medicação
                        </h3>
                        <div class="grid gap-2">
                            ${certos.map((certo, index) => `
                                <label class="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl cursor-pointer text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-nurse-primary/5 transition-all">
                                    <input type="checkbox" class="w-4 h-4 accent-nurse-primary">
                                    <span>${index + 1}. ${certo}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Metas Internacionais -->
                    <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved"></i> Metas Internacionais de Segurança
                        </h3>
                        <div class="grid gap-3">
                            ${metas.map(meta => `
                                <label class="glass-meta glass-meta-${meta.type} py-4 cursor-pointer hover:shadow-md transition-all">
                                    <input type="checkbox" class="w-4 h-4 accent-nurse-primary">
                                    <span class="text-[10px] font-black uppercase">${meta.id}. ${meta.text}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Renderizar sidebar com calculadoras relacionadas
     */
    renderRelatedCalculators(calculators, currentId) {
        if (!calculators || calculators.length === 0) return '';
        
        // Filtrar calculadoras relacionadas (excluir a atual)
        const related = calculators
            .filter(calc => calc.id !== currentId)
            .slice(0, 5);
        
        if (related.length === 0) return '';
        
        return `
            <div class="card-base p-6">
                <h3 class="text-sm font-black uppercase tracking-widest text-nurse-primary dark:text-cyan-400 mb-4 flex items-center gap-2 border-b pb-3">
                    <i class="fa-solid fa-list"></i> Outras Calculadoras
                </h3>
                <nav class="space-y-2 text-sm">
                    ${related.map(calc => `
                        <a href="#" onclick="NURSE_SYSTEM.selectCalculator('${calc.id}'); return false;" 
                           class="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-nurse-primary/10 hover:text-nurse-primary transition font-medium text-sm">
                            <i class="fa-solid fa-calculator mr-2 text-nurse-primary"></i> ${calc.name}
                        </a>
                    `).join('')}
                </nav>
            </div>
        `;
    },
    
    /**
     * Renderizar cards de conteúdo relacionado
     */
    renderRelatedCards(calculators, currentId) {
        if (!calculators || calculators.length < 2) return '';
        
        const related = calculators
            .filter(calc => calc.id !== currentId)
            .slice(0, 3);
        
        if (related.length === 0) return '';
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                ${related.map(calc => `
                    <a href="#" onclick="NURSE_SYSTEM.selectCalculator('${calc.id}'); return false;" 
                       class="group card-base overflow-hidden bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full text-left">
                        <div class="relative h-52 bg-nurse-primary/5 flex items-center justify-center overflow-hidden shrink-0">
                            <i class="fa-solid fa-calculator text-6xl text-nurse-primary group-hover:scale-110 transition-transform duration-700"></i>
                        </div>
                        <div class="p-8 flex flex-col flex-grow">
                            <h3 class="text-xl font-black mb-3 group-hover:text-nurse-secondary transition-colors font-nunito line-clamp-2">
                                ${calc.name}
                            </h3>
                            <p class="text-slate-500 text-sm mb-6 flex-grow">
                                ${calc.description.substring(0, 60)}...
                            </p>
                            <span class="text-nurse-secondary text-sm font-bold flex items-center gap-2 mt-auto">
                                Acessar <i class="fa-solid fa-arrow-right-long ml-2"></i>
                            </span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * Renderizar modal
     */
    renderModal(options = {}) {
        const { 
            id = 'modal-default',
            title = 'Modal', 
            content = '', 
            size = 'md',
            showClose = true,
            buttons = []
        } = options;
        
        const sizeClasses = {
            sm: 'max-w-md',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl'
        };
        
        const modalHTML = `
            <div id="${id}" class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm hidden">
                <div class="${sizeClasses[size]} w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    <!-- Cabeçalho -->
                    <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 class="text-xl font-black text-nurse-primary dark:text-cyan-400">${title}</h3>
                        ${showClose ? `
                            <button onclick="UI_MODULE.closeModal('${id}')" class="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <i class="fa-solid fa-times text-slate-500"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Conteúdo -->
                    <div class="p-6 max-h-[70vh] overflow-y-auto">
                        ${content}
                    </div>
                    
                    <!-- Rodapé com botões -->
                    ${buttons.length > 0 ? `
                        <div class="flex gap-3 justify-end p-6 border-t border-slate-200 dark:border-slate-700">
                            ${buttons.map(btn => `
                                <button onclick="${btn.onclick}" 
                                        class="px-6 py-3 rounded-xl font-bold text-sm transition-colors ${btn.primary ? 
                                            'bg-nurse-primary text-white hover:bg-nurse-secondary' : 
                                            'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Adicionar modal ao body se não existir
        if (!document.getElementById(id)) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        return modalHTML;
    },
    
    /**
     * Abrir modal
     */
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Previne scroll
        }
    },
    
    /**
     * Fechar modal
     */
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restaura scroll
        }
    },
    
    /**
     * Mostrar modal de confirmação
     */
    confirm(options = {}) {
        return new Promise((resolve) => {
            const modalId = 'confirm-modal-' + Date.now();
            
            const modalHTML = this.renderModal({
                id: modalId,
                title: options.title || 'Confirmação',
                content: options.message || 'Tem certeza que deseja continuar?',
                size: 'sm',
                buttons: [
                    {
                        text: options.cancelText || 'Cancelar',
                        onclick: `UI_MODULE.closeModal('${modalId}'); window.__confirmResult = false;`,
                        primary: false
                    },
                    {
                        text: options.confirmText || 'Confirmar',
                        onclick: `UI_MODULE.closeModal('${modalId}'); window.__confirmResult = true;`,
                        primary: true
                    }
                ]
            });
            
            // Abrir modal
            this.openModal(modalId);
            
            // Aguardar resultado
            const checkResult = setInterval(() => {
                if (typeof window.__confirmResult !== 'undefined') {
                    clearInterval(checkResult);
                    const result = window.__confirmResult;
                    delete window.__confirmResult;
                    resolve(result);
                }
            }, 100);
        });
    },
    
    /**
     * Formatar label para exibição
     */
    formatLabel(key) {
        if (!key) return '';
        
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    },
    
    /**
     * Buscar diagnósticos NANDA/NIC/NOC
     */
    searchNandaNocNic() {
        const result = window.NURSE_SYSTEM?.state?.currentResult;
        const calculator = window.NURSE_SYSTEM?.state?.currentCalculator;
        
        if (!result || !calculator) {
            window.NURSE_SYSTEM.showNotification('Execute um cálculo primeiro', 'error');
            return;
        }
        
        const query = encodeURIComponent(
            `NANDA NIC NOC diagnósticos enfermagem ${calculator.name} ${result.resultado}`
        );
        
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },
    
    /**
     * Inicializar tooltips
     */
    initTooltips() {
        // Usar Tippy.js ou similar se disponível
        // Fallback para title attribute
        const tooltips = document.querySelectorAll('[title]');
        
        tooltips.forEach(tooltip => {
            tooltip.addEventListener('mouseenter', function() {
                // Implementação básica de tooltip
                const title = this.getAttribute('title');
                if (title) {
                    // Remover title temporariamente para evitar duplicação
                    this.removeAttribute('title');
                    
                    // Criar tooltip customizado
                    const tooltipEl = document.createElement('div');
                    tooltipEl.className = 'fixed z-[10001] bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-medium max-w-xs shadow-lg';
                    tooltipEl.textContent = title;
                    tooltipEl.id = 'custom-tooltip';
                    
                    document.body.appendChild(tooltipEl);
                    
                    // Posicionar tooltip
                    const rect = this.getBoundingClientRect();
                    tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
                    tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 5}px`;
                    tooltipEl.style.transform = 'translateX(-50%)';
                    
                    // Restaurar title ao sair
                    this.addEventListener('mouseleave', function restoreTitle() {
                        tooltipEl.remove();
                        this.setAttribute('title', title);
                        this.removeEventListener('mouseleave', restoreTitle);
                    });
                }
            });
        });
    }
};