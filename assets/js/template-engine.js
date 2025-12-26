/**
 * Template Engine v3.2.1 - Calculadoras de Enfermagem
 * AUDITORIA 2025: Correção de Race Conditions, Logs Melhorados e Restauração de Funcionalidades.
 * * Changelog:
 * - Adicionado listener para DOMContentLoaded (evita injeção em null).
 * - Melhorado tratamento de erro em _loadScript (reject explícito).
 * - Restaurado renderCard() da v3.1 (compatibilidade legada) com Proxy para Utils.
 * - Centralização do RootPath.
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
        
        this.initialized = false;
        
        // Garante que o DOM esteja pronto antes de iniciar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    _calculateRootPath() {
        return window.location.hostname.includes('github.io') ? '/Calculadoras-de-Enfermagem/' : '/';
    }

    async init() {
        if (this.initialized) return;
        
        try {
            console.time('TemplateEngine Load');
            
            // Carregamento paralelo de HTMLs e seus assets
            // Usamos Promise.all para performance, pois Header/Footer são independentes entre si
            await Promise.all([
                this._inject('header-container', 'header.html', 'header'),
                this._inject('footer-container', 'footer.html', 'footer'),
                this._inject('modals-container', 'modals-main.html', 'modals')
            ]);

            this.initialized = true;
            
            // Dispara evento para notificar o sistema (Legacy + Novo padrão)
            window.dispatchEvent(new Event('templateEngineReady'));
            window.dispatchEvent(new CustomEvent('TemplateEngine:Ready', { detail: { timestamp: Date.now() } }));
            
            console.timeEnd('TemplateEngine Load');

        } catch (error) {
            console.error('[TemplateEngine] Erro crítico na inicialização:', error);
            // Em produção, aqui poderia haver um fallback para uma tela de erro amigável
        }
    }

    async _inject(containerId, fileName, assetKey) {
        const container = document.getElementById(containerId);
        if (!container) {
            // Log silencioso (debug) pois nem todas as páginas usam todos os containers
            // console.debug(`[TemplateEngine] Container ignorado: ${containerId}`);
            return; 
        }

        try {
            const url = `${this.rootPath}assets/components/${fileName}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`Status ${response.status} ao carregar ${fileName}`);
            
            const html = await response.text();
            
            // Injeção do HTML
            container.innerHTML = html;

            // Carregamento Sequencial de Assets para este componente específico
            // Isso evita Race Condition onde o JS tenta manipular o DOM antes do CSS aplicar layout
            if (this.componentAssets[assetKey]) {
                const { js, css } = this.componentAssets[assetKey];
                
                // CSS primeiro (para evitar FOUC - Flash of Unstyled Content)
                if (css) this._loadCSS(`${this.rootPath}assets/css/${css}`);
                
                // JS depois (espera o download do script para garantir execução correta)
                if (js) await this._loadScript(`${this.rootPath}assets/js/${js}`);
            }

        } catch (error) {
            console.warn(`[TemplateEngine] Falha ao injetar componente '${assetKey}':`, error);
            container.innerHTML = '<!-- Component load failed -->';
        }
    }

    _loadCSS(href) {
        // Evita duplicidade
        if (document.querySelector(`link[href="${href}"]`)) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * Carregamento de script com Promise para garantir execução ordenada.
     * @param {string} src - Caminho do script
     */
    _loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verifica se já existe para evitar re-execução
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true; // Permite download paralelo, mas execução controlada pelo await no _inject
            
            script.onload = () => resolve();
            
            script.onerror = () => {
                // AUDITORIA: Mudado para reject para permitir tratamento adequado no caller
                const errorMsg = `[TemplateEngine] Falha crítica ao carregar script: ${src}`;
                console.error(errorMsg);
                reject(new Error(errorMsg)); 
            };
            
            document.body.appendChild(script);
        });
    }

    /**
     * Renderiza um card de ferramenta (calculadora, escala ou vacina).
     * * ESTRATÉGIA ANTI-DUPLICAÇÃO:
     * Este método atua como um proxy. Se 'Utils.renderCard' existir (nova arquitetura),
     * delegamos a renderização para lá. Caso contrário, usamos o fallback interno (legado).
     * * @param {Object} tool - Objeto da ferramenta
     * @param {Object} state - Estado da aplicação (viewMode)
     * @returns {string} HTML do card
     */
    renderCard(tool, state = {}) {
        // 1. Tenta delegar para Utils (Fonte única de verdade)
        if (typeof window.Utils !== 'undefined' && typeof window.Utils.renderCard === 'function') {
            return window.Utils.renderCard(tool, state);
        }

        // 2. Fallback: Implementação local para garantir funcionamento se Utils não carregar
        const viewMode = state.viewMode || 'grid';
        
        const colorMap = {
            'emerald': 'from-emerald-50 to-emerald-100 border-emerald-200',
            'blue': 'from-blue-50 to-blue-100 border-blue-200'
        };
        
        const bgClass = colorMap[tool.color] || colorMap['blue'];
        
        // List View
        if (viewMode === 'list') {
            return `
                <div class="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4">
                        <div class="text-2xl text-gray-600">
                            <i class="${tool.icon}"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900">${tool.name}</h3>
                            <p class="text-sm text-gray-600">${tool.category}</p>
                            <p class="text-sm text-gray-500 mt-1">${tool.description}</p>
                        </div>
                        <a href="${tool.filename}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Acessar
                        </a>
                    </div>
                </div>
            `;
        }
        
        // Grid View (Padrão)
        return `
            <div class="bg-gradient-to-br ${bgClass} border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div class="text-4xl mb-4 text-gray-700 group-hover:scale-110 transition-transform">
                    <i class="${tool.icon}"></i>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">${tool.name}</h3>
                <p class="text-sm text-gray-600 mb-3">${tool.category}</p>
                <p class="text-xs text-gray-600 mb-4 line-clamp-2">${tool.description}</p>
                <a href="${tool.filename}" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Acessar
                </a>
            </div>
        `;
    }
}

// Inicialização Global
// Mantemos ambas as convenções para compatibilidade retroativa (v3.1 usava TemplateEngine, v3.2 sugeriu templateEngine)
const instance = new TemplateEngine();
window.TemplateEngine = instance; // Compatibilidade com v3.1
window.templateEngine = instance; // Nova convenção camelCase