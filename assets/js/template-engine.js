class TemplateEngine {
    constructor(config = {}) {
        this.config = {
            debug: config.debug !== false,
            cache: config.cache !== false,
            ...config
        };

        this.loadedAssets = new Set();
        this.rootPath = this._calculateRootPath();
        this.init();
    }

    _calculateRootPath() {
        const path = window.location.pathname;
        const host = window.location.hostname;
        
        if (host.includes('github.io')) {
            const repoMatch = path.match(/^\/([^\/]+)\//);
            return repoMatch ? `/${repoMatch[1]}/` : '/';
        }
        return '/';
    }

    resolve(relPath) {
        const clean = relPath.startsWith('/') ? relPath.substring(1) : relPath;
        return this.rootPath + clean;
    }

    async init() {
        if (document.readyState === 'loading') {
            await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        }
        
        try {
            // 1. Carregar Dependências Globais Estáticas
            await this._loadStyle(this.resolve('assets/css/global.css'));
            await this._loadScript(this.resolve('assets/js/utils.js'));

            // 2. Injetar Componentes Modulares (HTML + CSS + JS)
            await Promise.all([
                this._inject('header-container', 'header.html', 'header'),
                this._inject('footer-container', 'footer.html', 'footer'),
                this._inject('modals-container', 'modal-main.html', 'modals')
            ]);

            window.dispatchEvent(new CustomEvent('templateEngineReady', { 
                detail: { root: this.rootPath } 
            }));
            
        } catch (e) {
            console.error("[TemplateEngine] Erro crítico:", e);
        }
    }

    async _inject(containerId, htmlFile, assetName) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            // Carregar CSS do componente
            if (assetName) {
                await this._loadStyle(this.resolve(`assets/css/${assetName}.css`));
            }

            // Carregar HTML
            const response = await fetch(this.resolve(`assets/components/${htmlFile}`));
            if (!response.ok) throw new Error(`Falha ao buscar ${htmlFile}`);
            container.innerHTML = await response.text();

            // Carregar JS do componente (se existir na lista do projeto)
            const jsComponents = ['header', 'footer']; 
            if (assetName && jsComponents.includes(assetName)) {
                await this._loadScript(this.resolve(`assets/js/${assetName}.js`));
            }
        } catch (err) {
            if (this.config.debug) console.warn(`[TemplateEngine] ${htmlFile}: ${err.message}`);
        }
    }

    async _loadScript(url) {
        if (this.loadedAssets.has(url)) return;
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.defer = true;
            s.onload = () => { this.loadedAssets.add(url); resolve(); };
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    async _loadStyle(url) {
        if (this.loadedAssets.has(url) || document.querySelector(`link[href="${url}"]`)) return;
        return new Promise((resolve) => {
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = url;
            l.onload = () => { this.loadedAssets.add(url); resolve(); };
            l.onerror = resolve; 
            document.head.appendChild(l);
        });
    }
}

window.TemplateEngine = new TemplateEngine();