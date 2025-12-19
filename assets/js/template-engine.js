/**
 * TemplateEngine - Sistema de Gestão de Componentes para MPA
 * Versão: 2.3.0
 * Descrição: Sistema robusto de injeção de componentes com resolução de caminhos
 * para subpastas e suporte a injeção serializada de CSS/JS.
 */
class TemplateEngine {
    constructor() {
        // 1. DETECÇÃO DO CAMINHO BASE (Correção para subpastas)
        this.basePath = this.calculateBasePath();

        // 2. CONFIGURAÇÃO: Define HTML, CSS e JS necessários por container
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
        
        if (window.__TEMPLATE_ENGINE_INIT__) {
            console.log('Template Engine já inicializado');
            return;
        }
        window.__TEMPLATE_ENGINE_INIT__ = true;

        this.waitForDOM().then(() => {
            this.init();
        });
    }

    /**
     * Calcula dinamicamente o prefixo relativo (ex: ../../) para alcançar a raiz.
     */
    calculateBasePath() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(p => p && !p.endsWith('.html'));
        
        // Lógica específica para detecção de idioma ou pastas profundas
        if (segments.length > 0) {
            const ptIndex = segments.indexOf('pt');
            if (ptIndex !== -1) {
                const depth = segments.length - ptIndex;
                return "../".repeat(depth);
            }
        }
        return "./";
    }

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
            console.log(`🚀 Template Engine - BasePath: ${this.basePath}`);
            
            await this.loadComponentsWithRetry();
            
            this.setupErrorBoundary();
            this.setupModalSystem();
            this.setupScrollToTop();
            this.setupSocialSharing(); // Adicionado para suporte à sidebar
            
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
                await this.loadComponents();
                this.componentsLoaded = true;
                return;
            } catch (error) {
                attempt++;
                console.warn(`⚠️ Tentativa ${attempt} falhou:`, error);
                if (attempt >= maxRetries) {
                    this.forceFallbackContent();
                    return;
                }
                await new Promise(r => setTimeout(r, 500 * attempt));
            }
        }
    }

    async loadComponents() {
        const loadPromises = [];
        for (const [containerId, componentConfig] of Object.entries(this.config)) {
            const container = document.getElementById(containerId);
            if (!container) continue;
            loadPromises.push(this.loadSingleComponent(containerId, componentConfig, container));
        }

        if (loadPromises.length === 0) return;
        await Promise.all(loadPromises);
    }

    async loadSingleComponent(containerId, componentConfig, container) {
        const { html: htmlRel, css: cssRel, js: jsRel } = componentConfig;
        
        // Aplica o basePath aos caminhos configurados
        const componentPath = this.basePath + htmlRel;
        const cssPath = cssRel ? this.basePath + cssRel : null;
        const jsPath = jsRel ? this.basePath + jsRel : null;

        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();
            
            container.innerHTML = html;

            if (cssPath) await this.injectCSS(cssPath, containerId);
            
            if (jsPath) {
                container.querySelectorAll('script').forEach(s => s.remove()); 
                await this.injectScript(jsPath, containerId);
            }
            
            if (containerId === 'header-container') this.highlightActiveMenuItem();

        } catch (error) {
            console.warn(`⚠️ Falha ao carregar ${componentPath}:`, error);
            throw error;
        }
    }

    injectCSS(filePath, containerId) {
        if (document.querySelector(`link[href="${filePath}"]`)) return Promise.resolve();
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = filePath;
            link.onload = resolve;
            link.onerror = () => reject(new Error(`Falha no CSS: ${filePath}`));
            document.head.appendChild(link);
        });
    }

    injectScript(filePath, containerId) {
        if (document.querySelector(`script[src="${filePath}"]`)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = filePath;
            script.defer = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Falha no Script: ${filePath}`));
            document.body.appendChild(script);
        });
    }

    highlightActiveMenuItem() {
        requestAnimationFrame(() => {
            const currentPath = window.location.pathname;
            const pageName = currentPath.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('header nav a, header .mobile-menu a, #top-bar-links a, .breadcrumb a');
            
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

    setupSocialSharing() {
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.share-btn');
            if (!btn) return;
            e.preventDefault();
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent(document.title);
            let shareUrl = '';

            if (btn.classList.contains('facebook')) shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            if (btn.classList.contains('twitter')) shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            if (btn.classList.contains('linkedin')) shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            if (btn.classList.contains('whatsapp')) shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;

            if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    }

    setupScrollToTop() {
        const checkBtn = setInterval(() => {
            const btn = document.getElementById('backToTop');
            if (btn) {
                clearInterval(checkBtn);
                window.addEventListener('scroll', () => {
                    btn.classList.toggle('hidden', window.scrollY <= 300);
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
            console.error('❌ Erro global:', event.error);
        });
    }

    showCriticalError(message) {
        const div = document.createElement('div');
        div.style.cssText = `position:fixed;bottom:20px;right:20px;background:#fee;border:1px solid #fcc;color:#c00;padding:15px;border-radius:5px;z-index:9999;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:300px;`;
        div.innerHTML = `<strong>Erro:</strong><br>${message}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 8000);
    }

    forceFallbackContent() {
        for (const containerId of Object.keys(this.config)) {
            const container = document.getElementById(containerId);
            if (container && container.innerHTML.trim().length === 0) {
                container.innerHTML = `<div style="padding:20px;text-align:center;color:#666;">Conteúdo temporariamente indisponível</div>`;
            }
        }
    }
}

// Inicialização Global
if (!window.__TEMPLATE_ENGINE_GLOBAL_INIT__) {
    window.__TEMPLATE_ENGINE_GLOBAL_INIT__ = true;
    window.templateEngine = new TemplateEngine();
}