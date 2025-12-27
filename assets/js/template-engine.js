/**
 * Template Engine v3.2.3 - Correção de IDs e BaseURL
 * Correções:
 * - IDs alinhados com index.html (main-header, main-footer, modal-container).
 * - Uso de AppConfig.baseUrl para garantir caminhos absolutos.
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

        // Garante que AppConfig esteja disponível ou usa fallback
        this.baseUrl = (window.AppConfig && window.AppConfig.baseUrl) 
            ? window.AppConfig.baseUrl 
            : this.rootPath;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    _calculateRootPath() {
        // Fallback caso AppConfig não exista
        return window.location.hostname.includes('github.io') 
            ? '/Calculadoras-de-Enfermagem/' 
            : '/';
    }

    async init() {
        if (this.initialized) return;

        try {
            console.time('TemplateEngine Load');

            // CORREÇÃO: IDs atualizados para bater com o index.html
            await Promise.all([
                this._inject('main-header', 'header.html', 'header'),
                this._inject('main-footer', 'footer.html', 'footer'),
                this._inject('modal-container', 'modals-main.html', 'modals')
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
        if (!container) {
            console.warn(`[TemplateEngine] Container ID '${containerId}' não encontrado no HTML.`);
            return;
        }

        try {
            // Usa baseUrl completa para evitar erros de caminho relativo
            const url = `${this.baseUrl}assets/components/${fileName}`;
            // console.debug(`[TemplateEngine] Carregando: ${url}`); // Descomente para debug

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status} ao carregar ${fileName}`);

            const html = await response.text();
            container.innerHTML = html;

            if (this.componentAssets[assetKey]) {
                const { js, css } = this.componentAssets[assetKey];

                if (css) {
                    // Carrega CSS
                    const link = this._loadCSS(`${this.baseUrl}assets/css/${css}`);
                    
                    // Se tiver JS, carrega após o CSS (opcional, mas bom para evitar FOUC)
                    if (js) {
                        // Pequeno delay ou promise pode ser usado aqui se necessário
                        await this._loadScript(`${this.baseUrl}assets/js/${js}`);
                    }
                } else if (js) {
                    await this._loadScript(`${this.baseUrl}assets/js/${js}`);
                }
            }
        } catch (error) {
            console.warn(`[TemplateEngine] Falha ao injetar componente '${assetKey}':`, error);
            // Mostra erro visualmente apenas em dev/local se quiser
            // container.innerHTML = `<div style="color:red; font-size: 10px;">Erro: ${fileName}</div>`;
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
                const errorMsg = `[TemplateEngine] Falha ao carregar script: ${src}`;
                console.error(errorMsg);
                // Não rejeita para não travar Promise.all de outros componentes
                resolve(); 
            };
            document.body.appendChild(script);
        });
    }

    renderCard(tool, state = {}) {
        if (typeof window.Utils !== 'undefined' && typeof window.Utils.renderCard === 'function') {
            return window.Utils.renderCard(tool, state);
        }
        // Fallback simples caso Utils não esteja pronto
        return `<div class="p-4 border"><b>${tool.name}</b><br>${tool.description}</div>`;
    }
}

const instance = new TemplateEngine();
window.TemplateEngine = instance;
window.templateEngine = instance;