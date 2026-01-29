/**
 * INJETOR DE CONTEÚDO PRINCIPAL
 * Gerencia a injeção dinâmica do conteúdo da página
 */

window.MAIN_CONTENT_INJECTOR = {
    
    // Templates disponíveis
    templates: {
        main: null,
        sidebar: null,
        related: null,
        author: null
    },
    
    /**
     * Obter template principal da página
     */
    getTemplate() {
        return `
            <!-- Breadcrumb -->
            <nav id="breadcrumb" class="flex items-center gap-2 text-sm text-slate-600 dark:text-cyan-300 mb-8 font-semibold" aria-label="Breadcrumb">
                <a href="index.html" class="hover:underline text-nurse-accent">Início</a>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <a href="ferramentas.html" class="hover:underline text-nurse-accent">Ferramentas</a>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="hidden md:inline hover:underline text-nurse-accent cursor-pointer">Calculadoras Clínicas</span>
                <i class="fa-solid fa-chevron-right text-[10px] hidden md:inline"></i>
                <span id="breadcrumb-current" class="text-nurse-primary dark:text-cyan-400 font-bold">Calculadora</span>
            </nav>
            
            <!-- Header Principal -->
            <header class="max-w-4xl mb-12">
                <span id="header-badge" class="bg-nurse-primary text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
                    Calculadoras Clínicas
                </span>
                <h1 id="header-title" class="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">Calculadora</h1>
                <div class="h-2 w-24 bg-gradient-to-r from-nurse-accent to-nurse-primary rounded-full mb-8"></div>
                <p id="header-description" class="text-xl text-slate-600 dark:text-slate-300 font-medium italic">
                    Ferramenta profissional com protocolos integrados.
                </p>
            </header>
            
            <!-- Layout Principal -->
            <div class="grid lg:grid-cols-[1fr,340px] gap-10 items-start">
                
                <!-- Container da Calculadora -->
                <article id="calculator-container" class="card-base p-0">
                    <div class="p-6 text-center">
                        <i class="fa-solid fa-spinner animate-spin text-4xl text-nurse-primary mb-4"></i>
                        <p class="text-slate-600 dark:text-slate-400">Carregando calculadora...</p>
                    </div>
                </article>
                
                <!-- Sidebar -->
                <aside id="sidebar-container" class="space-y-6 sticky top-28 self-start">
                    <!-- Será preenchido dinamicamente -->
                </aside>
            </div>
            
            <!-- Seção de Conteúdo Relacionado -->
            <section id="related-section" class="bg-slate-200/50 dark:bg-nurse-bgDark py-24 border-t border-slate-300 dark:border-slate-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-24">
                <div class="max-w-7xl mx-auto text-center">
                    <h2 class="text-3xl font-black mb-16 flex items-center justify-center gap-4 font-nunito">
                        <i class="fa-solid fa-layer-group text-nurse-accent"></i> Conteúdo Relacionado
                    </h2>
                    <div id="related-cards" class="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <!-- Será preenchido dinamicamente -->
                    </div>
                </div>
            </section>
            
            <!-- Seção Autor e Tags -->
            <section class="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800">
                <div class="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-slate-200 dark:border-slate-700 shadow-sm mb-12">
                    <img src="https://auditeduca.github.io/Calculadoras-de-Enfermagem/assets/images/author-info.webp" alt="Autor" class="w-28 h-28 rounded-full object-cover shadow-xl border-4 border-white dark:border-slate-800"/>
                    <div class="text-center md:text-left">
                        <h3 class="text-2xl font-black mb-3 text-nurse-primary dark:text-cyan-400 font-nunito">Calculadoras de Enfermagem</h3>
                        <p class="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-2xl font-inter italic">
                            "A precisão técnica é a expressão máxima do cuidado ético ao paciente."
                        </p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 items-center">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center">
                        <i class="fa-solid fa-tags mr-2"></i> Tópicos:
                    </span>
                    <span id="tags-container" class="flex flex-wrap gap-2">
                        <!-- Será preenchido dinamicamente -->
                    </span>
                </div>
            </section>
        `;
    },
    
    /**
     * Obter template do sidebar
     */
    getSidebarTemplate() {
        return `
            <!-- Desafio Clínico -->
            <div class="sidebar-module">
                <h3 class="border-b-2 border-white/20 pb-4 mb-5 font-bold flex items-center gap-3 text-xl text-white font-nunito">
                    <i class="fa-solid fa-trophy"></i> Desafio Clínico
                </h3>
                <p class="text-sm text-white/90 mb-6 font-medium leading-relaxed font-inter">
                    Teste sua agilidade em casos reais de enfermagem.
                </p>
                <button onclick="NURSE_SYSTEM.redirectToSimulados()" class="w-full bg-white text-nurse-primary font-black py-3 rounded-xl hover:bg-slate-100 transition shadow-lg text-sm uppercase tracking-wide">
                    Acessar Simulados <i class="fa-solid fa-bolt ml-1"></i>
                </button>
            </div>
            
            <!-- Compartilhamento -->
            <div class="sidebar-module from-teal-700 to-nurse-secondary shadow-nurse-accent/20">
                <h3 class="border-b-2 border-white/20 pb-4 mb-5 font-bold flex items-center gap-3 text-xl text-white font-nunito">
                    <i class="fas fa-share-nodes"></i> Compartilhar
                </h3>
                <div class="flex gap-3 flex-wrap justify-start">
                    <button class="share-btn hover:text-blue-600" onclick="NURSE_SYSTEM.share('facebook')" title="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </button>
                    <button class="share-btn hover:text-green-500" onclick="NURSE_SYSTEM.share('whatsapp')" title="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="share-btn hover:text-blue-800" onclick="NURSE_SYSTEM.share('linkedin')" title="LinkedIn">
                        <i class="fab fa-linkedin-in"></i>
                    </button>
                    <button class="share-btn hover:text-gray-300" onclick="NURSE_SYSTEM.copyLink()" title="Copiar Link">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
            </div>
            
            <!-- Índice de Calculadoras -->
            <div id="calculator-index-container" class="card-base p-6">
                <h3 class="text-sm font-black uppercase tracking-widest text-nurse-primary dark:text-cyan-400 mb-4 flex items-center gap-2 border-b pb-3">
                    <i class="fa-solid fa-list"></i> Outras Calculadoras
                </h3>
                <nav id="calculator-index" class="space-y-2 text-sm">
                    <!-- Será preenchido dinamicamente -->
                    <a href="#" class="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-nurse-primary/10 hover:text-nurse-primary transition">
                        <i class="fa-solid fa-spinner animate-spin mr-2"></i> Carregando...
                    </a>
                </nav>
            </div>
        `;
    },
    
    /**
     * Injetar conteúdo na página
     */
    inject() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Container principal não encontrado');
            return;
        }
        
        // Injetar template principal
        mainContent.innerHTML = this.getTemplate();
        
        // Injetar sidebar
        const sidebar = document.getElementById('sidebar-container');
        if (sidebar) {
            sidebar.innerHTML = this.getSidebarTemplate();
        }
        
        console.log('📝 Conteúdo principal injetado');
    },
    
    /**
     * Atualizar sidebar com calculadoras
     */
    updateSidebar(calculators, currentId) {
        const container = document.getElementById('calculator-index');
        if (!container || !calculators) return;
        
        let html = '';
        
        if (calculators.length === 0) {
            html = `
                <a href="#" class="block px-3 py-2 rounded-lg text-slate-400 italic">
                    Nenhuma calculadora disponível
                </a>
            `;
        } else {
            html = calculators.map(calc => `
                <a href="#" onclick="NURSE_SYSTEM.selectCalculator('${calc.id}'); return false;" 
                   class="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-nurse-primary/10 hover:text-nurse-primary transition font-medium text-sm">
                    <i class="fa-solid fa-calculator mr-2 text-nurse-primary"></i> ${calc.name}
                </a>
            `).join('');
        }
        
        container.innerHTML = html;
    },
    
    /**
     * Atualizar cards relacionados
     */
    updateRelatedCards(calculators, currentId) {
        const container = document.getElementById('related-cards');
        if (!container || !calculators) return;
        
        // Filtrar calculadoras relacionadas (excluir a atual)
        const related = calculators
            .filter(calc => calc.id !== currentId)
            .slice(0, 3);
        
        if (related.length === 0) {
            container.innerHTML = `
                <div class="md:col-span-3 text-center py-12">
                    <i class="fa-solid fa-inbox text-4xl text-slate-300 mb-4"></i>
                    <p class="text-slate-400">Nenhuma calculadora relacionada disponível</p>
                </div>
            `;
            return;
        }
        
        const html = related.map(calc => `
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
        `).join('');
        
        container.innerHTML = html;
    },
    
    /**
     * Atualizar tags
     */
    updateTags(tags = []) {
        const container = document.getElementById('tags-container');
        if (!container) return;
        
        if (tags.length === 0) {
            tags = ['enfermagem', 'cálculos', 'segurança', 'paciente', 'protocolos'];
        }
        
        const html = tags.slice(0, 8).map(tag => `
            <span class="tag-pill-footer" onclick="NURSE_SYSTEM.searchTag('${tag}')">
                #${tag}
            </span>
        `).join('');
        
        container.innerHTML = html;
    }
};