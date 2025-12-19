/**
 * Template Engine v2.1 - Robusto para Calculadoras de Enfermagem
 * 
 * Características:
 * - Suporte automático a estruturas de pastas profundas
 * - Injeção dinâmica de Header, Footer e Modais
 * - Carregamento GARANTIDO de todos os CSS/JS dos componentes
 * - Cache de componentes
 * - Tratamento robusto de erros
 * - Suporte a modais específicos da página
 * - Suporte a GitHub Pages e localhost
 * 
 * Estrutura de Assets Esperada:
 * assets/
 * ├── components/
 * │   ├── header.html
 * │   ├── footer.html
 * │   └── modals-main.html
 * ├── css/
 * │   ├── global.css
 * │   ├── header.css
 * │   ├── footer.css
 * │   └── modals.css
 * └── js/
 *     ├── header.js
 *     ├── footer.js
 *     ├── modals.js
 *     ├── utils.js
 *     └── console-cleaner.js
 * 
 * @author Calculadoras de Enfermagem
 * @version 2.1.0
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

        // Mapeamento de componentes para seus assets
        this.componentAssets = {
            'header': { css: 'header.css', js: 'header.js' },
            'footer': { css: 'footer.css', js: 'footer.js' },
            'modals': { css: 'modals.css', js: 'modals.js' }
        };

        this._log('Inicializando Template Engine v2.1', {
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

            // 2. Carregar componentes principais COM seus assets
            await Promise.all([
                this._injectComponentWithAssets('header-container', 'header.html', 'header'),
                this._injectComponentWithAssets('footer-container', 'footer.html', 'footer'),
                this._injectComponentWithAssets('modals-container', 'modals-main.html', 'modals')
            ]);

            // 3. Carregar scripts utilitários
            await Promise.all([
                this._loadJs('utils.js'),
                this._loadJs('console-cleaner.js')
            ]);

            this._log('✓ Todos os componentes carregados com sucesso');
            this._logAssetsSummary();

            // Disparar evento customizado
            window.dispatchEvent(new CustomEvent('templateEngineReady', {
                detail: { engine: this }
            }));

        } catch (error) {
            console.error('❌ Template Engine: Erro fatal ao inicializar', error);
            window.dispatchEvent(new CustomEvent('templateEngineError', {
                detail: { error }
            }));
        }
    }

    /**
     * Injeta um componente HTML e carrega TODOS seus assets (CSS + JS)
     * Garante que CSS seja carregado ANTES do JS
     */
    async _injectComponentWithAssets(containerId, fileName, assetName) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            this._warn(`Container #${containerId} não encontrado`);
            return;
        }

        try {
            // 1. Buscar e injetar HTML do componente
            const html = await this._fetchComponent(fileName);
            container.innerHTML = html;
            this._log(`✓ HTML injetado: ${fileName}`);

            // 2. Carregar CSS do componente (ANTES do JS)
            if (assetName && this.componentAssets[assetName]) {
                const cssFile = this.componentAssets[assetName].css;
                await this._loadCss(cssFile);
                this._log(`✓ CSS carregado: ${cssFile}`);
            }

            // 3. Carregar JS do componente (DEPOIS do CSS)
            if (assetName && this.componentAssets[assetName]) {
                const jsFile = this.componentAssets[assetName].js;
                await this._loadJs(jsFile);
                this._log(`✓ JS carregado: ${jsFile}`);
            }

        } catch (error) {
            console.error(`❌ Erro ao injetar componente ${fileName}:`, error);
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
            this._log(`📦 Cache: ${fileName}`);
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
     * Aguarda o carregamento completo antes de retornar
     */
    async _loadCss(fileName) {
        const assetId = `css-${fileName.replace(/\./g, '-')}`;

        // Verificar se já foi carregado
        if (this.loadedAssets.has(assetId)) {
            this._log(`📦 CSS já carregado: ${fileName}`);
            return;
        }

        // Verificar se já existe no DOM
        if (document.getElementById(assetId)) {
            this.loadedAssets.add(assetId);
            this._log(`📦 CSS já no DOM: ${fileName}`);
            return;
        }

        const link = document.createElement('link');
        link.id = assetId;
        link.rel = 'stylesheet';
        link.href = this._getCssPath(fileName);

        return new Promise((resolve, reject) => {
            link.onload = () => {
                this.loadedAssets.add(assetId);
                this._log(`✓ CSS carregado: ${fileName}`);
                resolve();
            };

            link.onerror = () => {
                reject(new Error(`❌ Falha ao carregar CSS: ${fileName}`));
            };

            // Timeout de 10 segundos
            const timeout = setTimeout(() => {
                reject(new Error(`⏱ Timeout ao carregar CSS: ${fileName}`));
            }, 10000);

            link.onload = () => {
                clearTimeout(timeout);
                this.loadedAssets.add(assetId);
                this._log(`✓ CSS carregado: ${fileName}`);
                resolve();
            };

            link.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`❌ Falha ao carregar CSS: ${fileName}`));
            };

            document.head.appendChild(link);
        });
    }

    /**
     * Carrega um arquivo JavaScript com verificação de duplicatas
     * Aguarda o carregamento completo antes de retornar
     */
    async _loadJs(fileName) {
        const assetId = `js-${fileName.replace(/\./g, '-')}`;

        // Verificar se já foi carregado
        if (this.loadedAssets.has(assetId)) {
            this._log(`📦 JS já carregado: ${fileName}`);
            return;
        }

        // Verificar se já existe no DOM
        if (document.getElementById(assetId)) {
            this.loadedAssets.add(assetId);
            this._log(`📦 JS já no DOM: ${fileName}`);
            return;
        }

        const script = document.createElement('script');
        script.id = assetId;
        script.src = this._getJsPath(fileName);
        script.defer = true;

        return new Promise((resolve, reject) => {
            script.onload = () => {
                this.loadedAssets.add(assetId);
                this._log(`✓ JS carregado: ${fileName}`);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`❌ Falha ao carregar JS: ${fileName}`));
            };

            // Timeout de 10 segundos
            const timeout = setTimeout(() => {
                reject(new Error(`⏱ Timeout ao carregar JS: ${fileName}`));
            }, 10000);

            script.onload = () => {
                clearTimeout(timeout);
                this.loadedAssets.add(assetId);
                this._log(`✓ JS carregado: ${fileName}`);
                resolve();
            };

            script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`❌ Falha ao carregar JS: ${fileName}`));
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
                this._log(`🔄 Retry ${i + 1}/${attempts - 1} para ${url}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    /**
     * Carrega um componente customizado em um container específico
     * Útil para modais específicos da página ou componentes adicionais
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

            // Carregar CSS e JS associados se fornecidos
            if (assetName) {
                // Verificar se há mapeamento para este asset
                if (this.componentAssets[assetName]) {
                    const cssFile = this.componentAssets[assetName].css;
                    const jsFile = this.componentAssets[assetName].js;
                    
                    await this._loadCss(cssFile);
                    await this._loadJs(jsFile);
                } else {
                    // Tentar carregar com o nome fornecido
                    await this._loadCss(`${assetName}.css`);
                    await this._loadJs(`${assetName}.js`);
                }
            }

            this._log(`✓ Componente customizado ${fileName} carregado em #${containerId}`);

        } catch (error) {
            console.error(`❌ Erro ao carregar componente customizado ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Carrega modais específicos da página
     * Útil para páginas que têm modais customizados além dos globais
     */
    async loadPageSpecificModals(fileName) {
        const container = document.getElementById('specific-page-modals');
        
        if (!container) {
            this._warn('Container #specific-page-modals não encontrado');
            return;
        }

        try {
            const html = await this._fetchComponent(fileName);
            container.innerHTML = html;
            this._log(`✓ Modais específicos da página carregados: ${fileName}`);
        } catch (error) {
            console.error(`❌ Erro ao carregar modais específicos: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Limpa o cache de componentes
     */
    clearCache() {
        this.cache.clear();
        this._log('🗑 Cache de componentes limpo');
    }

    /**
     * Obtém informações de debug
     */
    getDebugInfo() {
        return {
            version: '2.1.0',
            rootPath: this.rootPath,
            currentPageDepth: this.currentPageDepth,
            loadedAssets: Array.from(this.loadedAssets),
            cachedComponents: Array.from(this.cache.keys()),
            pendingLoads: Array.from(this.pendingLoads.keys()),
            componentAssets: this.componentAssets,
            config: this.config,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Log resumido dos assets carregados
     */
    _logAssetsSummary() {
        const debug = this.getDebugInfo();
        this._log('📊 Resumo de Assets Carregados:', {
            total: debug.loadedAssets.length,
            assets: debug.loadedAssets
        });
    }

    /**
     * Log com prefix
     */
    _log(message, data = null) {
        if (this.config.debug) {
            if (data) {
                console.log(`[TemplateEngine v2.1] ${message}`, data);
            } else {
                console.log(`[TemplateEngine v2.1] ${message}`);
            }
        }
    }

    /**
     * Warn com prefix
     */
    _warn(message) {
        console.warn(`[TemplateEngine v2.1] ⚠️ ${message}`);
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
