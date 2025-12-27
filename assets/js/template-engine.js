/**
 * Template Engine v3.3 - CORRIGIDO PARA PRODUÇÃO
 * Alterações:
 * - Dispara evento 'components:loaded' ao finalizar.
 * - Garante que scripts só rodem após HTML injetado.
 * - Tratamento de erro de path.
 */

class TemplateEngine {
    constructor() {
        this.rootPath = this._calculateRootPath();
        
        // Mapeamento de assets
        this.componentAssets = {
            'header': { js: 'header.js', css: 'header.css' },
            'footer': { js: 'footer.js', css: 'footer.css' },
            'modals': { js: 'modals.js', css: 'modals.css' }
        };

        this.initialized = false;

        // Inicia assim que possível
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    _calculateRootPath() {
        // Ajuste esta lógica conforme a estrutura real do seu servidor
        const isGithub = window.location.hostname.includes('github.io');
        // Se estiver local, geralmente é '/', se for github pages, tem o nome do repo
        return isGithub ? '/Calculadoras-de-Enfermagem/' : '/';
    }

    async init() {
        if (this.initialized) return;

        try {
            console.time('TemplateEngine Load');
            console.log(`[TemplateEngine] Iniciando load via: ${this.rootPath}`);

            // 1. Carrega HTMLs primeiro (Paralelo)
            await Promise.all([
                this._inject('footer-container', 'footer.html', 'footer'),
                this._inject('modals-container', 'modals-main.html', 'modals')
                // Adicione header aqui se necessário
            ]);

            this.initialized = true;
            console.timeEnd('TemplateEngine Load');

            // 2. DISPARO CRÍTICO DE EVENTO
            // Avisa a aplicação que o HTML existe e os Scripts foram carregados
            window.dispatchEvent(new CustomEvent('components:loaded', {
                detail: { timestamp: Date.now() }
            }));
            
            console.log('[TemplateEngine] Evento "components:loaded" disparado.');

        } catch (error) {
            console.error('[TemplateEngine] Falha fatal na inicialização:', error);
        }
    }

    /**
     * Injeta HTML e depois carrega CSS/JS associados
     */
    async _inject(containerId, htmlFile, componentName) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`[TemplateEngine] Container #${containerId} não encontrado. Pulando ${componentName}.`);
            return;
        }

        try {
            // A. Fetch do HTML
            const response = await fetch(`${this.rootPath}${htmlFile}`);
            if (!response.ok) throw new Error(`HTTP ${response.status} ao carregar ${htmlFile}`);
            
            const htmlContent = await response.text();
            
            // B. Inserção Segura
            container.innerHTML = htmlContent;

            // C. Carregar Assets (CSS e JS) APÓS o HTML existir
            await this._loadAssets(componentName);

        } catch (err) {
            console.error(`[TemplateEngine] Erro ao injetar ${componentName}:`, err);
            container.innerHTML = `<div class="error-placeholder">Falha ao carregar ${componentName}</div>`;
        }
    }

    async _loadAssets(componentName) {
        const assets = this.componentAssets[componentName];
        if (!assets) return;

        const promises = [];

        // Carrega CSS
        if (assets.css) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `${this.rootPath}${assets.css}`;
            document.head.appendChild(link);
        }

        // Carrega JS
        if (assets.js) {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `${this.rootPath}${assets.js}`;
                script.async = false; // Garante ordem se houver múltiplos
                script.onload = () => {
                    console.log(`[TemplateEngine] Script carregado: ${assets.js}`);
                    resolve();
                };
                script.onerror = () => {
                    console.error(`[TemplateEngine] Falha script: ${assets.js}`);
                    // Resolvemos mesmo com erro para não travar o Promise.all principal
                    resolve(); 
                };
                document.body.appendChild(script);
            }));
        }

        return Promise.all(promises);
    }
}

// Inicializa Engine
window.templateEngine = new TemplateEngine();