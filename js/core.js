/**
 * SISTEMA PRINCIPAL DE CALCULADORAS - V8.6
 * Corrigido: Todos os problemas da casca
 */

window.NURSE_SYSTEM = {
    state: {
        calculators: [],
        currentCalculator: null,
        currentResult: null,
        formData: {},
        currentTab: 'calc'
    },

    // Cache de elementos DOM
    elements: {},

    async init() {
        try {
            console.log('🚀 Inicializando Sistema de Calculadoras V8.6');
            
            // 1. Carregar calculadoras
            await this.loadCalculators();
            
            // 2. Injetar conteúdo principal
            await this.injectMainContent();
            
            // 3. Carregar calculadora de insulina por padrão
            await this.loadInsulinaCalculator();
            
            // 4. Inicializar eventos
            this.initEvents();
            
            // 5. Inicializar acessibilidade mobile
            this.initMobileAccessibility();
            
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showError(error);
        }
    },

    async loadCalculators() {
        try {
            const response = await fetch('https://auditeduca.github.io/Calculadoras-de-Enfermagem/data/nursing_calculators.json');
            if (!response.ok) throw new Error('Erro ao carregar calculadoras');
            
            const data = await response.json();
            this.state.calculators = data.calculators || [];
            console.log(`📊 ${this.state.calculators.length} calculadoras carregadas`);
            
        } catch (error) {
            console.error('Erro ao carregar calculadoras:', error);
            this.state.calculators = [];
        }
    },

    async injectMainContent() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        
        // Template principal com todos os elementos
        mainContent.innerHTML = `
            <!-- AdSense Superior -->
            <div class="adsense-placeholder mb-8">
                <span class="adsense-text">Publicidade AdSense</span>
            </div>
            
            <!-- Breadcrumb -->
            <nav id="breadcrumb" class="flex items-center gap-2 text-sm text-gray-600 dark:text-cyan-300 mb-8 font-semibold">
                <a href="index.html" class="hover:underline text-nurse-accent">Início</a>
                <i class="fas fa-chevron-right text-[10px]"></i>
                <a href="#" class="hover:underline text-nurse-accent">Ferramentas</a>
                <i class="fas fa-chevron-right text-[10px]"></i>
                <span class="hidden md:inline hover:underline text-nurse-accent cursor-pointer">Calculadoras Clínicas</span>
                <i class="fas fa-chevron-right text-[10px] hidden md:inline"></i>
                <span id="breadcrumb-current" class="text-nurse-primary dark:text-cyan-400 font-bold">Calculadora</span>
            </nav>
            
            <!-- Header -->
            <header class="max-w-4xl mb-12">
                <span id="header-badge" class="bg-nurse-primary text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
                    Calculadoras Clínicas
                </span>
                <h1 id="header-title" class="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-bold">Cálculo de Insulina</h1>
                <div class="h-2 w-24 bg-gradient-to-r from-nurse-accent to-nurse-primary rounded-full mb-8"></div>
                <p id="header-description" class="text-xl text-gray-600 dark:text-gray-300 font-medium italic">
                    Ferramenta técnica para aspiração segura de insulina com protocolos integrados.
                </p>
            </header>
            
            <!-- Layout Principal -->
            <div class="grid lg:grid-cols-[1fr,340px] gap-10 items-start">
                
                <!-- Container da Calculadora -->
                <article id="calculator-container" class="card-base p-0">
                    <!-- Conteúdo será injetado dinamicamente -->
                </article>
                
                <!-- Sidebar -->
                <aside id="sidebar-container" class="space-y-6 sticky top-28 self-start">
                    <!-- Será preenchido dinamicamente -->
                </aside>
            </div>
            
            <!-- Seção de Conteúdo Relacionado -->
            <section id="related-section" class="bg-gray-100 dark:bg-nurse-bgDark py-24 border-t border-gray-300 dark:border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-24">
                <div class="max-w-7xl mx-auto text-center">
                    <h2 class="text-3xl font-bold mb-16 flex items-center justify-center gap-4">
                        <i class="fas fa-layer-group text-nurse-accent"></i> Conteúdo Relacionado
                    </h2>
                    <div id="related-cards" class="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <!-- Será preenchido dinamicamente -->
                    </div>
                </div>
            </section>
            
            <!-- Seção Autor e Tags -->
            <section class="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-800">
                <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-gray-200 dark:border-gray-700 shadow-sm mb-12">
                    <img src="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/author-info.webp" 
                         alt="Autor" 
                         class="w-28 h-28 rounded-full object-cover shadow-xl border-4 border-white dark:border-gray-800"/>
                    <div class="text-center md:text-left">
                        <h3 class="text-2xl font-bold mb-3 text-nurse-primary dark:text-cyan-400">Calculadoras de Enfermagem Profissional</h3>
                        <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl italic">
                            "Transformando a complexidade técnica em segurança para o paciente através da precisão dos dados."
                        </p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 items-center">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 flex items-center">
                        <i class="fas fa-tags mr-2 text-nurse-secondary"></i> Tópicos:
                    </span>
                    <span id="tags-container" class="flex flex-wrap gap-2">
                        <!-- Será preenchido dinamicamente -->
                    </span>
                </div>
            </section>
        `;
        
        // Injetar sidebar
        await this.injectSidebar();
        
        // Injetar conteúdo da calculadora
        await this.injectCalculatorContent();
        
        // Renderizar calculadoras relacionadas
        this.renderRelatedCalculators();
    },

    async injectSidebar() {
        const sidebar = document.getElementById('sidebar-container');
        if (!sidebar) return;
        
        sidebar.innerHTML = `
            <!-- Desafio Clínico -->
            <div class="sidebar-module">
                <h3 class="border-b-2 border-white/20 pb-4 mb-5 font-bold flex items-center gap-3 text-xl text-white">
                    <i class="fas fa-trophy"></i> Desafio Clínico
                </h3>
                <p class="text-sm text-white/90 mb-6 font-medium leading-relaxed">
                    Teste sua agilidade em casos reais de enfermagem.
                </p>
                <button onclick="redirectToSimulados()" class="w-full bg-white text-nurse-primary font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-lg text-sm uppercase tracking-wide">
                    Acessar Simulados <i class="fas fa-bolt ml-1"></i>
                </button>
            </div>
            
            <!-- Compartilhamento -->
            <div class="sidebar-module" style="background: linear-gradient(135deg, #0d9488, #00bcd4);">
                <h3 class="border-b-2 border-white/20 pb-4 mb-5 font-bold flex items-center gap-3 text-xl text-white">
                    <i class="fas fa-share-nodes"></i> Compartilhar
                </h3>
                <div class="flex gap-3 flex-wrap justify-start">
                    <button onclick="shareCalculator('facebook')" title="Facebook" class="w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-blue-600 transition-all shadow-md flex items-center justify-center">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button onclick="shareCalculator('whatsapp')" title="WhatsApp" class="w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-green-500 transition-all shadow-md flex items-center justify-center">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button onclick="shareCalculator('linkedin')" title="LinkedIn" class="w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-blue-800 transition-all shadow-md flex items-center justify-center">
                        <i class="fab fa-linkedin-in"></i>
                    </button>
                    <button onclick="copyLink()" title="Copiar Link" class="w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white hover:text-gray-800 transition-all shadow-md flex items-center justify-center">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
            </div>
            
            <!-- Índice de Calculadoras -->
            <div class="card-base p-6">
                <h3 class="text-sm font-bold uppercase tracking-widest text-nurse-primary dark:text-cyan-400 mb-4 flex items-center gap-2 border-b pb-3">
                    <i class="fas fa-list"></i> Outras Calculadoras
                </h3>
                <nav id="calculator-index" class="space-y-2 text-sm">
                    <!-- Será preenchido dinamicamente -->
                </nav>
            </div>
        `;
        
        // Renderizar índice de calculadoras
        this.renderCalculatorIndex();
    },

    async injectCalculatorContent() {
        const container = document.getElementById('calculator-container');
        if (!container) return;
        
        container.innerHTML = `
            <!-- Abas -->
            <nav class="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 overflow-x-auto">
                <button onclick="NURSE_SYSTEM.switchTab('calc')" id="btn-tab-calc" class="tab-btn active">
                    <i class="fas fa-calculator mr-2"></i> Calculadora
                </button>
                <button onclick="NURSE_SYSTEM.switchTab('sobre')" id="btn-tab-sobre" class="tab-btn">
                    <i class="fas fa-info-circle mr-2"></i> Sobre
                </button>
                <button onclick="NURSE_SYSTEM.switchTab('ajuda')" id="btn-tab-ajuda" class="tab-btn">
                    <i class="fas fa-question-circle mr-2"></i> Instruções
                </button>
                <button onclick="NURSE_SYSTEM.switchTab('ref')" id="btn-tab-ref" class="tab-btn">
                    <i class="fas fa-book mr-2"></i> Referência
                </button>
            </nav>
            
            <div class="p-6 md:p-10">
                <!-- Painel Calculadora -->
                <div id="pane-calc" class="tab-pane active space-y-10">
                    <!-- Identificação do Paciente -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-nurse-primary/50 mb-4 border-b pb-2">
                            <i class="fas fa-user-nurse mr-2"></i> Identificação do Paciente
                        </h3>
                        <div class="grid md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    Nome completo <span class="text-[9px] lowercase opacity-50">(opcional)</span>
                                </label>
                                <input id="patient_name" type="text" placeholder="Nome do paciente" class="input-field focus:border-nurse-secondary"/>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                    Data de Nascimento
                                    <span id="age-badge" class="text-nurse-secondary font-bold text-[9px] hidden"></span>
                                </label>
                                <input id="patient_dob" type="text" placeholder="DD/MM/YYYY" 
                                       class="input-field focus:border-nurse-secondary" 
                                       maxlength="10"
                                       oninput="maskDate(this); NURSE_SYSTEM.updateAgeBadge(this.value)"/>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Parâmetros do Cálculo -->
                    <div class="space-y-6">
                        <h3 class="text-xs font-bold uppercase tracking-widest text-nurse-primary/50 mb-4 pt-4 border-b pb-2">
                            <i class="fas fa-sliders-h mr-2"></i> Parâmetros clínicos
                            <span class="text-red-500 ml-1">*</span>
                        </h3>
                        <div id="dynamic-fields" class="grid md:grid-cols-2 gap-6">
                            <!-- Campos serão injetados dinamicamente -->
                        </div>
                        <span class="mandatory-note text-[10px] text-red-500 font-bold mt-4 block italic">
                            <i class="fas fa-asterisk text-red-500 mr-1"></i> Campos obrigatórios (em vermelho)
                        </span>
                    </div>
                    
                    <!-- Botões de Ação -->
                    <div class="grid grid-cols-2 gap-4 pt-4">
                        <button onclick="NURSE_SYSTEM.calculate()" class="btn-primary">
                            <i class="fas fa-calculator"></i> Calcular
                        </button>
                        <button onclick="NURSE_SYSTEM.resetForm()" class="btn-secondary">
                            <i class="fas fa-rotate-left"></i> Limpar
                        </button>
                    </div>
                    
                    <!-- Resultados (inicialmente oculto) -->
                    <div id="results-wrapper" class="hidden pt-12 border-t border-gray-200">
                        <!-- Resultados serão injetados aqui -->
                    </div>
                </div>
                
                <!-- Painel Sobre -->
                <div id="pane-sobre" class="tab-pane hidden">
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-nurse-primary mb-4">Sobre a Calculadora de Insulina</h2>
                        <p class="text-gray-700 dark:text-gray-300">
                            Esta ferramenta foi desenvolvida para auxiliar profissionais de saúde no cálculo preciso 
                            da quantidade de insulina a ser administrada, garantindo segurança ao paciente.
                        </p>
                        <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                            <h3 class="font-bold text-gray-800 dark:text-gray-200 mb-3">Fórmula utilizada</h3>
                            <code class="block bg-white dark:bg-gray-900 p-4 rounded font-mono text-sm">
                                Volume (mL) = (Dose Prescrita × Volume da Seringa) ÷ Concentração do Frasco
                            </code>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">
                                Onde a concentração padrão é de 100 UI/mL para insulina regular.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Painel Instruções -->
                <div id="pane-ajuda" class="tab-pane hidden">
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-nurse-primary mb-4">Instruções de Uso</h2>
                        <ol class="space-y-4 list-decimal list-inside">
                            <li class="flex gap-3">
                                <span class="bg-nurse-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                <span>Preencha os campos obrigatórios (marcados com *)</span>
                            </li>
                            <li class="flex gap-3">
                                <span class="bg-nurse-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                <span>Verifique as unidades de medida antes de calcular</span>
                            </li>
                            <li class="flex gap-3">
                                <span class="bg-nurse-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                <span>Revise a auditoria técnica e siga o check-list de segurança</span>
                            </li>
                            <li class="flex gap-3">
                                <span class="bg-nurse-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                <span>Consulte as referências técnicas se necessário</span>
                            </li>
                        </ol>
                    </div>
                </div>
                
                <!-- Painel Referências -->
                <div id="pane-ref" class="tab-pane hidden">
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-nurse-primary mb-4">Referências Técnicas</h2>
                        <ul class="space-y-3">
                            <li class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <i class="fas fa-book text-nurse-secondary mt-1"></i>
                                <span>Sociedade Brasileira de Diabetes (SBD). Diretrizes 2025/2026.</span>
                            </li>
                            <li class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <i class="fas fa-book text-nurse-secondary mt-1"></i>
                                <span>ISMP Brasil. Protocolos de Segurança na Administração de Insulina.</span>
                            </li>
                            <li class="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <i class="fas fa-book text-nurse-secondary mt-1"></i>
                                <span>Conselho Federal de Enfermagem (COFEN). Guia de Boas Práticas MAV.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar campos da calculadora
        this.initCalculatorFields();
    },

    async loadInsulinaCalculator() {
        const insulinaCalc = this.state.calculators.find(c => c.id === 'insulina');
        if (insulinaCalc) {
            this.state.currentCalculator = insulinaCalc;
            this.updatePageMetadata(insulinaCalc);
            this.initCalculatorFields();
        }
    },

    updatePageMetadata(calculator) {
        // Atualizar título da página
        document.title = `${calculator.name} - Calculadoras de Enfermagem`;
        
        // Atualizar meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = calculator.description;
        
        // Atualizar elementos visuais
        const headerTitle = document.getElementById('header-title');
        const headerDesc = document.getElementById('header-description');
        const breadcrumb = document.getElementById('breadcrumb-current');
        
        if (headerTitle) headerTitle.textContent = calculator.name;
        if (headerDesc) headerDesc.textContent = calculator.description;
        if (breadcrumb) breadcrumb.textContent = calculator.name;
    },

    initCalculatorFields() {
        const fieldsContainer = document.getElementById('dynamic-fields');
        if (!fieldsContainer) return;
        
        // Campos para cálculo de insulina
        fieldsContainer.innerHTML = `
            <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    Prescrição (UI) <span class="required-star">*</span>
                    <div class="tooltip-container ml-1">
                        <i class="fas fa-circle-info text-nurse-secondary cursor-help"></i>
                        <span class="tooltip-text">Dose exata solicitada pelo médico</span>
                    </div>
                </label>
                <input id="val_prescricao" type="number" min="0" step="0.01" 
                       class="input-field border-red-500" 
                       required
                       onkeydown="