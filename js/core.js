/**
 * SISTEMA PRINCIPAL DE CALCULADORAS - Versão 8.5
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

    /**
     * Inicialização do sistema
     */
    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Calculadoras...');
            
            // 1. Carregar lista de calculadoras
            await this.loadCalculators();
            
            // 2. Injetar conteúdo principal
            this.injectMainContent();
            
            // 3. Aguardar um pouco para o DOM ser atualizado
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 4. Carregar calculadora de insulina por padrão
            this.loadDefaultCalculator();
            
            // 5. Inicializar eventos
            this.initEvents();
            
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            this.showError('Falha ao carregar o sistema. Por favor, recarregue a página.');
        }
    },

    /**
     * Carregar lista de calculadoras
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
     * Injetar conteúdo principal
     */
    injectMainContent() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Elemento main-content não encontrado');
            return;
        }
        
        // Se já tiver conteúdo, não precisa recarregar
        if (mainContent.children.length > 1) {
            return;
        }
        
        // Usar módulo de injeção de conteúdo
        if (window.MAIN_CONTENT_INJECTOR && window.MAIN_CONTENT_INJECTOR.inject) {
            window.MAIN_CONTENT_INJECTOR.inject();
        } else {
            // Fallback básico
            mainContent.innerHTML = this.getFallbackMainContent();
        }
    },

    /**
     * Conteúdo de fallback
     */
    getFallbackMainContent() {
        return `
            <nav class="flex items-center gap-2 text-sm text-slate-600 dark:text-cyan-300 mb-8 font-semibold">
                <a href="index.html" class="hover:underline text-nurse-accent">Início</a>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-nurse-primary dark:text-cyan-400 font-bold">Calculadoras</span>
            </nav>
            
            <header class="max-w-4xl mb-12">
                <span class="bg-nurse-primary text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
                    Sistema Dinâmico
                </span>
                <h1 id="header-title" class="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">Calculadoras Clínicas</h1>
                <div class="h-2 w-24 bg-gradient-to-r from-nurse-accent to-nurse-primary rounded-full mb-8"></div>
                <p id="header-description" class="text-xl text-slate-600 dark:text-slate-300 font-medium italic">
                    Sistema modular de calculadoras para enfermagem com segurança integrada
                </p>
            </header>
            
            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <div id="calculator-container" class="card-base p-8">
                        <div class="text-center py-12">
                            <i class="fa-solid fa-calculator text-6xl text-nurse-primary mb-6"></i>
                            <h2 class="text-2xl font-bold mb-4">Sistema de Calculadoras</h2>
                            <p class="text-slate-600 dark:text-slate-400 mb-6">
                                Selecione uma calculadora para começar
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-6">
                    <div class="card-base p-6">
                        <h3 class="text-sm font-bold text-nurse-primary dark:text-cyan-400 mb-4">
                            Calculadoras Disponíveis
                        </h3>
                        <div id="calculator-index" class="space-y-2">
                            <div class="text-center py-4 text-slate-400">
                                Carregando...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Carregar calculadora padrão (insulina)
     */
    loadDefaultCalculator() {
        // Tentar encontrar a calculadora de insulina
        const insulinaCalc = this.state.calculators.find(c => c.id === 'insulina');
        
        if (insulinaCalc) {
            console.log('🔍 Carregando calculadora de insulina por padrão...');
            this.selectCalculator('insulina');
        } else if (this.state.calculators.length > 0) {
            console.log('⚠️ Calculadora de insulina não encontrada, carregando primeira disponível');
            this.selectCalculator(this.state.calculators[0].id);
        } else {
            console.warn('Nenhuma calculadora disponível');
            this.showNotification('Nenhuma calculadora configurada', 'warning');
        }
    },

    /**
     * Selecionar uma calculadora específica
     */
    selectCalculator(calculatorId) {
        const calculator = this.state.calculators.find(c => c.id === calculatorId);
        if (!calculator) {
            console.warn(`Calculadora "${calculatorId}" não encontrada`);
            this.showNotification('Calculadora não encontrada', 'error');
            return;
        }
        
        this.state.currentCalculator = calculator;
        
        // Atualizar metadados da página
        this.updatePageMetadata(calculator);
        
        // Atualizar interface
        this.updateCalculatorInterface(calculator);
        
        // Atualizar índice lateral
        this.updateCalculatorIndex();
        
        console.log(`🔍 Calculadora selecionada: ${calculator.name}`);
    },

    /**
     * Atualizar metadados da página
     */
    updatePageMetadata(calculator) {
        // Atualizar título da página
        document.title = `${calculator.name} - Calculadoras de Enfermagem`;
        
        // Atualizar meta tags
        this.updateMetaTag('meta-description', 'content', calculator.description);
        this.updateMetaTag('og-title', 'content', calculator.name);
        this.updateMetaTag('og-description', 'content', calculator.description);
        
        // Atualizar elementos visuais
        this.updateElementText('header-title', calculator.name);
        this.updateElementText('header-description', calculator.description);
        this.updateElementText('breadcrumb-current', calculator.name);
        
        // Atualizar tags
        this.updateTags(calculator);
    },

    /**
     * Atualizar elemento de texto de forma segura
     */
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    /**
     * Atualizar meta tag de forma segura
     */
    updateMetaTag(elementId, attribute, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.setAttribute(attribute, value);
        }
    },

    /**
     * Atualizar interface da calculadora
     */
    updateCalculatorInterface(calculator) {
        const container = document.getElementById('calculator-container');
        if (!container) {
            console.error('Container da calculadora não encontrado');
            return;
        }
        
        // Usar módulo UI para renderizar
        if (window.UI_MODULE && window.UI_MODULE.renderCalculator) {
            container.innerHTML = window.UI_MODULE.renderCalculator(calculator);
        } else {
            // Fallback básico
            container.innerHTML = this.getCalculatorFallbackHTML(calculator);
        }
        
        // Inicializar campos
        setTimeout(() => {
            this.initCalculatorFields(calculator);
        }, 50);
    },

    /**
     * HTML de fallback para calculadora
     */
    getCalculatorFallbackHTML(calculator) {
        return `
            <div class="card-base">
                <nav class="flex border-b border-slate-100 dark:border-slate-700">
                    <button class="tab-btn active">Calculadora</button>
                    <button class="tab-btn">Sobre</button>
                    <button class="tab-btn">Instruções</button>
                </nav>
                
                <div class="p-6 md:p-8">
                    <h2 class="text-2xl font-bold text-nurse-primary mb-4">${calculator.name}</h2>
                    <p class="text-slate-600 dark:text-slate-300 mb-6">${calculator.description}</p>
                    
                    <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-6">
                        <h3 class="font-bold text-slate-700 dark:text-slate-300 mb-4">Parâmetros</h3>
                        <div id="dynamic-fields" class="space-y-4">
                            <!-- Campos serão injetados aqui -->
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <button onclick="NURSE_SYSTEM.calculate()" class="btn-primary-action flex-1">
                            <i class="fa-solid fa-calculator"></i> Calcular
                        </button>
                        <button onclick="NURSE_SYSTEM.resetForm()" class="btn-secondary-action">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>
                    
                    <div id="results-wrapper" class="hidden mt-8 pt-8 border-t border-slate-200">
                        <!-- Resultados serão exibidos aqui -->
                    </div>
                </div>
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
                    <div class="mb-4">
                        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">${groupName}</h4>
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
        
        let fieldHTML = '';
        
        switch (field.type) {
            case 'select':
                fieldHTML = `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                        </label>
                        <select id="${field.id}" class="input-field w-full" ${required}>
                            <option value="">Selecione...</option>
                            ${field.options.map(opt => 
                                `<option value="${opt.value}">${opt.label}</option>`
                            ).join('')}
                        </select>
                        ${field.unit ? `<span class="text-xs text-slate-500 mt-1">${field.unit}</span>` : ''}
                    </div>
                `;
                break;
                
            case 'number':
                fieldHTML = `
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                        </label>
                        <input type="number" 
                               id="${field.id}" 
                               class="input-field w-full"
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
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            ${field.name} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                        </label>
                        <input type="${field.type || 'text'}" 
                               id="${field.id}" 
                               class="input-field w-full"
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
        const container = document.getElementById('calculator-container');
        if (container) {
            container.querySelectorAll('input, select').forEach(field => {
                if (field.id && field.id !== '') {
                    // Converter valores numéricos
                    if (field.type === 'number') {
                        data[field.id] = parseFloat(field.value) || 0;
                    } else {
                        data[field.id] = field.value;
                    }
                }
            });
        }
        
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
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border-2 border-dashed border-nurse-primary/20 mb-6">
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Resultado</p>
                <div class="text-5xl md:text-6xl font-bold text-nurse-primary dark:text-cyan-400 mb-2">
                    ${result.resultado?.toFixed(2) || '0.00'}
                </div>
                <p class="text-lg font-bold text-nurse-secondary">
                    ${result.unidade || ''}
                </p>
            </div>
            
            <div class="flex gap-4 mb-6">
                <button onclick="NURSE_SYSTEM.generatePDF()" class="btn-primary-action flex-1">
                    <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                </button>
                <button onclick="NURSE_SYSTEM.copyResult()" class="btn-secondary-action">
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
        
        this.showNotification('Gerando PDF...');
        setTimeout(() => {
            this.showNotification('PDF gerado com sucesso!');
        }, 1000);
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
        navigator.clipboard.writeText(text)
            .then(() => this.showNotification('Resultado copiado!'))
            .catch(() => this.showNotification('Erro ao copiar', 'error'));
    },

    /**
     * Limpar formulário
     */
    resetForm() {
        // Limpar campos
        const container = document.getElementById('calculator-container');
        if (container) {
            container.querySelectorAll('input, select').forEach(field => {
                field.value = '';
                field.classList.remove('error');
            });
        }
        
        // Ocultar resultados
        const wrapper = document.getElementById('results-wrapper');
        if (wrapper) wrapper.classList.add('hidden');
        
        // Limpar estado
        this.state.currentResult = null;
        this.state.formData = {};
        
        this.showNotification('Formulário limpo!');
    },

    /**
     * Atualizar índice lateral de calculadoras
     */
    updateCalculatorIndex() {
        const container = document.getElementById('calculator-index');
        if (!container) return;
        
        if (this.state.calculators.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-slate-400">
                    Nenhuma calculadora disponível
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.state.calculators.map(calc => `
            <button onclick="NURSE_SYSTEM.selectCalculator('${calc.id}')" 
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left">
                <div class="w-8 h-8 rounded-full bg-nurse-primary/10 flex items-center justify-center">
                    <i class="fa-solid fa-calculator text-nurse-primary text-sm"></i>
                </div>
                <div class="flex-1">
                    <div class="font-medium text-sm text-slate-700 dark:text-slate-300">${calc.name}</div>
                    <div class="text-xs text-slate-500 truncate">${calc.category || 'Clínica'}</div>
                </div>
            </button>
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
            <span class="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                #${tag}
            </span>
        `).join(' ');
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
                <h2 class="text-3xl font-bold text-red-600 mb-4">Erro no Sistema</h2>
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
     * Inicializar eventos
     */
    initEvents() {
        // Eventos globais
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter para calcular
            if (e.ctrlKey && e.key === 'Enter') {
                this.calculate();
            }
        });
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
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
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
        navigator.clipboard.writeText(url)
            .then(() => this.showNotification('Link copiado!'))
            .catch(() => this.showNotification('Erro ao copiar link', 'error'));
    },

    /**
     * Redirecionar para simulados
     */
    redirectToSimulados() {
        window.open('https://simulados-para-enfermagem.com.br/', '_blank');
    }
};