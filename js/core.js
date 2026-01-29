/**
 * SISTEMA PRINCIPAL DE CALCULADORAS
 * Versão 8.3 - Modular e Dinâmico
 */

window.NURSE_SYSTEM = {
    // Estado do sistema
    state: {
        calculators: [],
        currentCalculator: null,
        currentResult: null,
        formData: {},
        config: window.NURSE_CONFIG || {}
    },

    // Cache para componentes carregados
    cache: {
        templates: {},
        components: {}
    },

    /**
     * Inicialização do sistema
     */
    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Calculadoras...');
            
            // 1. Carregar lista de calculadoras
            await this.loadCalculators();
            
            // 2. Carregar conteúdo principal
            await this.loadMainContent();
            
            // 3. Inicializar UI
            this.initUI();
            
            // 4. Carregar primeira calculadora
            if (this.state.calculators.length > 0) {
                this.selectCalculator(this.state.calculators[0].id);
            }
            
            // 5. Inicializar eventos
            this.initEvents();
            
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            this.showError('Falha ao carregar o sistema. Por favor, recarregue a página.');
        }
    },

    /**
     * Carregar lista de calculadoras do JSON
     */
    async loadCalculators() {
        try {
            const response = await fetch(`${this.state.config.baseUrl}data/nursing_calculators.json`);
            if (!response.ok) throw new Error('Erro ao carregar calculadoras');
            
            const data = await response.json();
            this.state.calculators = data.calculators || [];
            
            console.log(`📊 ${this.state.calculators.length} calculadoras carregadas`);
            
        } catch (error) {
            console.error('Erro ao carregar calculadoras:', error);
            this.state.calculators = [];
        }
    },

    /**
     * Carregar conteúdo principal da página
     */
    async loadMainContent() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        try {
            // Usar o módulo de injeção de conteúdo
            if (window.MAIN_CONTENT_INJECTOR) {
                mainContent.innerHTML = window.MAIN_CONTENT_INJECTOR.getTemplate();
            } else {
                // Fallback básico
                mainContent.innerHTML = `
                    <div class="p-12 text-center">
                        <i class="fa-solid fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                        <p class="text-slate-600 dark:text-slate-400">Módulo de conteúdo não carregado</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar conteúdo principal:', error);
        }
    },

    /**
     * Selecionar uma calculadora específica
     */
    selectCalculator(calculatorId) {
        const calculator = this.state.calculators.find(c => c.id === calculatorId);
        if (!calculator) {
            console.warn(`Calculadora "${calculatorId}" não encontrada`);
            return;
        }
        
        this.state.currentCalculator = calculator;
        
        // Atualizar metadados da página
        this.updatePageMetadata(calculator);
        
        // Atualizar interface
        this.updateCalculatorInterface(calculator);
        
        // Atualizar breadcrumb
        this.updateBreadcrumb(calculator.name);
        
        // Atualizar índice lateral
        this.updateCalculatorIndex();
        
        console.log(`🔍 Calculadora selecionada: ${calculator.name}`);
    },

    /**
     * Atualizar metadados da página
     */
    updatePageMetadata(calculator) {
        // Título da página
        document.title = `${calculator.name} - Calculadoras de Enfermagem`;
        document.getElementById('page-title').textContent = `${calculator.name} - Calculadoras de Enfermagem`;
        
        // Meta description
        const metaDesc = document.getElementById('meta-description');
        if (metaDesc) metaDesc.content = calculator.description;
        
        // Open Graph
        const ogTitle = document.getElementById('og-title');
        const ogDesc = document.getElementById('og-description');
        if (ogTitle) ogTitle.content = calculator.name;
        if (ogDesc) ogDesc.content = calculator.description;
        
        // Header da página
        const headerTitle = document.getElementById('header-title');
        const headerDesc = document.getElementById('header-description');
        if (headerTitle) headerTitle.textContent = calculator.name;
        if (headerDesc) headerDesc.textContent = calculator.description;
        
        // Tags
        this.updateTags(calculator);
    },

    /**
     * Atualizar interface da calculadora
     */
    updateCalculatorInterface(calculator) {
        const container = document.getElementById('calculator-container');
        if (!container) return;
        
        // Usar módulo UI para renderizar
        if (window.UI_MODULE && window.UI_MODULE.renderCalculator) {
            container.innerHTML = window.UI_MODULE.renderCalculator(calculator);
        } else {
            // Fallback básico
            container.innerHTML = this.getCalculatorFallbackHTML(calculator);
        }
        
        // Inicializar campos
        this.initCalculatorFields(calculator);
    },

    /**
     * HTML de fallback para calculadora
     */
    getCalculatorFallbackHTML(calculator) {
        return `
            <nav class="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                <button onclick="NURSE_SYSTEM.switchTab('calc')" class="tab-btn active">Calculadora</button>
                <button onclick="NURSE_SYSTEM.switchTab('sobre')" class="tab-btn">Sobre</button>
                <button onclick="NURSE_SYSTEM.switchTab('ajuda')" class="tab-btn">Instruções</button>
            </nav>
            
            <div class="p-6 md:p-10">
                <section id="pane-calc" class="tab-pane active">
                    <div class="space-y-6">
                        <h3 class="text-xs font-black uppercase tracking-widest text-nurse-primary/50 mb-4 border-b pb-2">
                            Parâmetros do Cálculo
                        </h3>
                        <div id="dynamic-fields" class="grid md:grid-cols-2 gap-6">
                            <!-- Campos serão injetados dinamicamente -->
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 pt-8">
                        <button onclick="NURSE_SYSTEM.calculate()" class="btn-primary-action">
                            <i class="fa-solid fa-calculator"></i> Calcular
                        </button>
                        <button onclick="NURSE_SYSTEM.resetForm()" class="btn-secondary-action">
                            <i class="fa-solid fa-rotate-left"></i> Limpar
                        </button>
                    </div>
                    
                    <div id="results-wrapper" class="hidden pt-12 border-t border-slate-200">
                        <!-- Resultados serão injetados aqui -->
                    </div>
                </section>
                
                <section id="pane-sobre" class="tab-pane hidden">
                    <h3 class="text-xl font-black mb-4">Sobre</h3>
                    <p>${calculator.description}</p>
                </section>
                
                <section id="pane-ajuda" class="tab-pane hidden">
                    <h3 class="text-xl font-black mb-4">Instruções</h3>
                    <p>Preencha todos os campos obrigatórios e clique em Calcular.</p>
                </section>
            </div>
        `;
    },

    /**
     * Inicializar campos da calculadora
     */
    initCalculatorFields(calculator) {
        const container = document.getElementById('dynamic-fields');
        if (!container || !calculator.fields) return;
        
        let fieldsHTML = '';
        
        // Iterar sobre grupos de campos
        Object.entries(calculator.fields).forEach(([groupName, fields]) => {
            if (Array.isArray(fields)) {
                // Adicionar título do grupo
                fieldsHTML += `
                    <div class="md:col-span-2">
                        <h4 class="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                            ${groupName}
                        </h4>
                    </div>
                `;
                
                // Adicionar campos do grupo
                fields.forEach(field => {
                    fieldsHTML += this.createFieldHTML(field);
                });
            }
        });
        
        container.innerHTML = fieldsHTML;
    },

    /**
     * Criar HTML para um campo
     */
    createFieldHTML(field) {
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder || '';
        const tooltip = field.tooltip ? `title="${field.tooltip}"` : '';
        
        let fieldHTML = '';
        
        switch (field.type) {
            case 'select':
                fieldHTML = `
                    <div>
                        <label class="label-main">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                        <select id="${field.id}" class="input-field" ${required}>
                            <option value="">Selecione...</option>
                            ${field.options.map(opt => 
                                `<option value="${opt.value}">${opt.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                break;
                
            case 'number':
                fieldHTML = `
                    <div>
                        <label class="label-main">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                        <input type="number" 
                               id="${field.id}" 
                               class="input-field"
                               placeholder="${placeholder}"
                               ${required}
                               ${field.min ? `min="${field.min}"` : ''}
                               ${field.max ? `max="${field.max}"` : ''}
                               ${field.step ? `step="${field.step}"` : ''}
                               onkeydown="NURSE_SYSTEM.preventNegative(event)">
                        ${field.unit ? `<span class="text-xs text-slate-500 mt-1">${field.unit}</span>` : ''}
                    </div>
                `;
                break;
                
            default:
                fieldHTML = `
                    <div>
                        <label class="label-main">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                            ${field.tooltip ? `<i class="fa-solid fa-circle-info text-nurse-secondary ml-1" ${tooltip}></i>` : ''}
                        </label>
                        <input type="${field.type || 'text'}" 
                               id="${field.id}" 
                               class="input-field"
                               placeholder="${placeholder}"
                               ${required}>
                    </div>
                `;
        }
        
        return fieldHTML;
    },

    /**
     * Executar cálculo
     */
    async calculate() {
        if (!this.state.currentCalculator) {
            this.showNotification('Nenhuma calculadora selecionada', 'error');
            return;
        }
        
        // Validar formulário
        if (!this.validateForm()) {
            this.showNotification('Preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        try {
            // Obter dados do formulário
            const formData = this.getFormData();
            this.state.formData = formData;
            
            // Executar cálculo usando o motor
            const result = await this.executeCalculation(
                this.state.currentCalculator.id, 
                formData
            );
            
            // Armazenar resultado
            this.state.currentResult = result;
            
            // Exibir resultados
            this.displayResults(result);
            
            // Notificar sucesso
            this.showNotification('Cálculo realizado com sucesso!');
            
            // Feedback de voz (se disponível)
            if (window.VOICE_MODULE) {
                window.VOICE_MODULE.speak('Cálculo concluído com sucesso');
            }
            
        } catch (error) {
            console.error('Erro no cálculo:', error);
            this.showNotification(`Erro: ${error.message}`, 'error');
        }
    },

    /**
     * Validar formulário
     */
    validateForm() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value || field.value.trim() === '') {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    },

    /**
     * Obter dados do formulário
     */
    getFormData() {
        const data = {};
        const fields = document.querySelectorAll('#pane-calc input, #pane-calc select');
        
        fields.forEach(field => {
            if (field.id) {
                // Converter valores numéricos
                if (field.type === 'number') {
                    data[field.id] = parseFloat(field.value) || 0;
                } else {
                    data[field.id] = field.value;
                }
            }
        });
        
        return data;
    },

    /**
     * Executar cálculo específico
     */
    async executeCalculation(calculatorId, formData) {
        // Usar motor de enfermagem se disponível
        if (window.NURSING_ENGINE) {
            return await window.NURSING_ENGINE.calculate(calculatorId, formData);
        }
        
        // Fallback para funções de cálculo diretas
        if (window.NursingCalculators && window.NursingCalculators[calculatorId]) {
            return window.NursingCalculators[calculatorId](...Object.values(formData));
        }
        
        throw new Error('Motor de cálculo não disponível');
    },

    /**
     * Exibir resultados
     */
    displayResults(result) {
        const wrapper = document.getElementById('results-wrapper');
        if (!wrapper) return;
        
        // Usar módulo UI para renderizar resultados
        if (window.UI_MODULE && window.UI_MODULE.renderResults) {
            wrapper.innerHTML = window.UI_MODULE.renderResults(result, this.state.currentCalculator);
        } else {
            // Fallback básico
            wrapper.innerHTML = this.getResultsFallbackHTML(result);
        }
        
        // Mostrar wrapper
        wrapper.classList.remove('hidden');
        
        // Scroll para resultados
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    /**
     * HTML de fallback para resultados
     */
    getResultsFallbackHTML(result) {
        return `
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 text-center border-2 border-dashed border-nurse-primary/20 mb-10">
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">Resultado</p>
                <div class="text-6xl md:text-8xl font-black text-[#1A3E74] dark:text-cyan-400 tracking-tighter font-nunito leading-none">
                    ${result.resultado?.toLocaleString('pt-BR') || '0,00'}
                </div>
                <p class="text-lg font-black text-nurse-secondary mt-2 uppercase tracking-widest">
                    ${result.unidade || ''}
                </p>
            </div>
            
            <div class="flex flex-wrap gap-4 justify-center mb-10">
                <button onclick="NURSE_SYSTEM.generatePDF()" class="btn-primary-action px-10">
                    <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                </button>
                <button onclick="NURSE_SYSTEM.copyResult()" class="btn-secondary-action px-8">
                    <i class="fa-solid fa-copy"></i> Copiar
                </button>
            </div>
        `;
    },

    /**
     * Gerar PDF do resultado
     */
    async generatePDF() {
        if (!this.state.currentResult) {
            this.showNotification('Nenhum resultado para gerar PDF', 'error');
            return;
        }
        
        // Usar módulo PDF se disponível
        if (window.PDF_MODULE) {
            await window.PDF_MODULE.generate(
                this.state.currentResult,
                this.state.currentCalculator,
                this.state.formData
            );
        } else {
            this.showNotification('Módulo PDF não disponível', 'error');
        }
    },

    /**
     * Copiar resultado
     */
    copyResult() {
        if (!this.state.currentResult) {
            this.showNotification('Nenhum resultado para copiar', 'error');
            return;
        }
        
        const text = `Resultado: ${this.state.currentResult.resultado} ${this.state.currentResult.unidade || ''}`;
        
        if (window.UTIL_MODULE && window.UTIL_MODULE.copyToClipboard) {
            window.UTIL_MODULE.copyToClipboard(text);
            this.showNotification('Resultado copiado!');
        } else {
            // Fallback básico
            navigator.clipboard.writeText(text)
                .then(() => this.showNotification('Resultado copiado!'))
                .catch(() => this.showNotification('Erro ao copiar', 'error'));
        }
    },

    /**
     * Limpar formulário
     */
    resetForm() {
        // Limpar campos
        document.querySelectorAll('#pane-calc input, #pane-calc select').forEach(field => {
            field.value = '';
            field.classList.remove('error');
        });
        
        // Ocultar resultados
        const wrapper = document.getElementById('results-wrapper');
        if (wrapper) wrapper.classList.add('hidden');
        
        // Limpar estado
        this.state.currentResult = null;
        this.state.formData = {};
        
        this.showNotification('Formulário limpo!');
    },

    /**
     * Alternar entre abas
     */
    switchTab(tabId) {
        // Remover classe active de todas as abas e botões
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            pane.classList.add('hidden');
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Ativar aba selecionada
        const pane = document.getElementById(`pane-${tabId}`);
        const button = document.getElementById(`btn-tab-${tabId}`);
        
        if (pane) {
            pane.classList.add('active');
            pane.classList.remove('hidden');
        }
        
        if (button) {
            button.classList.add('active');
        }
        
        // Carregar conteúdo específico da aba se necessário
        if (tabId !== 'calc' && this.state.currentCalculator) {
            this.loadTabContent(tabId);
        }
    },

    /**
     * Carregar conteúdo da aba
     */
    loadTabContent(tabId) {
        const pane = document.getElementById(`pane-${tabId}`);
        if (!pane || !this.state.currentCalculator) return;
        
        let content = '';
        
        switch (tabId) {
            case 'sobre':
                content = this.getAboutContent();
                break;
            case 'ajuda':
                content = this.getHelpContent();
                break;
            case 'ref':
                content = this.getReferencesContent();
                break;
        }
        
        pane.innerHTML = content;
    },

    /**
     * Conteúdo da aba "Sobre"
     */
    getAboutContent() {
        const calc = this.state.currentCalculator;
        return `
            <div class="prose prose-slate dark:prose-invert max-w-none">
                <h2 class="text-2xl font-black mb-6">Sobre esta calculadora</h2>
                <p class="mb-4">${calc.description}</p>
                
                ${calc.formula ? `
                    <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl mb-6">
                        <h3 class="text-lg font-black mb-3">Fórmula utilizada</h3>
                        <code class="block bg-white dark:bg-slate-900 p-4 rounded-lg font-mono text-sm">
                            ${calc.formula.calculation}
                        </code>
                        ${calc.formula.explanation ? `
                            <p class="text-sm text-slate-600 dark:text-slate-400 mt-3">
                                ${calc.formula.explanation}
                            </p>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${calc.objectives ? `
                    <h3 class="text-lg font-black mb-3">Objetivos</h3>
                    <ul class="space-y-2 mb-6">
                        ${calc.objectives.map(obj => `
                            <li class="flex items-start gap-2">
                                <i class="fa-solid fa-check text-nurse-secondary mt-1"></i>
                                <span>${obj}</span>
                            </li>
                        `).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    },

    /**
     * Conteúdo da aba "Ajuda"
     */
    getHelpContent() {
        const calc = this.state.currentCalculator;
        const instructions = calc.instructions || [
            'Preencha todos os campos obrigatórios (marcados com *)',
            'Verifique as unidades de medida antes de calcular',
            'Revise os resultados e a auditoria técnica'
        ];
        
        return `
            <div class="prose prose-slate dark:prose-invert max-w-none">
                <h2 class="text-2xl font-black mb-6">Instruções de uso</h2>
                <ol class="space-y-4">
                    ${instructions.map((inst, index) => `
                        <li class="flex gap-3">
                            <span class="bg-nurse-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                                ${index + 1}
                            </span>
                            <span>${inst}</span>
                        </li>
                    `).join('')}
                </ol>
                
                ${calc.warnings ? `
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-6">
                        <h3 class="font-black text-yellow-800 dark:text-yellow-300 mb-2">
                            <i class="fa-solid fa-exclamation-triangle mr-2"></i> Avisos importantes
                        </h3>
                        <ul class="space-y-1 text-sm">
                            ${calc.warnings.map(warning => `
                                <li class="flex items-start gap-2">
                                    <i class="fa-solid fa-circle-exclamation text-yellow-500 mt-0.5"></i>
                                    <span>${warning}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Conteúdo da aba "Referências"
     */
    getReferencesContent() {
        const calc = this.state.currentCalculator;
        const references = calc.references || [
            'Protocolos de segurança do paciente',
            'Diretrizes nacionais de enfermagem',
            'Manuais técnicos atualizados'
        ];
        
        return `
            <div class="prose prose-slate dark:prose-invert max-w-none">
                <h2 class="text-2xl font-black mb-6">Referências técnicas</h2>
                <ul class="space-y-3">
                    ${references.map(ref => `
                        <li class="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <i class="fa-solid fa-book text-nurse-secondary mt-1"></i>
                            <span>${ref}</span>
                        </li>
                    `).join('')}
                </ul>
                
                <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <h3 class="font-black text-blue-800 dark:text-blue-300 mb-2">
                        <i class="fa-solid fa-lightbulb mr-2"></i> Boas práticas
                    </h3>
                    <p class="text-sm">
                        Sempre consulte as referências atualizadas e protocolos institucionais antes de proceder.
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Atualizar índice lateral de calculadoras
     */
    updateCalculatorIndex() {
        const container = document.getElementById('calculator-index');
        if (!container) return;
        
        container.innerHTML = this.state.calculators.map(calc => `
            <a href="#" onclick="NURSE_SYSTEM.selectCalculator('${calc.id}'); return false;"
               class="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-nurse-primary/10 hover:text-nurse-primary transition font-medium text-sm">
                <i class="fa-solid fa-calculator mr-2 text-nurse-primary"></i> 
                ${calc.name}
            </a>
        `).join('');
    },

    /**
     * Atualizar tags da página
     */
    updateTags(calculator) {
        const container = document.getElementById('tags-container');
        if (!container) return;
        
        const tags = [calculator.id, ...(calculator.tags || [])].slice(0, 5);
        
        container.innerHTML = tags.map(tag => `
            <span class="tag-pill-footer" onclick="NURSE_SYSTEM.searchTag('${tag}')">
                #${tag}
            </span>
        `).join('');
    },

    /**
     * Atualizar breadcrumb
     */
    updateBreadcrumb(currentPage) {
        const breadcrumb = document.getElementById('breadcrumb-current');
        if (breadcrumb) {
            breadcrumb.textContent = currentPage;
        }
    },

    /**
     * Buscar por tag
     */
    searchTag(tag) {
        const query = encodeURIComponent(`site:auditeduca.github.io ${tag}`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    },

    /**
     * Compartilhar página
     */
    share(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.state.currentCalculator?.name || 'Calculadora de Enfermagem');
        const text = encodeURIComponent('Confira esta calculadora clínica!');
        
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    },

    /**
     * Copiar link da página
     */
    copyLink() {
        const url = window.location.href;
        
        if (window.UTIL_MODULE && window.UTIL_MODULE.copyToClipboard) {
            window.UTIL_MODULE.copyToClipboard(url);
            this.showNotification('Link copiado!');
        } else {
            navigator.clipboard.writeText(url)
                .then(() => this.showNotification('Link copiado!'))
                .catch(() => this.showNotification('Erro ao copiar link', 'error'));
        }
    },

    /**
     * Prevenir entrada de números negativos
     */
    preventNegative(event) {
        if (['-', 'e', '+'].includes(event.key)) {
            event.preventDefault();
        }
    },

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'success') {
        if (window.NOTIFICATION_MODULE) {
            window.NOTIFICATION_MODULE.show(message, type);
        } else {
            // Fallback básico
            const container = document.getElementById('notification-container');
            if (!container) return;
            
            const toast = document.createElement('div');
            toast.className = `toast-msg ${type === 'error' ? 'bg-red-600' : 'bg-slate-900'}`;
            toast.innerHTML = `
                <i class="fa-solid fa-${type === 'error' ? 'exclamation-triangle' : 'circle-check'} text-nurse-secondary"></i>
                <span>${message}</span>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(50px)';
                setTimeout(() => toast.remove(), 500);
            }, 3500);
        }
    },

    /**
     * Mostrar erro
     */
    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="p-12 text-center">
                <i class="fa-solid fa-exclamation-triangle text-6xl text-red-500 mb-6"></i>
                <h2 class="text-3xl font-black text-red-600 mb-4">Erro no Sistema</h2>
                <p class="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                    ${message}
                </p>
                <button onclick="location.reload()" class="btn-primary-action">
                    <i class="fa-solid fa-rotate-right"></i> Tentar Novamente
                </button>
            </div>
        `;
    },

    /**
     * Inicializar UI
     */
    initUI() {
        // Adicionar estilos dinâmicos se necessário
        this.initDynamicStyles();
    },

    /**
     * Inicializar estilos dinâmicos
     */
    initDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tab-pane {
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .result-highlight {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(26, 62, 116, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(26, 62, 116, 0); }
                100% { box-shadow: 0 0 0 0 rgba(26, 62, 116, 0); }
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Inicializar eventos
     */
    initEvents() {
        // Eventos globais
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter para calcular
            if (e.ctrlKey && e.key === 'Enter') {
                this.calculate();
            }
            
            // Esc para limpar
            if (e.key === 'Escape') {
                this.resetForm();
            }
        });
        
        // Log de eventos para debug
        if (this.state.config.debug) {
            document.addEventListener('click', (e) => {
                console.log('Click:', e.target);
            });
        }
    },

    /**
     * Redirecionar para simulados
     */
    redirectToSimulados() {
        window.open('https://simulados-para-enfermagem.com.br/', '_blank');
    }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.NURSE_SYSTEM;
}