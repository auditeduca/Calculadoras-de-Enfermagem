/**
 * Template Engine v3.2.2 - Ajustes de Compatibilidade
 * Correções:
 * - Caminhos logados para debug.
 * - Garantia de ordem de execução (async=false).
 * - CSS aguarda onload antes de JS (evita FOUC).
 * - Mensagens de erro mais visíveis em dev.
 */

class TemplateEngine {
    constructor() {
        this.rootPath = this._calculateRootPath();

        this.componentAssets = {
            'header': { js: 'header.js', css: 'header.css' },
            'footer': { js: 'footer.js', css: 'footer.css' },
            'modals': { js: 'modals.js', css: 'modals.css' }
        };

        this.initialized = false;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    _calculateRootPath() {
        return window.location.hostname.includes('github.io') 
            ? '/Calculadoras-de-Enfermagem/' 
            : '/';
    }

    async init() {
        if (this.initialized) return;

        try {
            console.time('TemplateEngine Load');

            await Promise.all([
                this._inject('header-container', 'header.html', 'header'),
                this._inject('footer-container', 'footer.html', 'footer'),
                this._inject('modals-container', 'modals-main.html', 'modals')
            ]);

            this.initialized = true;

            window.dispatchEvent(new Event('templateEngineReady'));
            window.dispatchEvent(new CustomEvent('TemplateEngine:Ready', { detail: { timestamp: Date.now() } }));

            console.timeEnd('TemplateEngine Load');
        } catch (error) {
            console.error('[TemplateEngine] Erro crítico na inicialização:', error);
        }
    }

    async _inject(containerId, fileName, assetKey) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const url = `${this.rootPath}assets/components/${fileName}`;
            console.debug(`[TemplateEngine] Carregando: ${url}`);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status} ao carregar ${fileName}`);

            const html = await response.text();
            container.innerHTML = html;

            if (this.componentAssets[assetKey]) {
                const { js, css } = this.componentAssets[assetKey];

                if (css) {
                    const link = this._loadCSS(`${this.rootPath}assets/css/${css}`);
                    if (js) {
                        await new Promise(resolve => {
                            link.onload = () => this._loadScript(`${this.rootPath}assets/js/${js}`).then(resolve);
                        });
                    }
                } else if (js) {
                    await this._loadScript(`${this.rootPath}assets/js/${js}`);
                }
            }
        } catch (error) {
            console.warn(`[TemplateEngine] Falha ao injetar componente '${assetKey}':`, error);
            container.innerHTML = `<div style="color:red">Erro ao carregar ${fileName}</div>`;
        }
    }

    _loadCSS(href) {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        return link;
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = false; // garante ordem
            script.defer = true;  // executa após parse do DOM
            script.onload = () => resolve();
            script.onerror = () => {
                const errorMsg = `[TemplateEngine] Falha crítica ao carregar script: ${src}`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
            };
            document.body.appendChild(script);
        });
    }

    renderCard(tool, state = {}) {
        if (typeof window.Utils !== 'undefined' && typeof window.Utils.renderCard === 'function') {
            return window.Utils.renderCard(tool, state);
        }

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
                        <div class="text-2xl text-gray-600"><i class="${tool.icon}"></i></div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900">${tool.name}</h3>
                            <p class="text-sm text-gray-600">${tool.category}</p>
                            <p class="text-sm text-gray-500 mt-1">${tool.description}</p>
                        </div>
                        <a href="${tool.filename}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Acessar</a>
                    </div>
                </div>
            `;
        }

        return `
            <div class="bg-gradient-to-br ${bgClass} border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div class="text-4xl mb-4 text-gray-700 group-hover:scale-110 transition-transform"><i class="${tool.icon}"></i></div>
                <h3 class="font-semibold text-gray-900 mb-2">${tool.name}</h3>
                <p class="text-sm text-gray-600 mb-3">${tool.category}</p>
                <p class="text-xs text-gray-600 mb-4 line-clamp-2">${tool.description}</p>
                <a href="${tool.filename}" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Acessar</a>
            </div>
        `;
    }
}

const instance = new TemplateEngine();
window.TemplateEngine = instance;
window.templateEngine = instance;
