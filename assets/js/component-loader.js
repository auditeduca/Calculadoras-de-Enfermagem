/**
 * ComponentLoader - Carregador Genérico de Componentes Modulares
 * 
 * Responsável por:
 * - Carregar componentes HTML dinamicamente
 * - Carregar scripts em sequência
 * - Gerenciar cache de componentes
 * - Tratamento de erros
 * - Emitir eventos de carregamento
 * 
 * @version 1.0.0
 * @author Calculadoras de Enfermagem
 */

class ComponentLoader {
    /**
     * Construtor do ComponentLoader
     * @param {Object} config - Configuração do loader
     */
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || '';
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.config = {
            cacheEnabled: config.cacheEnabled !== false,
            cacheExpiry: config.cacheExpiry || 3600000,
            timeout: config.timeout || 10000,
            retries: config.retries || 3,
            debug: config.debug || false
        };
        
        this._log('ComponentLoader inicializado', this.config);
    }

    /**
     * Carrega um componente HTML e o insere no DOM
     * @param {string} id - ID do container
     * @param {string} path - Caminho do arquivo HTML
     * @returns {Promise<boolean>}
     */
    async loadComponent(id, path) {
        if (!id || !path) {
            this._error('loadComponent: id e path são obrigatórios');
            return false;
        }

        const cacheKey = `component:${id}`;
        
        // Verificar cache
        if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheExpiry) {
                this._log(`Usando cache para ${id}`);
                return this._insertComponent(id, cached.html);
            } else {
                this.cache.delete(cacheKey);
            }
        }

        // Evitar carregamentos duplicados
        if (this.loadingPromises.has(cacheKey)) {
            this._log(`Aguardando carregamento em progresso para ${id}`);
            return this.loadingPromises.get(cacheKey);
        }

        const promise = this._loadComponentInternal(id, path);
        this.loadingPromises.set(cacheKey, promise);

        try {
            const result = await promise;
            this.loadingPromises.delete(cacheKey);
            return result;
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            this._error(`Erro ao carregar ${id}:`, error);
            return false;
        }
    }

    /**
     * Carregamento interno do componente com retry
     * @private
     */
    async _loadComponentInternal(id, path, attempt = 1) {
        try {
            const url = path.startsWith('http') ? path : this.baseUrl + path;
            const cacheUrl = `${url}?t=${Date.now()}`;
            
            this._log(`Carregando componente ${id} (tentativa ${attempt}/${this.config.retries})`);
            
            const response = await Promise.race([
                fetch(cacheUrl),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
                )
            ]);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const container = document.getElementById(id);

            if (!container) {
                this._warn(`Container #${id} não encontrado no DOM`);
                return false;
            }

            // Armazenar em cache
            if (this.config.cacheEnabled) {
                this.cache.set(`component:${id}`, {
                    html: html,
                    timestamp: Date.now()
                });
            }

            // Inserir no DOM
            return this._insertComponent(id, html);
        } catch (error) {
            if (attempt < this.config.retries) {
                this._warn(`Tentativa ${attempt} falhou, tentando novamente...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                return this._loadComponentInternal(id, path, attempt + 1);
            }
            
            this._error(`Erro ao carregar ${id} após ${this.config.retries} tentativas:`, error.message);
            return false;
        }
    }

    /**
     * Insere componente no DOM e emite evento
     * @private
     */
    _insertComponent(id, html) {
        try {
            const container = document.getElementById(id);
            if (!container) {
                this._warn(`Container #${id} não encontrado`);
                return false;
            }

            container.innerHTML = html;
            this._log(`Componente ${id} inserido no DOM`);
            
            // Emitir evento de conclusão
            if (window.EventBus) {
                window.EventBus.emit(`module:${id}:ready`, { id, html });
            }

            return true;
        } catch (error) {
            this._error(`Erro ao inserir componente ${id}:`, error.message);
            return false;
        }
    }

    /**
     * Carrega um script dinamicamente
     * @param {string} src - Caminho do script
     * @returns {Promise<boolean>}
     */
    async loadScript(src) {
        if (!src) {
            this._error('loadScript: src é obrigatório');
            return false;
        }

        return new Promise((resolve) => {
            try {
                const script = document.createElement('script');
                const scriptUrl = src.startsWith('http') 
                    ? src 
                    : this.baseUrl + src;
                
                script.src = `${scriptUrl}?v=${Date.now()}`;
                script.async = false;

                script.onload = () => {
                    this._log(`Script carregado: ${src}`);
                    resolve(true);
                };

                script.onerror = () => {
                    this._error(`Erro ao carregar script: ${src}`);
                    resolve(false);
                };

                document.body.appendChild(script);
            } catch (error) {
                this._error(`Erro ao criar script:`, error.message);
                resolve(false);
            }
        });
    }

    /**
     * Carrega múltiplos componentes em paralelo
     * @param {Array} components - Array de {id, path}
     * @returns {Promise<boolean>}
     */
    async loadComponents(components) {
        if (!Array.isArray(components) || components.length === 0) {
            this._error('loadComponents: componentes deve ser um array não vazio');
            return false;
        }

        this._log(`Carregando ${components.length} componentes em paralelo`);
        
        const results = await Promise.all(
            components.map(c => this.loadComponent(c.id, c.path))
        );
        
        const success = results.every(r => r === true);
        this._log(`Carregamento de componentes ${success ? 'concluído' : 'com erros'}`);
        
        return success;
    }

    /**
     * Carrega múltiplos scripts em sequência
     * @param {Array} scripts - Array de caminhos
     * @returns {Promise<boolean>}
     */
    async loadScripts(scripts) {
        if (!Array.isArray(scripts) || scripts.length === 0) {
            this._error('loadScripts: scripts deve ser um array não vazio');
            return false;
        }

        this._log(`Carregando ${scripts.length} scripts em sequência`);
        
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            this._log(`Carregando script ${i + 1}/${scripts.length}: ${script}`);
            
            const result = await this.loadScript(script);
            if (!result) {
                this._warn(`Falha ao carregar: ${script}`);
            }
        }
        
        return true;
    }

    /**
     * Limpa o cache
     */
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        this._log(`Cache limpo (${size} itens removidos)`);
    }

    /**
     * Obtém informações de cache
     */
    getCacheInfo() {
        return {
            size: this.cache.size,
            items: Array.from(this.cache.keys()),
            enabled: this.config.cacheEnabled
        };
    }

    /**
     * Funções de logging
     * @private
     */
    _log(message, data = null) {
        if (this.config.debug) {
            console.log(`[ComponentLoader] ${message}`, data || '');
        }
    }

    _warn(message, data = null) {
        console.warn(`[ComponentLoader] ${message}`, data || '');
    }

    _error(message, data = null) {
        console.error(`[ComponentLoader] ${message}`, data || '');
    }
}

// Exportar globalmente
window.ComponentLoader = ComponentLoader;

// Log de inicialização
if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.loader.debug) {
    console.log('[ComponentLoader] Classe carregada e disponível em window.ComponentLoader');
}
