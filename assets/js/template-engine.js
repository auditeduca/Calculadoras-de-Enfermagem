/**
 * Template Engine Final - Otimizado para Calculadoras de Enfermagem
 * 
 * Padrão de Sucesso:
 * 1. CSS carregados no HEAD (global.css, header.css, footer.css, modals.css)
 * 2. Containers vazios no BODY (#header-container, #footer-container, #modals-container)
 * 3. Scripts em ordem: console-cleaner.js → utils.js → template-engine.js
 * 4. Template Engine injeta HTML + carrega JS
 * 
 * Características:
 * - Suporte automático a estruturas de pastas profundas
 * - Injeção dinâmica de Header, Footer e Modais
 * - Carregamento de JS dos componentes
 * - Cache de componentes
 * - Tratamento robusto de erros
 * - Suporte a GitHub Pages e localhost
 * 
 * @author Calculadoras de Enfermagem
 * @version 3.0.0 (Final)
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
        this.loadedScripts = new Set();
        this.pendingLoads = new Map();
        this.rootPath = this._calculateRootPath();
        this.currentPageDepth = this._calculatePageDepth();

        // Mapeamento de componentes para seus scripts
        this.componentScripts = {
            'header': 'header.js',
            'footer': 'footer.js',
            'modals': 'modals.js'
        };

        this._log('🚀 Inicializando Template Engine v3.0', {
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

            this._log('✓ DOM pronto, iniciando carregamento de componentes');

            // Carregar componentes principais
            await Promise.all([
                this._injectComponentWithScript('header-container', 'header.html', 'header'),
                this._injectComponentWithScript('footer-container', 'footer.html', 'footer'),
                this._injectComponentWithScript('modals-container', 'modals-main.html', 'modals')
            ]);

            this._log('✅ Todos os componentes carregados com sucesso');
            this._logLoadedScripts();

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
     * Injeta um componente HTML e carrega seu script JS
     * 
     * Nota: CSS já deve estar carregado no HEAD
     */
    async _injectComponentWithScript(containerId, fileName, componentName) {
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

            // 2. Carregar JS do componente (CSS já está no HEAD)
            if (componentName && this.componentScripts[componentName]) {
                const jsFile = this.componentScripts[componentName];
                await this._loadScript(jsFile);
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
     * Carrega um arquivo JavaScript com verificação de duplicatas
     * Aguarda o carregamento completo antes de retornar
     */
    async _loadScript(fileName) {
        const assetId = `js-${fileName.replace(/\./g, '-')}`;

        // Verificar se já foi carregado
        if (this.loadedScripts.has(assetId)) {
            this._log(`📦 JS já carregado: ${fileName}`);
            return;
        }

        // Verificar se já existe no DOM
        if (document.getElementById(assetId)) {
            this.loadedScripts.add(assetId);
            this._log(`📦 JS já no DOM: ${fileName}`);
            return;
        }

        const script = document.createElement('script');
        script.id = assetId;
        script.src = this._getJsPath(fileName);
        script.defer = true;

        return new Promise((resolve, reject) => {
            script.onload = () => {
                this.loadedScripts.add(assetId);
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
                this.loadedScripts.add(assetId);
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
    async load(containerId, fileName, scriptName = null) {
        const container = document.getElementById(containerId);

        if (!container) {
            this._warn(`Container #${containerId} não encontrado para carregar ${fileName}`);
            return;
        }

        try {
            const html = await this._fetchComponent(fileName);
            container.innerHTML = html;

            // Carregar script associado se fornecido
            if (scriptName) {
                // Verificar se há mapeamento para este script
                if (this.componentScripts[scriptName]) {
                    const jsFile = this.componentScripts[scriptName];
                    await this._loadScript(jsFile);
                } else {
                    // Tentar carregar com o nome fornecido
                    await this._loadScript(`${scriptName}.js`);
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
            version: '3.0.0',
            rootPath: this.rootPath,
            currentPageDepth: this.currentPageDepth,
            loadedScripts: Array.from(this.loadedScripts),
            cachedComponents: Array.from(this.cache.keys()),
            pendingLoads: Array.from(this.pendingLoads.keys()),
            componentScripts: this.componentScripts,
            config: this.config,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Log resumido dos scripts carregados
     */
    _logLoadedScripts() {
        const debug = this.getDebugInfo();
        this._log('📊 Scripts Carregados:', {
            total: debug.loadedScripts.length,
            scripts: debug.loadedScripts
        });
    }

    /**
     * Log com prefix
     */
    _log(message, data = null) {
        if (this.config.debug) {
            if (data) {
                console.log(`[TemplateEngine v3.0] ${message}`, data);
            } else {
                console.log(`[TemplateEngine v3.0] ${message}`);
            }
        }
    }

    /**
     * Warn com prefix
     */
    _warn(message) {
        console.warn(`[TemplateEngine v3.0] ⚠️ ${message}`);
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
