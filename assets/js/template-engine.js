class TemplateEngine {
    constructor() {
        // --- CONFIGURAÇÃO APRIMORADA: Define HTML, CSS e JS necessários por container ---
        this.config = {
            'header-container': { 
                html: 'assets/components/header.html',
                css: 'assets/css/header.css',
                js: 'assets/js/header.js'
            },
            'footer-container': { 
                html: 'assets/components/footer.html',
                css: 'assets/css/footer.css',
                js: 'assets/js/footer.js' 
            },
            'main-container': { 
                html: 'assets/components/main.html',
                css: 'assets/css/main.css',
                js: 'assets/js/main.js' 
            },
            'modals-container': { 
                html: 'assets/components/modals-main.html',
                css: 'assets/css/modals.css',
                js: 'assets/js/modals.js' 
            }
        };

        this.componentsLoaded = false;
        
        // Proteção contra inicialização dupla
        if (window.__TEMPLATE_ENGINE_INIT__) {
            console.log('Template Engine já inicializado');
            return;
        }
        window.__TEMPLATE_ENGINE_INIT__ = true;

        this.waitForDOM().then(() => {
            this.init();
        });
    }

    // --- MÉTODOS DE CONTROLE DE FLUXO ---
    
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    async init() {
        try {
            console.log('🚀 Template Engine (MPA) - Inicializando...');
            console.log('📋 Configuração:', Object.keys(this.config));
            
            await this.loadComponentsWithRetry();
            
            this.setupErrorBoundary();
            this.setupModalSystem();
            this.setupScrollToTop();
            
            // Dispara evento após a injeção do HTML e recursos base
            document.dispatchEvent(new Event('template-loaded'));
            
            console.log('✅ Sistema MPA operacional');
            
        } catch (error) {
            console.error('❌ Erro crítico ao inicializar Template Engine:', error);
            this.showCriticalError("Erro ao carregar componentes do site. Tente recarregar a página.");
        }
    }

    async loadComponentsWithRetry() {
        const maxRetries = 3;
        let attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                console.log(`🔄 Tentativa ${attempt + 1} de carregar componentes...`);
                await this.loadComponents();
                this.componentsLoaded = true;
                console.log('✅ Todos os componentes carregados com sucesso!');
                return;
            } catch (error) {
                attempt++;
                console.warn(`⚠️ Tentativa ${attempt} de carregar componentes falhou:`, error);
                
                if (attempt >= maxRetries) {
                    console.error('❌ Falha definitiva ao carregar componentes.');
                    this.forceFallbackContent();
                    return;
                }
                
                await new Promise(r => setTimeout(r, 500 * attempt));
            }
        }
    }

    async loadComponents() {
        console.log('📦 Iniciando carregamento de componentes...');
        
        const loadPromises = [];
        
        // Itera sobre a nova configuração que contém HTML, CSS e JS
        for (const [containerId, componentConfig] of Object.entries(this.config)) {
            const container = document.getElementById(containerId);
            
            if (!container) {
                console.error(`❌ Container ${containerId} não encontrado no DOM!`);
                continue;
            }
            
            console.log(`🔍 Container ${containerId} encontrado, carregando...`);
            
            loadPromises.push(this.loadSingleComponent(containerId, componentConfig, container));
        }

        if (loadPromises.length === 0) {
            throw new Error('Nenhum container encontrado para carregar');
        }

        await Promise.all(loadPromises);
        console.log('✅ Promise.all concluído para todos os componentes');
    }

    // --- MÉTODOS DE INJEÇÃO E CARREGAMENTO DE RECURSOS ---

    async loadSingleComponent(containerId, componentConfig, container) {
        const { html: componentPath, css: cssPath, js: jsPath } = componentConfig;

        try {
            // 1. CARREGAR HTML
            console.log(`📥 Tentando carregar HTML: ${componentPath}`);
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const html = await response.text();
            
            if (!html || html.trim().length === 0) {
                throw new Error('Arquivo retornou conteúdo vazio');
            }
            
            // 2. INJETAR HTML
            container.innerHTML = html;
            console.log(`✅ HTML ${componentPath} injetado.`);
            
            // 3. INJETAR CSS (Pode ser paralelo)
            if (cssPath) {
                await this.injectCSS(cssPath, containerId);
            }

            // 4. INJETAR JS (Serial - após HTML e CSS)
            if (jsPath) {
                // Remove scripts que vieram no HTML injetado, confiando apenas no JS configurado
                container.querySelectorAll('script').forEach(s => s.remove()); 
                await this.injectScript(jsPath, containerId);
            }
            
            // 5. FUNÇÕES BASE (Chamado após o header estar no DOM)
            if (containerId === 'header-container') {
                this.highlightActiveMenuItem();
            }

        } catch (error) {
            console.warn(`⚠️ Falha ao carregar ${componentPath}:`, error);
            
            // Lógica de fallback
            const currentContent = container.innerHTML.trim();
            if (currentContent.length < 10) {
                this.createBasicFallback(containerId, container);
            }
            throw error;
        }
    }
    
    // NOVO: Injeta CSS dinamicamente no <head>
    injectCSS(filePath, containerId) {
        if (document.querySelector(`link[href="${filePath}"]`)) {
            return Promise.resolve(); // Já carregado
        }
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = filePath;
            link.onload = resolve;
            link.onerror = (e) => reject(new Error(`Falha ao carregar CSS: ${filePath}`));
            document.head.appendChild(link);
            console.log(`📥 CSS injetado: ${filePath} (${containerId})`);
        });
    }
    
    // NOVO: Injeta Script dinamicamente no <body> para execução garantida
    injectScript(filePath, containerId) {
        if (document.querySelector(`script[src="${filePath}"]`)) {
            return Promise.resolve(); // Já carregado
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = filePath;
            script.onload = resolve;
            script.onerror = (e) => reject(new Error(`Falha ao carregar Script: ${filePath}`));
            
            // Anexar ao body garante que ele será executado após a injeção do HTML
            document.body.appendChild(script); 
            console.log(`📥 JS injetado: ${filePath} (${containerId})`);
        });
    }

    // --- MÉTODOS DE FALLBACK ---

    createBasicFallback(containerId, container) {
        const fallbackContent = {
            'header-container': `<header style="background:#f8f9fa;padding:20px;border-bottom:1px solid #dee2e6;">
                <h2 style="color:#495057;margin:0;">Calculadoras de Enfermagem</h2>
                <nav style="margin-top:10px;">
                    <a href="#" style="margin-right:15px;color:#007bff;text-decoration:none;">Home</a>
                    <a href="#" style="margin-right:15px;color:#007bff;text-decoration:none;">Calculadoras</a>
                    <a href="#" style="color:#007bff;text-decoration:none;">Sobre</a>
                </nav>
            </header>`,
            'footer-container': `<footer style="background:#f8f9fa;padding:20px;border-top:1px solid #dee2e6;text-align:center;color:#6c757d;">
                <p>&copy; 2025 Calculadoras de Enfermagem - Ferramentas Clínicas para Profissionais de Saúde</p>
            </footer>`,
            'main-container': `<main style="padding:40px 20px;">
                <div style="max-width:1200px;margin:0 auto;">
                    <h1 style="color:#1a365d;margin-bottom:20px;">Bem-vindo às Calculadoras de Enfermagem</h1>
                    <p style="font-size:1.1em;color:#4a5568;line-height:1.6;">
                        Conteúdo não carregado.
                    </p>
                </div>
            </main>`,
            'modals-container': `<div style="display:none;">Modais carregados</div>`
        };
        
        const content = fallbackContent[containerId] || `<div style="padding:20px;background:#fee;border:1px solid #fcc;">Container ${containerId} em fallback</div>`;
        container.innerHTML = content;
        console.log(`🔧 Fallback criado para ${containerId}`);
    }

    forceFallbackContent() {
        console.log('🔧 Forçando conteúdo de fallback para todos os containers...');
        for (const [containerId] of Object.entries(this.config)) {
            const container = document.getElementById(containerId);
            if (container) {
                this.createBasicFallback(containerId, container);
            }
        }
    }

    showCriticalError(message) {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: #fee; border: 1px solid #fcc; 
            color: #c00; padding: 15px; border-radius: 5px; 
            z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 300px;
        `;
        div.innerHTML = `<strong>Erro:</strong><br>${message}`;
        document.body.appendChild(div);
        
        setTimeout(() => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        }, 8000);
    }
    
    // --- OUTRAS FUNCIONALIDADES ---

    highlightActiveMenuItem() {
        requestAnimationFrame(() => {
            const currentPath = window.location.pathname;
            const pageName = currentPath.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('header nav a, header .mobile-menu a, #top-bar-links a');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;

                link.classList.remove('text-yellow-500', 'font-bold');
                
                if (href === pageName || (pageName === '' && href === 'index.html') || currentPath.endsWith(href)) {
                    link.classList.add('text-yellow-500', 'font-bold');
                }
            });
        });
    }

    setupModalSystem() {
        document.body.addEventListener('click', (e) => {
            const trigger = e.target.closest('.modal-trigger');
            if (trigger) {
                e.preventDefault();
                const targetId = trigger.getAttribute('data-modal-target') || trigger.getAttribute('href')?.substring(1);
                this.openModal(targetId);
            }

            if (e.target.classList.contains('modal-backdrop') || e.target.closest('.modal-close-btn')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal) this.closeModal(modal.id);
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            const backdrop = modal.querySelector('.modal-backdrop');
            const content = modal.querySelector('.modal-content');
            if (backdrop) backdrop.style.opacity = '1';
            if (content) {
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }
        });
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const backdrop = modal.querySelector('.modal-backdrop');
        const content = modal.querySelector('.modal-content');
        
        if (backdrop) backdrop.style.opacity = '0';
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(8px)';
        }

        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    setupScrollToTop() {
        const checkBtn = setInterval(() => {
            const btn = document.getElementById('backToTop');
            if (btn) {
                clearInterval(checkBtn);
                
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        btn.classList.remove('hidden');
                    } else {
                        btn.classList.add('hidden');
                    }
                });

                btn.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        }, 500);

        setTimeout(() => clearInterval(checkBtn), 5000);
    }

    setupErrorBoundary() {
        window.addEventListener('error', (event) => {
            console.error('❌ Erro global capturado:', event.error);
        });
    }

    // Métodos públicos para compatibilidade
    isComponentsLoaded() {
        return this.componentsLoaded;
    }

    reloadComponent(containerId) {
        const componentConfig = this.config[containerId];
        if (componentConfig) {
            const container = document.getElementById(containerId);
            if (!container) return Promise.reject(new Error(`Container ${containerId} não encontrado`));
            return this.loadSingleComponent(containerId, componentConfig, container);
        }
        return Promise.reject(new Error(`Componente não configurado: ${containerId}`));
    }
}

// Inicialização global
if (!window.__TEMPLATE_ENGINE_GLOBAL_INIT__) {
    window.__TEMPLATE_ENGINE_GLOBAL_INIT__ = true;
    
    const initEngine = () => { 
        try {
            console.log('🎯 Inicializando Template Engine...');
            window.templateEngine = new TemplateEngine();
            
            // Método de debug disponível globalmente
            window.debugTemplateEngine = () => {
                 console.log('🔍 Status do Template Engine:');
                 console.log('- Components loaded:', window.templateEngine.isComponentsLoaded());
                 console.log('- Config:', window.templateEngine.config);
                 
                 for (const [containerId] of Object.entries(window.templateEngine.config)) {
                     const container = document.getElementById(containerId);
                     const hasContent = container && container.innerHTML.trim().length > 0;
                     console.log(`- ${containerId}: ${container ? (hasContent ? 'OK' : 'VAZIO') : 'NÃO ENCONTRADO'}`);
                 }
            };
            
        } catch (error) {
            console.error('❌ Erro fatal ao inicializar Template Engine:', error);
        }
    };
    
    // Garante a inicialização assim que o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEngine);
    } else {
        initEngine();
    }
    
    // Inicialização adicional para garantir que o motor inicie
    window.addEventListener('load', () => {
        if (!window.templateEngine) {
            console.log('🔄 Inicialização adicional do Template Engine...');
            initEngine();
        }
    });
}

console.log('✅ Template Engine carregado - Sistema Multi-Pages');