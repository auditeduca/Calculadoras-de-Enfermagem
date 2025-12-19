/**
 * Template Engine Robusto para Calculadoras de Enfermagem
 * 
 * Características:
 * - Suporte automático a estruturas de pastas profundas
 * - Injeção dinâmica de Header, Footer e Modais
 * - Carregamento inteligente de CSS/JS
 * - Cache de componentes
 * - Tratamento robusto de erros
 * - Suporte a GitHub Pages e localhost
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.0.0
 */

class TemplateEngine {
    constructor(config = {}) {
        // Configuração padrão
        this.config = {
            debug: config.debug !== false,
            cacheComponents: config.cacheComponents !== false,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 500,
            ...config
        };

        // Estado interno
        this.cache = new Map();
        this.loadedAssets = new Set();
        this.pendingLoads = new Map();
        this.rootPath = this._calculateRootPath();
        this.currentPageDepth = this._calculatePageDepth();

        this._log('Inicializando Template Engine', {
            rootPath: this.rootPath,
            pageDepth: this.currentPageDepth,
            hostname: window.location.hostname,
            pathname: window.location.pathname
        });

        this.init();
    }

    /**
     * Calcula o caminho raiz do projeto automaticamente
     * Detecta GitHub Pages vs localhost
     */
    _calculateRootPath() {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
            return '/';
        }

        if (isGitHubPages) {
            // Extrai o nome do repositório da URL
            const pathname = window.location.pathname;
            const match = pathname.match(/^\/([^\/]+)\//);
            if (match) {
                return `/${match[1]}/`;
            }
        }

        return '/';
    }

    /**
     * Calcula a profundidade da página atual
     * Exemplo: /pt/sobre-nos/missao.html = profundidade 2
     */
    _calculatePageDepth() {
        const pathname = window.location.pathname;
        // Remove a raiz do projeto
        const rootPath = this.rootPath === '/' ? '' : this.rootPath;
        let relativePath = pathname.replace(rootPath, '');
        
        // Remove nome do arquivo
        relativePath = relativePath.substring(0, relativePath.lastIndexOf('/'));
        
        // Conta as barras para determinar profundidade
        const depth = relativePath.split('/').filter(part => part.length > 0).length;
        
        return Math.max(0, depth);
    }

    /**
     * Calcula o caminho relativo para assets baseado na profundidade da página
     */
    _getAssetsRelativePath() {
        if (this.currentPageDepth === 0) {
            return './assets/';
        }
        return '../'.repeat(this.currentPageDepth) + 'assets/';
    }

    /**
     * Obtém o caminho absoluto para um componente
     */
    _getComponentPath(fileName) {
        return this.rootPath + 'assets/components/' + fileName;
    }

    /**
     * Obtém o caminho absoluto para um arquivo CSS
     */
    _getCssPath(fileName) {
        return this.rootPath + 'assets/css/' + fileName;
    }

    /**
     * Obtém o caminho absoluto para um arquivo JS
     */
    _getJsPath(fileName) {
        return this.rootPath + 'assets/js/' + fileName;
    }

    /**
     * Inicializa o engine e carrega todos os componentes
     */
    async init() {
        try {
            // Aguarda o DOM estar completamente pronto
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }

            this._log('DOM pronto, iniciando carregamento de componentes');

            // 1. Carregar CSS global primeiro (evita FOUC)
            await this._loadCss('global.css');

            // 2. Carregar componentes principais
            await Promise.all([
                this._injectComponent('header-container', 'header.html', 'header'),
                this._injectComponent('footer-container', 'footer.html', 'footer'),
                this._injectComponent('modals-container', 'modals-main.html', 'modals')
            ]);

            // 3. Carregar scripts utilitários
            await this._loadJs('utils.js');
            await this._loadJs('console-cleaner.js');

            this._log('Todos os componentes carregados com sucesso');

            // Disparar evento customizado
            window.dispatchEvent(new CustomEvent('templateEngineReady', {
                detail: { engine: this }
            }));

        } catch (error) {
            console.error('Template Engine: Erro fatal ao inicializar', error);
            window.dispatchEvent(new CustomEvent('templateEngineError', {
                detail: { error }
            }));
        }
    }

    /**
     * Injeta um componente HTML em um container
     * Carrega automaticamente CSS e JS associados
     */
    async _injectComponent(containerId, fileName, assetName) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            this._warn(`Container #${containerId} não encontrado`);
            return;
        }

        try {
            const html = await this._fetchComponent(fileName);
            container.innerHTML = html;

            // Carregar CSS e JS associados
            if (assetName) {
                await Promise.all([
                    this._loadCss(`${assetName}.css`),
                    this._loadJs(`${assetName}.js`)
                ]);
            }

            this._log(`Componente ${fileName} injetado com sucesso`);

        } catch (error) {
            console.error(`Erro ao injetar componente ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Busca um componente com retry automático
     */
    async _fetchComponent(fileName) {
        const cacheKey = `component:${fileName}`;

        // Verificar cache
        if (this.config.cacheComponents && this.cache.has(cacheKey)) {
            this._log(`Usando cache para ${fileName}`);
            return this.cache.get(cacheKey);
        }

        // Verificar se já está sendo carregado
        if (this.pendingLoads.has(cacheKey)) {
            return this.pendingLoads.get(cacheKey);
        }

        // Criar promise de carregamento
        const loadPromise = this._fetchWithRetry(
            this._getComponentPath(fileName),
            this.config.retryAttempts,
            this.config.retryDelay
        ).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Não foi possível carregar ${fileName}`);
            }
            return response.text();
        }).then(html => {
            if (this.config.cacheComponents) {
                this.cache.set(cacheKey, html);
            }
            this.pendingLoads.delete(cacheKey);
            return html;
        }).catch(error => {
            this.pendingLoads.delete(cacheKey);
            throw error;
        });

        this.pendingLoads.set(cacheKey, loadPromise);
        return loadPromise;
    }

    /**
     * Carrega um arquivo CSS com verificação de duplicatas
     */
    async _loadCss(fileName) {
        const assetId = `css-${fileName}`;

        // Verificar se já foi carregado
        if (this.loadedAssets.has(assetId)) {
            this._log(`CSS ${fileName} já foi carregado`);
            return;
        }

        // Verificar se já existe no DOM
        if (document.getElementById(assetId)) {
            this.loadedAssets.add(assetId);
            return;
        }

        const link = document.createElement('link');
        link.id = assetId;
        link.rel = 'stylesheet';
        link.href = this._getCssPath(fileName);

        return new Promise((resolve, reject) => {
            link.onload = () => {
                this.loadedAssets.add(assetId);
                this._log(`CSS carregado: ${fileName}`);
                resolve();
            };

            link.onerror = () => {
                reject(new Error(`Falha ao carregar CSS: ${fileName}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Carrega um arquivo JavaScript com verificação de duplicatas
     */
    async _loadJs(fileName) {
        const assetId = `js-${fileName}`;

        // Verificar se já foi carregado
        if (this.loadedAssets.has(assetId)) {
            this._log(`JS ${fileName} já foi carregado`);
            return;
        }

        // Verificar se já existe no DOM
        if (document.getElementById(assetId)) {
            this.loadedAssets.add(assetId);
            return;
        }

        const script = document.createElement('script');
        script.id = assetId;
        script.src = this._getJsPath(fileName);
        script.defer = true;

        return new Promise((resolve, reject) => {
            script.onload = () => {
                this.loadedAssets.add(assetId);
                this._log(`JS carregado: ${fileName}`);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Falha ao carregar JS: ${fileName}`));
            };

            document.body.appendChild(script);
        });
    }

    /**
     * Fetch com retry automático
     */
    async _fetchWithRetry(url, attempts = 3, delay = 500) {
        let lastError;

        for (let i = 0; i < attempts; i++) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return response;
                }
                lastError = new Error(`HTTP ${response.status}`);
            } catch (error) {
                lastError = error;
            }

            if (i < attempts - 1) {
                this._log(`Retry ${i + 1}/${attempts - 1} para ${url}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    /**
     * Carrega um componente customizado em um container específico
     * Útil para modais ou componentes específicos de página
     */
    async load(containerId, fileName, assetName = null) {
        const container = document.getElementById(containerId);

        if (!container) {
            this._warn(`Container #${containerId} não encontrado para carregar ${fileName}`);
            return;
        }

        try {
            const html = await this._fetchComponent(fileName);
            container.innerHTML = html;

            if (assetName) {
                await Promise.all([
                    this._loadCss(`${assetName}.css`),
                    this._loadJs(`${assetName}.js`)
                ]);
            }

            this._log(`Componente customizado ${fileName} carregado em #${containerId}`);

        } catch (error) {
            console.error(`Erro ao carregar componente customizado ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Limpa o cache de componentes
     */
    clearCache() {
        this.cache.clear();
        this._log('Cache de componentes limpo');
    }

    /**
     * Obtém informações de debug
     */
    getDebugInfo() {
        return {
            rootPath: this.rootPath,
            currentPageDepth: this.currentPageDepth,
            assetsRelativePath: this._getAssetsRelativePath(),
            loadedAssets: Array.from(this.loadedAssets),
            cachedComponents: Array.from(this.cache.keys()),
            pendingLoads: Array.from(this.pendingLoads.keys()),
            config: this.config
        };
    }

    /**
     * Log com prefix
     */
    _log(message, data = null) {
        if (this.config.debug) {
            if (data) {
                console.log(`[TemplateEngine] ${message}`, data);
            } else {
                console.log(`[TemplateEngine] ${message}`);
            }
        }
    }

    /**
     * Warn com prefix
     */
    _warn(message) {
        console.warn(`[TemplateEngine] ${message}`);
    }
}

// Inicializar automaticamente quando o script for carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TemplateEngine = new TemplateEngine();
    }, { once: true });
} else {
    window.TemplateEngine = new TemplateEngine();
}
