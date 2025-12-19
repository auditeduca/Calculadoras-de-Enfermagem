/**
 * TemplateEngine - Sistema de Gestão de Componentes para MPA
 * Versão: 2.1.0
 * Descrição: Gere a injeção dinâmica de HTML, CSS e JS para componentes reutilizáveis,
 * com suporte automático para caminhos relativos em subpastas.
 */
class TemplateEngine {
    constructor() {
        // 1. DETEÇÃO AUTOMÁTICA DO CAMINHO BASE
        // Calcula o prefixo necessário (ex: ../../) com base na profundidade do URL
        this.basePath = this.calculateBasePath();

        // 2. CONFIGURAÇÃO COM CAMINHOS DINÂMICOS
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
            'modals-container': { 
                html: 'assets/components/modals-main.html',
                css: 'assets/css/modals.css',
                js: 'assets/js/modals.js' 
            }
        };

        this.componentsLoaded = false;
        
        if (window.__TEMPLATE_ENGINE_INIT__) return;
        window.__TEMPLATE_ENGINE_INIT__ = true;

        this.init();
    }

    /**
     * Calcula o prefixo relativo necessário para alcançar a raiz do projeto.
     * Útil para GitHub Pages onde a estrutura de pastas é fixa.
     */
    calculateBasePath() {
        const path = window.location.pathname;
        // Verifica se estamos em ambiente de produção (GitHub Pages ou domínio)
        // e conta quantos níveis abaixo da raiz a página atual se encontra.
        
        // Exemplo: /pt/sobre-nos/missao.html -> ['pt', 'sobre-nos'] -> 2 níveis -> "../../"
        const segments = path.split('/').filter(p => p && !p.includes('.html'));
        
        // Se estivermos dentro da pasta 'pt' ou similar, calculamos a profundidade
        if (path.includes('/pt/') || path.includes('/en/')) {
            const depth = segments.length;
            return "../".repeat(depth);
        }
        return "";
    }

    async init() {
        try {
            console.log('🚀 Template Engine - Inicializando com BasePath:', this.basePath || 'Raiz');
            
            // Aguarda o DOM estar pronto
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }

            await this.loadComponents();
            
            this.setupModalSystem();
            this.setupScrollToTop();
            
            document.dispatchEvent(new Event('template-loaded'));
            console.log('✅ Sistema MPA operacional');
            
        } catch (error) {
            console.error('❌ Erro crítico:', error);
        }
    }

    async loadComponents() {
        const loadPromises = [];
        
        for (const [containerId, cfg] of Object.entries(this.config)) {
            const container = document.getElementById(containerId);
            if (!container) continue;

            // Aplica o basePath a todos os URLs antes do fetch
            const paths = {
                html: this.basePath + cfg.html,
                css: cfg.css ? this.basePath + cfg.css : null,
                js: cfg.js ? this.basePath + cfg.js : null
            };

            loadPromises.push(this.loadSingleComponent(containerId, paths, container));
        }

        await Promise.all(loadPromises);
        this.componentsLoaded = true;
    }

    async loadSingleComponent(containerId, paths, container) {
        try {
            // 1. Fetch do HTML
            const response = await fetch(paths.html);
            if (!response.ok) throw new Error(`Falha ao carregar HTML: ${response.status}`);
            const html = await response.text();
            
            container.innerHTML = html;

            // 2. Injeção de CSS
            if (paths.css) {
                this.injectAsset('css', paths.css);
            }

            // 3. Injeção de JS
            if (paths.js) {
                this.injectAsset('js', paths.js);
            }

            if (containerId === 'header-container') this.highlightActiveMenuItem();

        } catch (error) {
            console.warn(`⚠️ Erro no componente ${containerId}:`, error);
        }
    }

    injectAsset(type, path) {
        const id = `asset-${path.replace(/[/.]/g, '-')}`;
        if (document.getElementById(id)) return;

        if (type === 'css') {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
        } else {
            const script = document.createElement('script');
            script.id = id;
            script.src = path;
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    highlightActiveMenuItem() {
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('header nav a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === pageName) {
                link.classList.add('active-page');
            }
        });
    }

    setupModalSystem() {
        document.body.addEventListener('click', (e) => {
            const trigger = e.target.closest('.modal-trigger');
            if (trigger) {
                e.preventDefault();
                const targetId = trigger.dataset.modalTarget || trigger.getAttribute('href')?.substring(1);
                const modal = document.getElementById(targetId);
                if (modal) modal.classList.remove('hidden');
            }
        });
    }

    setupScrollToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('hidden', window.scrollY <= 300);
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

// Inicialização Global Única
window.templateEngine = new TemplateEngine();