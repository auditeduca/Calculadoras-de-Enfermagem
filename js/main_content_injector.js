/**
 * INJETOR DE CONTEÚDO PRINCIPAL
 */

window.MAIN_CONTENT_INJECTOR = {
    
    /**
     * Injetar conteúdo na página
     */
    inject() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('Container principal não encontrado');
            return false;
        }
        
        try {
            // Injetar template principal
            mainContent.innerHTML = this.getMainTemplate();
            
            console.log('📝 Conteúdo principal injetado com sucesso');
            return true;
            
        } catch (error) {
            console.error('Erro ao injetar conteúdo:', error);
            return false;
        }
    },
    
    /**
     * Obter template principal da página
     */
    getMainTemplate() {
        return `
            <!-- Breadcrumb -->
            <nav id="breadcrumb" class="flex items-center gap-2 text-sm text-slate-600 dark:text-cyan-300 mb-8 font-semibold" aria-label="Breadcrumb">
                <a href="index.html" class="hover:underline text-nurse-accent">Início</a>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <a href="#" class="hover:underline text-nurse-accent">Ferramentas</a>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-nurse-primary dark:text-cyan-400 font-bold" id="breadcrumb-current">Calculadoras</span>
            </nav>
            
            <!-- Header Principal -->
            <header class="max-w-4xl mb-12">
                <span id="header-badge" class="bg-nurse-primary text-white text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-md">
                    Calculadoras Clínicas
                </span>
                <h1 id="header-title" class="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">Calculadora de Enfermagem</h1>
                <div class="h-2 w-24 bg-gradient-to-r from-nurse-accent to-nurse-primary rounded-full mb-8"></div>
                <p id="header-description" class="text-xl text-slate-600 dark:text-slate-300 font-medium italic">
                    Sistema profissional com protocolos de segurança integrados
                </p>
            </header>
            
            <!-- Layout Principal -->
            <div class="grid lg:grid-cols-3 gap-8">
                
                <!-- Container da Calculadora -->
                <div class="lg:col-span-2">
                    <article id="calculator-container" class="card-base p-0">
                        <div class="p-8 text-center">
                            <i class="fa-solid fa-spinner animate-spin text-4xl text-nurse-primary mb-4"></i>
                            <p class="text-slate-600 dark:text-slate-400">Carregando calculadora...</p>
                        </div>
                    </article>
                </div>
                
                <!-- Sidebar -->
                <aside class="space-y-6">
                    <!-- Índice de Calculadoras -->
                    <div class="card-base p-6">
                        <h3 class="text-sm font-bold text-nurse-primary dark:text-cyan-400 mb-4">
                            Calculadoras Disponíveis
                        </h3>
                        <nav id="calculator-index" class="space-y-2">
                            <div class="text-center py-4 text-slate-400">
                                Carregando...
                            </div>
                        </nav>
                    </div>
                    
                    <!-- Compartilhamento -->
                    <div class="card-base p-6">
                        <h3 class="text-sm font-bold text-nurse-primary dark:text-cyan-400 mb-4">
                            <i class="fas fa-share-nodes mr-2"></i> Compartilhar
                        </h3>
                        <div class="flex gap-3 flex-wrap">
                            <button class="w-10 h-10 rounded-full bg-slate-100 hover:bg-nurse-primary text-slate-600 hover:text-white transition-all flex items-center justify-center" onclick="NURSE_SYSTEM.share('facebook')" title="Facebook">
                                <i class="fab fa-facebook-f"></i>
                            </button>
                            <button class="w-10 h-10 rounded-full bg-slate-100 hover:bg-green-500 text-slate-600 hover:text-white transition-all flex items-center justify-center" onclick="NURSE_SYSTEM.share('whatsapp')" title="WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button class="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-700 text-slate-600 hover:text-white transition-all flex items-center justify-center" onclick="NURSE_SYSTEM.share('linkedin')" title="LinkedIn">
                                <i class="fab fa-linkedin-in"></i>
                            </button>
                            <button class="w-10 h-10 rounded-full bg-slate-100 hover:bg-nurse-accent text-slate-600 hover:text-white transition-all flex items-center justify-center" onclick="NURSE_SYSTEM.copyLink()" title="Copiar Link">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        `;
    }
};