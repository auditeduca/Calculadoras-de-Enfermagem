/**
 * PageInitializer - Inicializador de Página Modular
 * 
 * Responsável por:
 * - Orquestrar carregamento de componentes
 * - Gerenciar Event Bus
 * - Inicializar lógica de página
 * - Simplificar setup de novas páginas
 * 
 * @version 1.0.0
 * @author Calculadoras de Enfermagem
 */

class PageInitializer {
    /**
     * Construtor do PageInitializer
     * @param {Object} pageConfig - Configuração da página
     */
    constructor(pageConfig) {
        if (!pageConfig) {
            console.error('[PageInitializer] pageConfig é obrigatório');
            return;
        }

        this.pageConfig = pageConfig;
        this.loader = new window.ComponentLoader(
            (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.loader) || {}
        );
        this.initialized = false;
        this.startTime = Date.now();

        this._log('PageInitializer criado para página:', pageConfig.title);
    }

    /**
     * Inicializa a página carregando todos os componentes
     */
    async initialize() {
        if (this.initialized) {
            this._warn('Página já foi inicializada');
            return;
        }

        try {
            this._log('Iniciando carregamento de página...');

            // Criar Event Bus se não existir
            if (!window.EventBus) {
                this._createEventBus();
            }

            // Atualizar meta tags
            this._updateMetaTags();

            // Obter componentes a carregar
            const components = this._getComponentsToLoad();
            this._log(`Carregando ${components.length} componentes...`);
            
            // Carregar componentes em paralelo
            const componentsLoaded = await this.loader.loadComponents(components);
            if (!componentsLoaded) {
                this._warn('Alguns componentes falharam ao carregar');
            }

            // Obter scripts a carregar
            const scripts = this._getScriptsToLoad();
            this._log(`Carregando ${scripts.length} scripts...`);
            
            // Carregar scripts em sequência
            await this.loader.loadScripts(scripts);

            // Inicializar após delay para garantir DOM pronto
            setTimeout(() => {
                this._initializePageLogic();
                this._logPerformance();
            }, 300);

            this.initialized = true;
        } catch (error) {
            this._error('Erro ao inicializar página:', error);
        }
    }

    /**
     * Obtém lista de componentes a carregar
     * @private
     */
    _getComponentsToLoad() {
        const components = [];
        
        if (typeof SITE_CONFIG === 'undefined') {
            this._error('SITE_CONFIG não está definido');
            return components;
        }

        // Adicionar componentes compartilhados habilitados
        Object.values(SITE_CONFIG.components).forEach(component => {
            if (component.enabled !== false) {
                components.push({
                    id: component.id,
                    path: component.path
                });
            }
        });

        // Adicionar conteúdo principal da página
        if (this.pageConfig.path) {
            components.push({
                id: 'main-module-container',
                path: this.pageConfig.path
            });
        }

        return components;
    }

    /**
     * Obtém lista de scripts a carregar
     * @private
     */
    _getScriptsToLoad() {
        const scripts = [];

        if (typeof SITE_CONFIG === 'undefined') {
            this._error('SITE_CONFIG não está definido');
            return scripts;
        }

        // Adicionar scripts compartilhados
        if (Array.isArray(SITE_CONFIG.sharedScripts)) {
            scripts.push(...SITE_CONFIG.sharedScripts);
        }

        // Adicionar script específico da página
        if (this.pageConfig.script) {
            scripts.push(this.pageConfig.script);
        }

        return scripts;
    }

    /**
     * Cria Event Bus se não existir
     * @private
     */
    _createEventBus() {
        window.EventBus = {
            events: {},
            fired: {},
            
            on(event, callback) {
                const eventName = event.toLowerCase();
                if (!this.events[eventName]) {
                    this.events[eventName] = [];
                }
                this.events[eventName].push(callback);
                
                // Se evento já foi disparado, chamar callback imediatamente
                if (this.fired[eventName]) {
                    callback(this.fired[eventName]);
                }
            },
            
            emit(event, data) {
                const eventName = event.toLowerCase();
                this.fired[eventName] = data || true;
                
                if (this.events[eventName]) {
                    this.events[eventName].forEach(cb => {
                        try {
                            cb(data);
                        } catch (error) {
                            console.error(`[EventBus] Erro ao executar callback para ${eventName}:`, error);
                        }
                    });
                }
            },
            
            clear(event) {
                if (event) {
                    const eventName = event.toLowerCase();
                    delete this.events[eventName];
                    delete this.fired[eventName];
                } else {
                    this.events = {};
                    this.fired = {};
                }
            }
        };

        this._log('Event Bus criado');
    }

    /**
     * Atualiza meta tags da página
     * @private
     */
    _updateMetaTags() {
        try {
            // Atualizar title
            if (this.pageConfig.title) {
                document.title = `${this.pageConfig.title} | Calculadoras de Enfermagem`;
            }

            // Atualizar meta description
            if (this.pageConfig.description) {
                let metaDescription = document.querySelector('meta[name="description"]');
                if (!metaDescription) {
                    metaDescription = document.createElement('meta');
                    metaDescription.name = 'description';
                    document.head.appendChild(metaDescription);
                }
                metaDescription.content = this.pageConfig.description;
            }

            // Atualizar meta keywords
            if (this.pageConfig.keywords) {
                let metaKeywords = document.querySelector('meta[name="keywords"]');
                if (!metaKeywords) {
                    metaKeywords = document.createElement('meta');
                    metaKeywords.name = 'keywords';
                    document.head.appendChild(metaKeywords);
                }
                metaKeywords.content = this.pageConfig.keywords;
            }

            // Atualizar Open Graph
            if (this.pageConfig.title) {
                let ogTitle = document.querySelector('meta[property="og:title"]');
                if (!ogTitle) {
                    ogTitle = document.createElement('meta');
                    ogTitle.setAttribute('property', 'og:title');
                    document.head.appendChild(ogTitle);
                }
                ogTitle.content = `${this.pageConfig.title} | Calculadoras de Enfermagem`;
            }

            this._log('Meta tags atualizadas');
        } catch (error) {
            this._warn('Erro ao atualizar meta tags:', error.message);
        }
    }

    /**
     * Inicializa lógica específica da página
     * @private
     */
    _initializePageLogic() {
        try {
            // Chamar função de inicialização do header
            if (typeof window.HeaderInit === 'function') {
                this._log('Chamando HeaderInit()');
                window.HeaderInit();
            }

            // Chamar função de inicialização da página
            if (typeof window.MainInit === 'function') {
                this._log('Chamando MainInit()');
                window.MainInit();
            }

            // Remover loader se existir
            const loader = document.getElementById('loader-global');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }

            // Emitir evento de página pronta
            if (window.EventBus) {
                window.EventBus.emit('page:ready', { 
                    title: this.pageConfig.title,
                    timestamp: Date.now()
                });
            }

            this._log('Página inicializada com sucesso');
        } catch (error) {
            this._error('Erro ao inicializar lógica da página:', error);
        }
    }

    /**
     * Log de performance
     * @private
     */
    _logPerformance() {
        const duration = Date.now() - this.startTime;
        this._log(`Tempo total de carregamento: ${duration}ms`);

        if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.loader.debug) {
            console.table({
                'Página': this.pageConfig.title,
                'Tempo (ms)': duration,
                'Cache Info': this.loader.getCacheInfo()
            });
        }
    }

    /**
     * Funções de logging
     * @private
     */
    _log(message, data = null) {
        console.log(`[PageInitializer] ${message}`, data || '');
    }

    _warn(message, data = null) {
        console.warn(`[PageInitializer] ${message}`, data || '');
    }

    _error(message, data = null) {
        console.error(`[PageInitializer] ${message}`, data || '');
    }
}

// Exportar globalmente
window.PageInitializer = PageInitializer;

// Log de inicialização
console.log('[PageInitializer] Classe carregada e disponível em window.PageInitializer');
