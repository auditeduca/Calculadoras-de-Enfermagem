/**
 * Template Engine v3.0 - Calculadoras de Enfermagem
 * Gerencia a injeção de componentes globais (Header, Footer, Modais)
 * e o carregamento de seus respectivos recursos (JS e CSS).
 */
class TemplateEngine {
    constructor() {
        this.rootPath = this._calculateRootPath();
        
        // Mapeamento de componentes para seus arquivos de Script e Estilo
        this.componentAssets = {
            'header': { js: 'header.js', css: 'header.css' },
            'footer': { js: 'footer.js', css: 'footer.css' },
            'modals': { js: 'modals.js', css: 'modals.css' }
        };
        
        this.init();
    }

    /**
     * Define a raiz do projeto para garantir caminhos corretos em diferentes ambientes
     */
    _calculateRootPath() {
        return window.location.hostname.includes('github.io') ? '/Calculadoras-de-Enfermagem/' : '/';
    }

    /**
     * Inicializa o carregamento dos componentes principais
     */
    async init() {
        try {
            // Carrega Header, Footer e Modais simultaneamente
            await Promise.all([
                this._inject('header-container', 'header.html', 'header'),
                this._inject('footer-container', 'footer.html', 'footer'),
                this._inject('modals-container', 'modals-main.html', 'modals')
            ]);
            
            // Notifica outros scripts que o ambiente modular está pronto
            window.dispatchEvent(new CustomEvent('templateEngineReady'));
        } catch (e) {
            console.error('[TemplateEngine] Erro crítico na inicialização:', e);
        }
    }

    /**
     * Injeta o HTML em um container e carrega JS/CSS associados
     */
    async _inject(id, file, name) {
        const container = document.getElementById(id);
        if (!container) return;

        try {
            // 1. Busca e injeta o HTML
            const response = await fetch(`${this.rootPath}assets/components/${file}`);
            if (!response.ok) throw new Error(`Falha ao carregar ${file}`);
            
            container.innerHTML = await response.text();

            // 2. Carrega Recursos (CSS e JS)
            const assets = this.componentAssets[name];
            if (assets) {
                if (assets.css) this._loadStyle(assets.css);
                if (assets.js) await this._loadScript(assets.js);
            }
            
        } catch (error) {
            console.warn(`[TemplateEngine] Erro ao processar componente ${name}:`, error);
        }
    }

    /**
     * Carrega um arquivo CSS dinamicamente se ainda não existir no HEAD
     */
    _loadStyle(fileName) {
        const id = `css-${fileName.replace(/\./g, '-')}`;
        if (document.getElementById(id)) return;

        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `${this.rootPath}assets/css/${fileName}`;
        document.head.appendChild(link);
    }

    /**
     * Carrega um arquivo JS dinamicamente e retorna uma Promise
     */
    _loadScript(fileName) {
        return new Promise((resolve) => {
            const id = `js-${fileName.replace(/\./g, '-')}`;
            if (document.getElementById(id)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.id = id;
            script.src = `${this.rootPath}assets/js/${fileName}`;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => {
                console.warn(`[TemplateEngine] Falha ao carregar script: ${fileName}`);
                resolve(); // Resolve para não travar o Promise.all
            };
            document.body.appendChild(script);
        });
    }
}

// Auto-inicialização
window.TemplateEngine = new TemplateEngine();