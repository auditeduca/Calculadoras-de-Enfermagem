/**
 * Template Engine v3.1 - Calculadoras de Enfermagem
 * Gerencia a injeção de componentes globais (Header, Footer, Modais)
 * e o carregamento de seus respectivos recursos (JS e CSS).
 * 
 * CORREÇÃO: Adicionado método renderCard() para compatibilidade com global-main-index.js
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

    /**
     * NOVO: Renderiza um card de ferramenta (calculadora, escala ou vacina)
     * 
     * Esta função foi adicionada para compatibilidade com global-main-index.js
     * que tentava chamar TemplateEngine.renderCard() que não existia.
     * 
     * @param {Object} tool - Objeto da ferramenta com propriedades: id, name, category, description, filename, icon, color, type
     * @param {Object} state - Estado da aplicação com propriedades: viewMode
     * @returns {string} HTML do card renderizado
     */
    renderCard(tool, state = {}) {
        const viewMode = state.viewMode || 'grid';
        
        const colorMap = {
            'emerald': 'from-emerald-50 to-emerald-100 border-emerald-200',
            'blue': 'from-blue-50 to-blue-100 border-blue-200'
        };
        
        const bgClass = colorMap[tool.color] || colorMap['blue'];
        
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
        
        // Grid view (padrão)
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

// Auto-inicialização
window.TemplateEngine = new TemplateEngine();
